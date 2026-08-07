import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "sales_summary",
  title: "Sales summary",
  description: "Summarise sales totals, order count and top-selling products for the signed-in user over a date range.",
  inputSchema: {
    fromDate: z.string().optional().describe("ISO date; defaults to 30 days ago."),
    toDate: z.string().optional().describe("ISO date; defaults to now."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ fromDate, toDate }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const from = fromDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to = toDate ?? new Date().toISOString();

    const { data, error } = await supabase
      .from("orders")
      .select("total,items,order_date")
      .gte("order_date", from)
      .lte("order_date", to);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const orders = data ?? [];
    const revenue = orders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
    const productTotals = new Map<string, { quantity: number; revenue: number }>();

    for (const order of orders) {
      const items = Array.isArray(order.items) ? (order.items as Array<Record<string, unknown>>) : [];
      for (const item of items) {
        const name = String(item.name ?? "Unknown");
        const quantity = Number(item.quantity ?? 0);
        const price = Number(item.price ?? 0);
        const entry = productTotals.get(name) ?? { quantity: 0, revenue: 0 };
        entry.quantity += quantity;
        entry.revenue += quantity * price;
        productTotals.set(name, entry);
      }
    }

    const topProducts = [...productTotals.entries()]
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const summary = {
      from,
      to,
      orderCount: orders.length,
      revenue: Number(revenue.toFixed(2)),
      averageOrderValue: orders.length ? Number((revenue / orders.length).toFixed(2)) : 0,
      topProducts,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
