import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "create_product",
  title: "Create product",
  description: "Create a new inventory product for the signed-in user.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Product name."),
    price: z.number().nonnegative().optional().describe("Selling price."),
    stock: z.number().optional().describe("Opening stock quantity."),
    minStock: z.number().optional().describe("Low-stock threshold."),
    category: z.string().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    unit: z.string().optional().describe("Unit such as pcs, kg, ltr."),
    weight: z.number().optional(),
    description: z.string().optional(),
    expiryDate: z.string().optional().describe("ISO date of expiry."),
    priceIncludesGst: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const { data, error } = await s.supabase
      .from("products")
      .insert({
        user_id: s.userId,
        name: input.name,
        price: input.price ?? 0,
        stock: input.stock ?? 0,
        min_stock: input.minStock ?? 0,
        category: input.category ?? null,
        sku: input.sku ?? null,
        barcode: input.barcode ?? null,
        unit: input.unit ?? "pcs",
        weight: input.weight ?? 0,
        description: input.description ?? null,
        expiry_date: input.expiryDate ?? null,
        price_includes_gst: input.priceIncludesGst ?? false,
      })
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    return ok({ product: data });
  },
});
