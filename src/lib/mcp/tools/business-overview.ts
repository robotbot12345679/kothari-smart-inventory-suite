import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "business_overview",
  title: "Business overview",
  description:
    "Dashboard-style snapshot: inventory valuation, stock alerts, order and revenue totals, supplier outstanding and top customers.",
  inputSchema: {
    days: z.number().int().min(1).max(365).optional().describe("Window for sales metrics, default 30 days."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const window = days ?? 30;
    const from = new Date(Date.now() - window * 86400000).toISOString();
    const [{ data: products, error: pErr }, { data: orders, error: oErr }, { data: customers }, { data: suppliers }] =
      await Promise.all([
        s.supabase.from("products").select("id,name,stock,min_stock,price,expiry_date,is_active"),
        s.supabase.from("orders").select("total,order_date,order_status,payment_status").gte("order_date", from),
        s.supabase.from("customers").select("id,name,total_orders,total_spent").order("total_spent", { ascending: false }).limit(10),
        s.supabase.from("suppliers").select("id,name,bills,payments"),
      ]);
    if (pErr) return fail(pErr.message);
    if (oErr) return fail(oErr.message);

    const inventoryValue = (products ?? []).reduce((t, p) => t + Number(p.stock) * Number(p.price), 0);
    const revenue = (orders ?? []).reduce((t, o) => t + Number(o.total ?? 0), 0);
    const supplierOutstanding = (suppliers ?? []).map((sup) => {
      const bills = Array.isArray(sup.bills) ? (sup.bills as { amount?: number }[]) : [];
      const payments = Array.isArray(sup.payments) ? (sup.payments as { amount?: number }[]) : [];
      const billed = bills.reduce((t, b) => t + Number(b.amount ?? 0), 0);
      const paid = payments.reduce((t, p) => t + Number(p.amount ?? 0), 0);
      return { id: sup.id, name: sup.name, outstanding: Number((billed - paid).toFixed(2)) };
    });

    return ok({
      windowDays: window,
      products: {
        total: products?.length ?? 0,
        active: (products ?? []).filter((p) => p.is_active).length,
        outOfStock: (products ?? []).filter((p) => Number(p.stock) <= 0).length,
        lowStock: (products ?? []).filter((p) => Number(p.stock) > 0 && Number(p.stock) <= Number(p.min_stock)).length,
        inventoryValue: Number(inventoryValue.toFixed(2)),
      },
      sales: {
        orderCount: orders?.length ?? 0,
        revenue: Number(revenue.toFixed(2)),
        averageOrderValue: orders?.length ? Number((revenue / orders.length).toFixed(2)) : 0,
        pendingPayments: (orders ?? []).filter((o) => o.payment_status !== "paid").length,
      },
      topCustomers: customers ?? [],
      supplierOutstanding: supplierOutstanding.sort((a, b) => b.outstanding - a.outstanding),
      totalSupplierOutstanding: Number(supplierOutstanding.reduce((t, x) => t + x.outstanding, 0).toFixed(2)),
    });
  },
});
