import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "record_supplier_entry",
  title: "Record supplier bill or payment",
  description: "Append a purchase bill or a payment to a supplier's ledger and return the updated outstanding balance.",
  inputSchema: {
    supplierId: z.string(),
    entryType: z.enum(["bill", "payment"]),
    amount: z.number().positive(),
    date: z.string().optional().describe("ISO date, defaults to now."),
    reference: z.string().optional().describe("Bill number or payment reference."),
    notes: z.string().optional(),
    paymentMode: z.string().optional().describe("cash, upi, bank transfer (payments only)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ supplierId, entryType, amount, date, reference, notes, paymentMode }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const { data: supplier, error: readError } = await s.supabase
      .from("suppliers")
      .select("id,name,bills,payments")
      .eq("id", supplierId)
      .maybeSingle();
    if (readError) return fail(readError.message);
    if (!supplier) return fail(`No supplier found with id ${supplierId}`);
    const bills = Array.isArray(supplier.bills) ? [...(supplier.bills as unknown[])] : [];
    const payments = Array.isArray(supplier.payments) ? [...(supplier.payments as unknown[])] : [];
    const entry = {
      id: crypto.randomUUID(),
      amount,
      date: date ?? new Date().toISOString(),
      reference: reference ?? null,
      notes: notes ?? null,
      ...(entryType === "payment" ? { paymentMode: paymentMode ?? "cash" } : {}),
    };
    if (entryType === "bill") bills.push(entry);
    else payments.push(entry);
    const { error } = await s.supabase
      .from("suppliers")
      .update({ bills, payments, updated_at: new Date().toISOString() })
      .eq("id", supplierId);
    if (error) return fail(error.message);
    const billed = bills.reduce((t, b) => t + Number((b as { amount?: number }).amount ?? 0), 0);
    const paid = payments.reduce((t, p) => t + Number((p as { amount?: number }).amount ?? 0), 0);
    return ok({
      supplier: supplier.name,
      entry,
      totalBilled: Number(billed.toFixed(2)),
      totalPaid: Number(paid.toFixed(2)),
      outstanding: Number((billed - paid).toFixed(2)),
    });
  },
});
