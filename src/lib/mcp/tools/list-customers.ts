import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_customers",
  title: "List customers",
  description: "List or search customers of the signed-in user, including contact details and lifetime spend.",
  inputSchema: {
    search: z.string().optional().describe("Case-insensitive match on customer name."),
    limit: z.number().int().min(1).max(10000).optional().describe("Maximum rows to return (default 1000)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("customers")
      .select("id,name,phone,email,address,city,state,status,total_orders,total_spent,last_order_date")
      .order("total_spent", { ascending: false })
      .limit(limit ?? 1000);

    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { count: data?.length ?? 0, customers: data ?? [] },
    };
  },
});
