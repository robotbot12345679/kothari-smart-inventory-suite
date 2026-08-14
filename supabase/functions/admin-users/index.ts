import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const DEFAULT_PASSWORD = "user@4646";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const admin = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

async function sendCredentialsEmail(to: string, password: string, roleName: string, orgName: string) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!lovableKey || !resendKey) return { sent: false, error: "Email service is not configured" };

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1f2937">
      <h2 style="margin:0 0 8px">Your ${orgName} account is ready</h2>
      <p style="color:#4b5563">You have been given the <strong>${roleName}</strong> access level.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0 0 6px"><strong>User ID:</strong> ${to}</p>
        <p style="margin:0"><strong>Temporary password:</strong> ${password}</p>
      </div>
      <p style="color:#4b5563">For security you will be asked to choose a new password the first time you sign in.
      The temporary password cannot be used to change billing settings.</p>
    </div>`;

  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: `${orgName} <onboarding@resend.dev>`,
      to: [to],
      subject: `Your ${orgName} login credentials`,
      html,
    }),
  });

  if (!res.ok) {
    const details = await res.text();
    console.error(`Resend request failed [${res.status}]: ${details}`);
    return { sent: false, error: `Email failed (${res.status}): ${details}` };
  }
  return { sent: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Missing authorization" }, 401);

    const service = admin();
    const { data: userData, error: userError } = await service.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "Invalid session" }, 401);
    const caller = userData.user;

    const { data: org } = await service
      .from("organizations")
      .select("id, name, owner_id")
      .eq("owner_id", caller.id)
      .maybeSingle();

    if (!org) return json({ error: "Only the organization owner can manage users" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    if (action === "create_user") {
      const email = String(body?.email ?? "").trim().toLowerCase();
      const displayName = String(body?.display_name ?? "").trim() || email.split("@")[0];
      const roleId = body?.role_id ? String(body.role_id) : null;
      const sendEmail = body?.send_email !== false;

      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Enter a valid email address" }, 400);

      const { data: created, error: createError } = await service.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });
      if (createError || !created?.user) return json({ error: createError?.message ?? "Could not create user" }, 400);

      const newUser = created.user;

      await service.from("profiles").upsert({
        id: newUser.id,
        org_id: org.id,
        email,
        display_name: displayName,
        must_change_password: true,
        is_active: true,
      });

      let roleName = "No access level";
      if (roleId) {
        await service.from("user_roles").insert({ user_id: newUser.id, role_id: roleId, org_id: org.id });
        const { data: role } = await service.from("access_roles").select("name").eq("id", roleId).maybeSingle();
        roleName = role?.name ?? roleName;
      }

      let emailResult: { sent: boolean; error?: string } = { sent: false };
      if (sendEmail) emailResult = await sendCredentialsEmail(email, DEFAULT_PASSWORD, roleName, org.name);

      return json({ user_id: newUser.id, email, default_password: DEFAULT_PASSWORD, email: emailResult });
    }

    if (action === "send_credentials") {
      const userId = String(body?.user_id ?? "");
      const reset = body?.reset !== false;
      const { data: profile } = await service
        .from("profiles")
        .select("id, email, org_id")
        .eq("id", userId)
        .maybeSingle();
      if (!profile || profile.org_id !== org.id) return json({ error: "User not found" }, 404);

      if (reset) {
        await service.auth.admin.updateUserById(userId, { password: DEFAULT_PASSWORD });
        await service.from("profiles").update({ must_change_password: true }).eq("id", userId);
      }

      const { data: assignment } = await service
        .from("user_roles")
        .select("access_roles(name)")
        .eq("user_id", userId)
        .maybeSingle();
      const roleName = (assignment as any)?.access_roles?.name ?? "No access level";

      const result = await sendCredentialsEmail(profile.email!, DEFAULT_PASSWORD, roleName, org.name);
      if (!result.sent) return json({ error: result.error ?? "Email failed" }, 502);
      return json({ sent: true });
    }

    if (action === "reset_password") {
      const userId = String(body?.user_id ?? "");
      const { data: profile } = await service.from("profiles").select("id, org_id").eq("id", userId).maybeSingle();
      if (!profile || profile.org_id !== org.id) return json({ error: "User not found" }, 404);
      await service.auth.admin.updateUserById(userId, { password: DEFAULT_PASSWORD });
      await service.from("profiles").update({ must_change_password: true }).eq("id", userId);
      return json({ reset: true, default_password: DEFAULT_PASSWORD });
    }

    if (action === "delete_user") {
      const userId = String(body?.user_id ?? "");
      if (userId === caller.id) return json({ error: "You cannot delete your own account" }, 400);
      const { data: profile } = await service.from("profiles").select("id, org_id").eq("id", userId).maybeSingle();
      if (!profile || profile.org_id !== org.id) return json({ error: "User not found" }, 404);
      await service.from("user_roles").delete().eq("user_id", userId);
      await service.from("profiles").delete().eq("id", userId);
      await service.auth.admin.deleteUser(userId);
      return json({ deleted: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    console.error("admin-users error", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
