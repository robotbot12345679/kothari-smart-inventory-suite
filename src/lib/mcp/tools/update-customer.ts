import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "update_customer",
  title: "Update or delete customer",
  description: "Update a customer's details, or delete the customer when `deleteCustomer` is true.",
  inputSchema: {
    customerId: z.string(),
    deleteCustomer: z.boolean().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    birthday: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional().describe("e.g. Active or Inactive."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ customerId, deleteCustomer, ...input }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    if (deleteCustomer) {
      const { error } = await s.supabase.from("customers").delete().eq("id", customerId);
      if (error) return fail(error.message);
      return ok({ deleted: customerId }, `Deleted customer ${customerId}`);
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [key, column] of Object.entries({
      name: "name",
      phone: "phone",
      email: "email",
      address: "address",
      city: "city",
      state: "state",
      pincode: "pincode",
      birthday: "birthday",
      notes: "notes",
      status: "status",
    })) {
      const value = (input as Record<string, unknown>)[key];
      if (value !== undefined) patch[column] = value;
    }
    const { data, error } = await s.supabase
      .from("customers")
      .update(patch)
      .eq("id", customerId)
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail(`No customer found with id ${customerId}`);
    return ok({ customer: data });
  },
});
