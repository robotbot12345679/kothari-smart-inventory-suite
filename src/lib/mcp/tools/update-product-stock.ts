import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_product_stock",
  title: "Update product stock",
  description:
    "Set or adjust the stock quantity of one product owned by the signed-in user. Use `mode: 'adjust'` to add/subtract, `mode: 'set'` to overwrite.",
  inputSchema: {
    productId: z.string().describe("The product's id."),
    quantity: z.number().describe("Quantity to set, or the delta when adjusting (may be negative)."),
    mode: z.enum(["set", "adjust"]).optional().describe("Defaults to 'adjust'."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ productId, quantity, mode }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: existing, error: readError } = await supabase
      .from("products")
      .select("id,name,stock")
      .eq("id", productId)
      .maybeSingle();

    if (readError) return { content: [{ type: "text", text: readError.message }], isError: true };
    if (!existing) return { content: [{ type: "text", text: `No product found with id ${productId}` }], isError: true };

    const nextStock = (mode ?? "adjust") === "set" ? quantity : Number(existing.stock) + quantity;
    if (nextStock < 0) {
      return { content: [{ type: "text", text: "Resulting stock would be negative." }], isError: true };
    }

    const { data, error } = await supabase
      .from("products")
      .update({ stock: nextStock, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .select("id,name,stock")
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `${data?.name}: stock is now ${data?.stock}` }],
      structuredContent: { product: data },
    };
  },
});
