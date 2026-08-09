import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "list_suppliers",
  title: "List suppliers",
  description: "List suppliers with their bills, payments and outstanding balance.",
  inputSchema: {
    search: z.string().optional().describe("Case-insensitive match on supplier name."),
    includeLedger: z.boolean().optional().describe("Include the full bills and payments arrays (default true)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, includeLedger }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    let q = s.supabase.from("suppliers").select("*").order("name");
    if (search) q = q.ilike("name", `%${search}%`);
    const { data, error } = await q;
    if (error) return fail(error.message);
    const suppliers = (data ?? []).map((sup) => {
      const bills = Array.isArray(sup.bills) ? (sup.bills as Record<string, unknown>[]) : [];
      const payments = Array.isArray(sup.payments) ? (sup.payments as Record<string, unknown>[]) : [];
      const billed = bills.reduce((t, b) => t + Number((b as { amount?: number }).amount ?? 0), 0);
      const paid = payments.reduce((t, p) => t + Number((p as { amount?: number }).amount ?? 0), 0);
      const base = {
        id: sup.id,
        name: sup.name,
        contact_person: sup.contact_person,
        phone: sup.phone,
        email: sup.email,
        address: sup.address,
        totalBilled: Number(billed.toFixed(2)),
        totalPaid: Number(paid.toFixed(2)),
        outstanding: Number((billed - paid).toFixed(2)),
      };
      return includeLedger === false ? base : { ...base, bills, payments };
    });
    return ok({ count: suppliers.length, suppliers });
  },
});
