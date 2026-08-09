import type { ToolContext } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "./supabase";

export function ok(data: unknown, text?: string) {
  return {
    content: [{ type: "text" as const, text: text ?? JSON.stringify(data, null, 2) }],
    structuredContent: (data && typeof data === "object" ? (data as Record<string, unknown>) : { value: data }),
  };
}

export function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

export function session(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) return null;
  const userId = ctx.getUserId();
  if (!userId) return null;
  return { supabase: supabaseForUser(ctx), userId };
}

export const NOT_AUTHED = "Not authenticated. Connect this MCP server with your account first.";
