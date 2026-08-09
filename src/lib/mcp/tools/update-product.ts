import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "update_product",
  title: "Update product",
  description: "Update any field of an existing product (name, price, category, thresholds, expiry, active flag).",
  inputSchema: {
    productId: z.string().describe("Product id."),
    name: z.string().optional(),
    price: z.number().nonnegative().optional(),
    minStock: z.number().optional(),
    category: z.string().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    unit: z.string().optional(),
    weight: z.number().optional(),
    description: z.string().optional(),
    expiryDate: z.string().optional(),
    isActive: z.boolean().optional(),
    priceIncludesGst: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ productId, ...input }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) patch.name = input.name;
    if (input.price !== undefined) patch.price = input.price;
    if (input.minStock !== undefined) patch.min_stock = input.minStock;
    if (input.category !== undefined) patch.category = input.category;
    if (input.sku !== undefined) patch.sku = input.sku;
    if (input.barcode !== undefined) patch.barcode = input.barcode;
    if (input.unit !== undefined) patch.unit = input.unit;
    if (input.weight !== undefined) patch.weight = input.weight;
    if (input.description !== undefined) patch.description = input.description;
    if (input.expiryDate !== undefined) patch.expiry_date = input.expiryDate;
    if (input.isActive !== undefined) patch.is_active = input.isActive;
    if (input.priceIncludesGst !== undefined) patch.price_includes_gst = input.priceIncludesGst;
    const { data, error } = await s.supabase
      .from("products")
      .update(patch)
      .eq("id", productId)
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail(`No product found with id ${productId}`);
    return ok({ product: data });
  },
});
