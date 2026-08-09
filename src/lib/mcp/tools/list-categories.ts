import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description: "List product categories for the signed-in user.",
  inputSchema: {
    activeOnly: z.boolean().optional().describe("Only return active categories."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ activeOnly }, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    let q = s.supabase.from("categories").select("*").order("name");
    if (activeOnly) q = q.eq("is_active", true);
    const { data, error } = await q;
    if (error) return fail(error.message);
    return ok({ count: data?.length ?? 0, categories: data ?? [] });
  },
});
