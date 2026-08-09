import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "get_product",
  title: "Get product",
  description: "Fetch a single product by id, SKU or barcode.",
  inputSchema: {
    id: z.string().optional().describe("Product id."),
    sku: z.string().optional().describe("Product SKU."),
    barcode: z.string().optional().describe("Product barcode."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, sku, barcode }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    if (!id && !sku && !barcode) return fail("Provide id, sku or barcode.");
    let q = s.supabase.from("products").select("*").limit(1);
    if (id) q = q.eq("id", id);
    else if (sku) q = q.eq("sku", sku);
    else if (barcode) q = q.eq("barcode", barcode!);
    const { data, error } = await q.maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail("Product not found.");
    return ok({ product: data });
  },
});
