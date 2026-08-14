import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/context/PermissionsContext";
import { DEFAULT_USER_PASSWORD } from "@/lib/permissions";
import { KeyRound, Mail, Trash2, UserPlus } from "lucide-react";

interface Row {
  id: string;
  email: string | null;
  display_name: string | null;
  must_change_password: boolean;
  is_active: boolean;
  role_id: string | null;
}

const UserManagement = () => {
  const { roles, organization, refresh } = usePermissions();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const load = useCallback(async () => {
    const [{ data: profiles }, { data: assignments }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("user_roles").select("user_id, role_id"),
    ]);
    setRows(
      ((profiles ?? []) as any[]).map((p) => ({
        id: p.id,
        email: p.email,
        display_name: p.display_name,
        must_change_password: p.must_change_password,
        is_active: p.is_active,
        role_id: (assignments ?? []).find((a: any) => a.user_id === p.id)?.role_id ?? null,
      }))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const call = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("admin-users", { body });
    if (error) {
      const details = (error as any)?.context?.text ? await (error as any).context.text() : error.message;
      throw new Error(details);
    }
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as any;
  };

  const createUser = async () => {
    if (!email.trim()) {
      toast({ title: "Email required", description: "Enter the user's email address.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const result = await call({
        action: "create_user",
        email: email.trim(),
        display_name: name.trim(),
        role_id: roleId || null,
        send_email: true,
      });
      const emailInfo = result?.email;
      toast({
        title: "User created",
        description: emailInfo?.sent
          ? `Credentials were emailed to ${email.trim()}.`
          : `Account created. Default password: ${DEFAULT_USER_PASSWORD}. Email not sent: ${emailInfo?.error ?? "unknown reason"}`,
        variant: emailInfo?.sent ? "default" : "destructive",
      });
      setEmail("");
      setName("");
      setRoleId("");
      await load();
    } catch (err: any) {
      toast({ title: "Could not create user", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const assignRole = async (row: Row, newRoleId: string) => {
    if (!organization) return;
    try {
      await supabase.from("user_roles").delete().eq("user_id", row.id);
      if (newRoleId !== "none") {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: row.id, role_id: newRoleId, org_id: organization.id });
        if (error) throw error;
      }
      toast({ title: "Access level updated", description: `${row.email} was updated.` });
      await load();
      await refresh();
    } catch (err: any) {
      toast({ title: "Could not update access", description: err.message, variant: "destructive" });
    }
  };

  const sendCredentials = async (row: Row) => {
    setBusy(true);
    try {
      await call({ action: "send_credentials", user_id: row.id, reset: true });
      toast({ title: "Credentials sent", description: `A fresh default password was emailed to ${row.email}.` });
      await load();
    } catch (err: any) {
      toast({ title: "Could not send credentials", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (row: Row) => {
    setBusy(true);
    try {
      await call({ action: "reset_password", user_id: row.id });
      toast({ title: "Password reset", description: `${row.email} is back on the default password.` });
      await load();
    } catch (err: any) {
      toast({ title: "Could not reset password", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await call({ action: "delete_user", user_id: deleteTarget.id });
      toast({ title: "User removed", description: `${deleteTarget.email} no longer has access.` });
      await load();
    } catch (err: any) {
      toast({ title: "Could not remove user", description: err.message, variant: "destructive" });
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Users & credentials</h2>
        <p className="text-muted-foreground">
          Create accounts, give them an access level and email their login details automatically
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Add a user
          </CardTitle>
          <CardDescription>
            The account starts on the default password <span className="font-mono">{DEFAULT_USER_PASSWORD}</span> and
            the user must set their own password on first sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="person@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-name">Display name</Label>
              <Input
                id="new-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Access level</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an access level" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={createUser} disabled={busy}>
            <Mail className="mr-2 h-4 w-4" />
            {busy ? "Working..." : "Create user & email credentials"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing users</CardTitle>
          <CardDescription>Change access levels, resend credentials or remove access</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Access level</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const isOwner = row.id === organization?.owner_id;
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.display_name ?? "—"}</div>
                        <div className="text-sm text-muted-foreground">{row.email}</div>
                      </TableCell>
                      <TableCell>
                        {isOwner ? (
                          <Badge>Owner (full access)</Badge>
                        ) : (
                          <Select
                            value={row.role_id ?? "none"}
                            onValueChange={(v) => assignRole(row, v)}
                          >
                            <SelectTrigger className="w-[190px]">
                              <SelectValue placeholder="No access" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No access</SelectItem>
                              {roles.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.must_change_password ? (
                          <Badge variant="destructive">Default — must change</Badge>
                        ) : (
                          <Badge variant="secondary">Set by user</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy || isOwner}
                            onClick={() => sendCredentials(row)}
                          >
                            <Mail className="mr-2 h-3.5 w-3.5" /> Send credentials
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy || isOwner}
                            onClick={() => resetPassword(row)}
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={busy || isOwner}
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove user</DialogTitle>
            <DialogDescription>
              {deleteTarget?.email} will lose access immediately and their account will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteUser} disabled={busy}>
              <Trash2 className="mr-2 h-4 w-4" /> Remove user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
