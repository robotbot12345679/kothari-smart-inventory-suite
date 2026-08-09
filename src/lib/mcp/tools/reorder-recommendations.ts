import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "reorder_recommendations",
  title: "Reorder recommendations & expiry risk",
  description:
    "Return the raw signals an AI assistant needs to recommend reorders: per-product sales velocity, days of cover, suggested reorder quantity, plus products expiring in the next 7 and 30 days.",
  inputSchema: {
    lookbackDays: z.number().int().min(1).max(365).optional().describe("Sales history window, default 30 days."),
    coverDays: z.number().int().min(1).max(180).optional().describe("Days of stock cover to target, default 14."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ lookbackDays, coverDays }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const days = lookbackDays ?? 30;
    const cover = coverDays ?? 14;
    const from = new Date(Date.now() - days * 86400000).toISOString();

    const [{ data: products, error: pErr }, { data: orders, error: oErr }] = await Promise.all([
      s.supabase.from("products").select("id,name,sku,category,stock,min_stock,price,unit,expiry_date,is_active"),
      s.supabase.from("orders").select("items,order_date").gte("order_date", from),
    ]);
    if (pErr) return fail(pErr.message);
    if (oErr) return fail(oErr.message);

    const sold = new Map<string, number>();
    for (const order of orders ?? []) {
      const items = Array.isArray(order.items) ? (order.items as Record<string, unknown>[]) : [];
      for (const item of items) {
        const key = String(item.id ?? item.name ?? "");
        sold.set(key, (sold.get(key) ?? 0) + Number(item.quantity ?? 0));
      }
    }

    const now = Date.now();
    const rows = (products ?? []).map((p) => {
      const qty = sold.get(p.id) ?? sold.get(p.name) ?? 0;
      const perDay = qty / days;
      const stock = Number(p.stock);
      const daysOfCover = perDay > 0 ? Number((stock / perDay).toFixed(1)) : null;
      const target = Math.ceil(perDay * cover);
      const suggestedReorderQty = Math.max(0, Math.max(target, Number(p.min_stock)) - stock);
      const expiryDays = p.expiry_date ? Math.ceil((new Date(p.expiry_date).getTime() - now) / 86400000) : null;
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unit: p.unit,
        price: Number(p.price),
        stock,
        minStock: Number(p.min_stock),
        soldInWindow: qty,
        dailyVelocity: Number(perDay.toFixed(3)),
        daysOfCover,
        suggestedReorderQty,
        belowMinStock: stock <= Number(p.min_stock),
        expiryDate: p.expiry_date,
        daysToExpiry: expiryDays,
      };
    });

    const summary = {
      lookbackDays: days,
      targetCoverDays: cover,
      reorderNow: rows.filter((r) => r.suggestedReorderQty > 0).sort((a, b) => b.suggestedReorderQty - a.suggestedReorderQty),
      lowStock: rows.filter((r) => r.belowMinStock),
      deadStock: rows.filter((r) => r.soldInWindow === 0 && r.stock > 0),
      expiringIn7Days: rows.filter((r) => r.daysToExpiry !== null && r.daysToExpiry! <= 7),
      expiringIn30Days: rows.filter((r) => r.daysToExpiry !== null && r.daysToExpiry! <= 30),
      expired: rows.filter((r) => r.daysToExpiry !== null && r.daysToExpiry! < 0),
    };
    return ok(summary);
  },
});
