import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "manage_category",
  title: "Create, update or delete a category",
  description: "Create, update or delete a product category. Set `action` to 'create', 'update' or 'delete'.",
  inputSchema: {
    action: z.enum(["create", "update", "delete"]),
    categoryId: z.string().optional().describe("Required for update and delete."),
    name: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ action, categoryId, name, description, isActive }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    if (action === "create") {
      if (!name) return fail("`name` is required to create a category.");
      const { data, error } = await s.supabase
        .from("categories")
        .insert({ user_id: s.userId, name, description: description ?? null, is_active: isActive ?? true })
        .select()
        .maybeSingle();
      if (error) return fail(error.message);
      return ok({ category: data });
    }
    if (!categoryId) return fail("`categoryId` is required.");
    if (action === "delete") {
      const { error } = await s.supabase.from("categories").delete().eq("id", categoryId);
      if (error) return fail(error.message);
      return ok({ deleted: categoryId }, `Deleted category ${categoryId}`);
    }
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) patch.name = name;
    if (description !== undefined) patch.description = description;
    if (isActive !== undefined) patch.is_active = isActive;
    const { data, error } = await s.supabase
      .from("categories")
      .update(patch)
      .eq("id", categoryId)
      .select()
      .maybeSingle();
    if (error) return fail(error.message);
    return ok({ category: data });
  },
});
