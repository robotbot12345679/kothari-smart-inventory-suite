import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "create_customer",
  title: "Create customer",
  description: "Add a new customer record. Phone numbers default to the +91 country code when no code is given.",
  inputSchema: {
    name: z.string().trim().min(1),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    birthday: z.string().optional(),
    notes: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const phone = input.phone
      ? input.phone.trim().startsWith("+")
        ? input.phone.trim()
        : `+91${input.phone.replace(/\D/g, "")}`
      : null;
    const { data, error } = await s.supabase
      .from("customers")
      .insert({
        user_id: s.userId,
        name: input.name,
        phone,
        email: input.email ?? null,
        address: input.address ?? null,
        city: input.city ?? null,
        state: input.state ?? null,
        pincode: input.pincode ?? null,
        birthday: input.birthday ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    return ok({ customer: data });
  },
});
