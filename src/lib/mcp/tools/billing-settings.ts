import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, session, NOT_AUTHED } from "../util";

export default defineTool({
  name: "billing_settings",
  title: "Read or update billing settings",
  description: "Read the shop's billing/invoice template (shop name, address, GSTIN, footer), or update it when fields are supplied.",
  inputSchema: {
    shopName: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    gstNumber: z.string().optional(),
    footerText: z.array(z.string()).optional(),
    logoUrl: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const s = session(ctx);
    if (!s) return fail(NOT_AUTHED);
    const { data: existing, error } = await s.supabase.from("settings").select("*").maybeSingle();
    if (error) return fail(error.message);
    const template = (existing?.billing_template as Record<string, unknown>) ?? {};
    const updates = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined));
    if (Object.keys(updates).length === 0) return ok({ billingTemplate: template });
    const next = { ...template, ...updates };
    if (existing) {
      const { error: upErr } = await s.supabase
        .from("settings")
        .update({ billing_template: next, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (upErr) return fail(upErr.message);
    } else {
      const { error: insErr } = await s.supabase
        .from("settings")
        .insert({ user_id: s.userId, billing_template: next });
      if (insErr) return fail(insErr.message);
    }
    return ok({ billingTemplate: next });
  },
});
