import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "pos_submit_payment",
  title: "Submit POS payment",
  description:
    "Complete a POS sale: creates the order with GST invoice details, decrements product stock and updates the customer's lifetime totals. Returns the created order and invoice summary.",
  inputSchema: {
    items: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().positive(),
          price: z.number().nonnegative().optional(),
        }),
      )
      .min(1),
    paymentMethod: z.string().optional().describe("cash, card, upi, etc. Defaults to cash."),
    gstRate: z.number().min(0).max(100).optional().describe("GST percentage (default 0)."),
    discount: z.number().min(0).optional(),
    customerId: z.string().optional().describe("Existing customer id."),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().optional(),
    orderStatus: z.string().optional().describe("Defaults to 'completed'."),
    paymentStatus: z.string().optional().describe("Defaults to 'paid'."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const ids = input.items.map((i) => i.productId);
    const { data: products, error: readError } = await s.supabase
      .from("products")
      .select("id,name,price,stock,unit")
      .in("id", ids);
    if (readError) return fail(readError.message);
    const byId = new Map((products ?? []).map((p) => [p.id, p]));
    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length) return fail(`Unknown product ids: ${missing.join(", ")}`);
    const short = input.items.filter((i) => Number(byId.get(i.productId)!.stock) < i.quantity);
    if (short.length) {
      return fail(
        `Insufficient stock for: ${short
          .map((i) => `${byId.get(i.productId)!.name} (have ${byId.get(i.productId)!.stock}, need ${i.quantity})`)
          .join("; ")}`,
      );
    }

    const orderItems = input.items.map((i) => {
      const p = byId.get(i.productId)!;
      const price = i.price ?? Number(p.price);
      return { id: p.id, name: p.name, unit: p.unit, quantity: i.quantity, price, total: Number((price * i.quantity).toFixed(2)) };
    });
    const subtotal = Number(orderItems.reduce((t, l) => t + l.total, 0).toFixed(2));
    const discounted = Math.max(0, subtotal - (input.discount ?? 0));
    const gst = Number((discounted * ((input.gstRate ?? 0) / 100)).toFixed(2));
    const total = Number((discounted + gst).toFixed(2));
    const phone = input.customerPhone
      ? input.customerPhone.trim().startsWith("+")
        ? input.customerPhone.trim()
        : `+91${input.customerPhone.replace(/\D/g, "")}`
      : null;

    const { data: order, error: orderError } = await s.supabase
      .from("orders")
      .insert({
        user_id: s.userId,
        items: orderItems,
        subtotal,
        gst,
        total,
        payment_method: input.paymentMethod ?? "cash",
        payment_status: input.paymentStatus ?? "paid",
        order_status: input.orderStatus ?? "completed",
        status: input.orderStatus ?? "completed",
        customer_id: input.customerId ?? null,
        customer_name: input.customerName ?? null,
        customer_phone: phone,
        customer_email: input.customerEmail ?? null,
        order_date: new Date().toISOString(),
      })
      .select()
      .maybeSingle();
    if (orderError) return fail(orderError.message);

    const stockErrors: string[] = [];
    for (const line of orderItems) {
      const p = byId.get(line.id)!;
      const { error } = await s.supabase
        .from("products")
        .update({ stock: Number(p.stock) - line.quantity, updated_at: new Date().toISOString() })
        .eq("id", line.id);
      if (error) stockErrors.push(`${line.name}: ${error.message}`);
    }

    if (input.customerId) {
      const { data: customer } = await s.supabase
        .from("customers")
        .select("total_orders,total_spent")
        .eq("id", input.customerId)
        .maybeSingle();
      if (customer) {
        await s.supabase
          .from("customers")
          .update({
            total_orders: Number(customer.total_orders ?? 0) + 1,
            total_spent: Number(customer.total_spent ?? 0) + total,
            last_order_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.customerId);
      }
    }

    const { data: settings } = await s.supabase.from("settings").select("billing_template").maybeSingle();

    return ok({
      order,
      invoice: {
        invoiceNumber: order?.id,
        date: order?.order_date,
        items: orderItems,
        subtotal,
        discount: input.discount ?? 0,
        gstRate: input.gstRate ?? 0,
        gst,
        total,
        paymentMethod: input.paymentMethod ?? "cash",
        customer: { id: input.customerId ?? null, name: input.customerName ?? null, phone, email: input.customerEmail ?? null },
        seller: settings?.billing_template ?? null,
      },
      stockErrors,
    });
  },
});
