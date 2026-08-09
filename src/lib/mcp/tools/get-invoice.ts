import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "get_invoice",
  title: "Get GST invoice",
  description: "Build the full GST invoice payload for an order, including seller billing details from settings.",
  inputSchema: { orderId: z.string().describe("Order id.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ orderId }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const { data: order, error } = await s.supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (error) return fail(error.message);
    if (!order) return fail(`No order found with id ${orderId}`);
    const { data: settings } = await s.supabase.from("settings").select("billing_template").maybeSingle();
    return ok({
      invoice: {
        invoiceNumber: order.id,
        date: order.order_date,
        customer: {
          id: order.customer_id,
          name: order.customer_name,
          phone: order.customer_phone,
          email: order.customer_email,
          shippingAddress: order.shipping_address,
        },
        items: order.items,
        subtotal: order.subtotal,
        gst: order.gst,
        total: order.total,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status,
        seller: settings?.billing_template ?? null,
      },
    });
  },
});
