import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List inventory products for the signed-in user, optionally filtered by a name/SKU/barcode search term or by low stock.",
  inputSchema: {
    search: z.string().optional().describe("Case-insensitive match on product name."),
    category: z.string().optional().describe("Filter by product category."),
    lowStockOnly: z.boolean().optional().describe("Only return products at or below their minimum stock level."),
    limit: z.number().int().min(1).max(10000).optional().describe("Maximum rows to return (default 1000)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, category, lowStockOnly, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("products")
      .select("id,name,sku,barcode,category,price,stock,min_stock,unit,is_active,expiry_date")
      .order("name", { ascending: true })
      .limit(limit ?? 1000);

    if (search) query = query.ilike("name", `%${search}%`);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = (lowStockOnly ? (data ?? []).filter((p) => Number(p.stock) <= Number(p.min_stock)) : data) ?? [];
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { count: rows.length, products: rows },
    };
  },
});
