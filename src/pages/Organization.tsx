import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/context/PermissionsContext";

interface Member {
  id: string;
  email: string | null;
  display_name: string | null;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  roleName: string;
}

const Organization = () => {
  const { organization, roles } = usePermissions();
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const [{ data: profiles }, { data: assignments }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("user_roles").select("user_id, role_id"),
      ]);

      const roleFor = (userId: string) => {
        const roleId = (assignments ?? []).find((a: any) => a.user_id === userId)?.role_id;
        return roles.find((r) => r.id === roleId)?.name ?? "—";
      };

      setMembers(
        ((profiles ?? []) as any[]).map((p) => ({
          id: p.id,
          email: p.email,
          display_name: p.display_name,
          is_active: p.is_active,
          must_change_password: p.must_change_password,
          created_at: p.created_at,
          roleName: p.id === organization?.owner_id ? "Owner (full access)" : roleFor(p.id),
        }))
      );
    };
    load();
  }, [roles, organization]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.email?.toLowerCase().includes(q) ||
        m.display_name?.toLowerCase().includes(q) ||
        m.roleName.toLowerCase().includes(q)
    );
  }, [members, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Building2 className="h-7 w-7 text-primary" />
            Organization
          </h1>
          <p className="text-muted-foreground">
            {organization?.name ?? "Your organization"} · everyone linked to this workspace
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search users or access levels"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-sm text-muted-foreground">Total users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{members.filter((m) => m.is_active).length}</div>
            <p className="text-sm text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-sm text-muted-foreground">Access levels</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Users
          </CardTitle>
          <CardDescription>All accounts that can sign in to this organization</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email / User ID</TableHead>
                  <TableHead>Access level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.display_name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{m.roleName}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.is_active ? "default" : "outline"}>
                        {m.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {m.must_change_password ? (
                        <Badge variant="destructive">Default — reset pending</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">Set by user</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Organization;
