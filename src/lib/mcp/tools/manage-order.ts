import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "manage_order",
  title: "Update or delete an order",
  description:
    "Update an existing order's status, payment details, shipping address or tracking number, or delete it when `deleteOrder` is true.",
  inputSchema: {
    orderId: z.string(),
    deleteOrder: z.boolean().optional(),
    orderStatus: z.string().optional(),
    paymentStatus: z.string().optional(),
    paymentMethod: z.string().optional(),
    shippingAddress: z.string().optional(),
    trackingNumber: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ orderId, deleteOrder, ...input }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    if (deleteOrder) {
      const { error } = await s.supabase.from("orders").delete().eq("id", orderId);
      if (error) return fail(error.message);
      return ok({ deleted: orderId }, `Deleted order ${orderId}`);
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.orderStatus !== undefined) {
      patch.order_status = input.orderStatus;
      patch.status = input.orderStatus;
    }
    if (input.paymentStatus !== undefined) patch.payment_status = input.paymentStatus;
    if (input.paymentMethod !== undefined) patch.payment_method = input.paymentMethod;
    if (input.shippingAddress !== undefined) patch.shipping_address = input.shippingAddress;
    if (input.trackingNumber !== undefined) patch.tracking_number = input.trackingNumber;
    const { data, error } = await s.supabase.from("orders").update(patch).eq("id", orderId).select().maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail(`No order found with id ${orderId}`);
    return ok({ order: data });
  },
});
