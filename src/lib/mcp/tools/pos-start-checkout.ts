import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "pos_start_checkout",
  title: "Start POS checkout",
  description:
    "Price a POS cart before payment: validates products, checks stock availability and returns a quote with line items, subtotal, GST and total. Does not change any data.",
  inputSchema: {
    items: z
      .array(
        z.object({
          productId: z.string().describe("Product id."),
          quantity: z.number().positive().describe("Quantity to sell."),
          price: z.number().nonnegative().optional().describe("Override unit price."),
        }),
      )
      .min(1),
    gstRate: z.number().min(0).max(100).optional().describe("GST percentage applied to the subtotal (default 0)."),
    discount: z.number().min(0).optional().describe("Flat discount amount on the subtotal."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ items, gstRate, discount }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const ids = items.map((i) => i.productId);
    const { data, error } = await s.supabase
      .from("products")
      .select("id,name,price,stock,unit")
      .in("id", ids);
    if (error) return fail(error.message);
    const byId = new Map((data ?? []).map((p) => [p.id, p]));
    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length) return fail(`Unknown product ids: ${missing.join(", ")}`);

    const lines = items.map((i) => {
      const p = byId.get(i.productId)!;
      const unitPrice = i.price ?? Number(p.price);
      return {
        productId: p.id,
        name: p.name,
        unit: p.unit,
        quantity: i.quantity,
        price: unitPrice,
        lineTotal: Number((unitPrice * i.quantity).toFixed(2)),
        availableStock: Number(p.stock),
        insufficientStock: Number(p.stock) < i.quantity,
      };
    });
    const subtotal = Number(lines.reduce((t, l) => t + l.lineTotal, 0).toFixed(2));
    const discounted = Math.max(0, subtotal - (discount ?? 0));
    const gst = Number((discounted * ((gstRate ?? 0) / 100)).toFixed(2));
    const quote = {
      lines,
      subtotal,
      discount: discount ?? 0,
      gstRate: gstRate ?? 0,
      gst,
      total: Number((discounted + gst).toFixed(2)),
      stockWarnings: lines.filter((l) => l.insufficientStock).map((l) => `${l.name}: only ${l.availableStock} left`),
    };
    return ok(quote);
  },
});
