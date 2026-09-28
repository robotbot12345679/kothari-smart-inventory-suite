import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_orders",
  title: "List orders",
  description: "List recent sales orders for the signed-in user, newest first, optionally filtered by status or date range.",
  inputSchema: {
    status: z.string().optional().describe("Filter by order_status, e.g. 'completed' or 'pending'."),
    fromDate: z.string().optional().describe("ISO date; only orders on or after this date."),
    toDate: z.string().optional().describe("ISO date; only orders on or before this date."),
    limit: z.number().int().min(1).max(10000).optional().describe("Maximum rows to return (default 1000)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, fromDate, toDate, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("orders")
      .select("id,order_date,customer_name,customer_phone,items,subtotal,gst,total,payment_method,payment_status,order_status")
      .order("order_date", { ascending: false })
      .limit(limit ?? 1000);

    if (status) query = query.eq("order_status", status);
    if (fromDate) query = query.gte("order_date", fromDate);
    if (toDate) query = query.lte("order_date", toDate);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { count: data?.length ?? 0, orders: data ?? [] },
    };
  },
});
