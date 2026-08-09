import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "delete_product",
  title: "Delete product",
  description: "Permanently delete a product, or deactivate it instead when `softDelete` is true.",
  inputSchema: {
    productId: z.string().describe("Product id."),
    softDelete: z.boolean().optional().describe("Mark inactive instead of deleting."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ productId, softDelete }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    if (softDelete) {
      const { data, error } = await s.supabase
        .from("products")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", productId)
        .select("id,name,is_active")
        .maybeSingle();
      if (error) return fail(error.message);
      return ok({ product: data }, `Deactivated ${data?.name ?? productId}`);
    }
    const { error } = await s.supabase.from("products").delete().eq("id", productId);
    if (error) return fail(error.message);
    return ok({ deleted: productId }, `Deleted product ${productId}`);
  },
});
