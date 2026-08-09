import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "manage_supplier",
  title: "Create, update or delete a supplier",
  description: "Create, update or delete a supplier record. Set `action` to 'create', 'update' or 'delete'.",
  inputSchema: {
    action: z.enum(["create", "update", "delete"]),
    supplierId: z.string().optional().describe("Required for update and delete."),
    name: z.string().optional(),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ action, supplierId, ...input }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    if (action === "create") {
      if (!input.name) return fail("`name` is required to create a supplier.");
      const { data, error } = await s.supabase
        .from("suppliers")
        .insert({
          user_id: s.userId,
          name: input.name,
          contact_person: input.contactPerson ?? null,
          phone: input.phone ?? null,
          email: input.email ?? null,
          address: input.address ?? null,
          bills: [],
          payments: [],
        })
        .select()
        .maybeSingle();
      if (error) return fail(error.message);
      return ok({ supplier: data });
    }
    if (!supplierId) return fail("`supplierId` is required.");
    if (action === "delete") {
      const { error } = await s.supabase.from("suppliers").delete().eq("id", supplierId);
      if (error) return fail(error.message);
      return ok({ deleted: supplierId }, `Deleted supplier ${supplierId}`);
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name !== undefined) patch.name = input.name;
    if (input.contactPerson !== undefined) patch.contact_person = input.contactPerson;
    if (input.phone !== undefined) patch.phone = input.phone;
    if (input.email !== undefined) patch.email = input.email;
    if (input.address !== undefined) patch.address = input.address;
    const { data, error } = await s.supabase.from("suppliers").update(patch).eq("id", supplierId).select().maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail(`No supplier found with id ${supplierId}`);
    return ok({ supplier: data });
  },
});
