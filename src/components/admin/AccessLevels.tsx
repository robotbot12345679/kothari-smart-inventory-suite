import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions, AccessRole } from "@/context/PermissionsContext";
import { PERMISSION_CATALOG, ALL_PERMISSIONS } from "@/lib/permissions";
import { Plus, ShieldCheck, Trash2, Pencil, Lock } from "lucide-react";

const emptyDraft = { id: "", name: "", description: "", permissions: [] as string[] };

const AccessLevels = () => {
  const { roles, organization, refresh } = usePermissions();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AccessRole | null>(null);

  const startCreate = () => {
    setDraft(emptyDraft);
    setOpen(true);
  };

  const startEdit = (role: AccessRole) => {
    setDraft({
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      permissions: role.permissions.includes("all") ? [...ALL_PERMISSIONS] : [...role.permissions],
    });
    setOpen(true);
  };

  const toggle = (key: string) =>
    setDraft((d) => ({
      ...d,
      permissions: d.permissions.includes(key)
        ? d.permissions.filter((p) => p !== key)
        : [...d.permissions, key],
    }));

  const toggleGroup = (keys: string[], on: boolean) =>
    setDraft((d) => ({
      ...d,
      permissions: on
        ? Array.from(new Set([...d.permissions, ...keys]))
        : d.permissions.filter((p) => !keys.includes(p)),
    }));

  const save = async () => {
    if (!draft.name.trim()) {
      toast({ title: "Name required", description: "Give this access level a name.", variant: "destructive" });
      return;
    }
    if (!organization) return;

    setSaving(true);
    try {
      if (draft.id) {
        const { error } = await supabase
          .from("access_roles")
          .update({ name: draft.name.trim(), description: draft.description, permissions: draft.permissions })
          .eq("id", draft.id);
        if (error) throw error;
        toast({ title: "Access level updated", description: `${draft.name} was saved.` });
      } else {
        const { error } = await supabase.from("access_roles").insert({
          org_id: organization.id,
          name: draft.name.trim(),
          description: draft.description,
          permissions: draft.permissions,
        });
        if (error) throw error;
        toast({ title: "Access level created", description: `${draft.name} is ready to assign.` });
      }
      await refresh();
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Could not save", description: err?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("access_roles").delete().eq("id", deleteTarget.id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Access level removed", description: `${deleteTarget.name} was deleted.` });
      await refresh();
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Access levels</h2>
          <p className="text-muted-foreground">Pre-made and custom permission sets you can assign to users</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" /> New access level
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => {
          const isAll = role.permissions.includes("all");
          const count = isAll ? ALL_PERMISSIONS.length : role.permissions.length;
          return (
            <Card key={role.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    {role.name}
                  </CardTitle>
                  {role.is_system && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" /> Preset
                    </Badge>
                  )}
                </div>
                <CardDescription>{role.description ?? "Custom access level"}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <p className="text-sm text-muted-foreground">
                  {count} of {ALL_PERMISSIONS.length} permissions
                </p>
                <div className="flex flex-wrap gap-1">
                  {(isAll ? ["Everything"] : role.permissions.slice(0, 4)).map((p) => (
                    <Badge key={p} variant="outline" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                  {!isAll && role.permissions.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 4}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => startEdit(role)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={role.is_system}
                    onClick={() => setDeleteTarget(role)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit access level" : "Create access level"}</DialogTitle>
            <DialogDescription>Pick exactly which parts of the system this level can reach.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role-name">Name</Label>
                <Input
                  id="role-name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Counter Staff"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-desc">Description</Label>
                <Textarea
                  id="role-desc"
                  rows={2}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  placeholder="What this level is for"
                />
              </div>
            </div>

            <Separator />

            {PERMISSION_CATALOG.map((group) => {
              const keys = group.permissions.map((p) => p.key);
              const allOn = keys.every((k) => draft.permissions.includes(k));
              return (
                <div key={group.group} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{group.group}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Select all</span>
                      <Switch checked={allOn} onCheckedChange={(v) => toggleGroup(keys, v)} />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.permissions.map((p) => (
                      <div key={p.key} className="flex items-start justify-between gap-3 rounded-md bg-muted/40 p-3">
                        <div>
                          <p className="text-sm font-medium">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                        <Switch
                          checked={draft.permissions.includes(p.key)}
                          onCheckedChange={() => toggle(p.key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : draft.id ? "Save changes" : "Create access level"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete access level</DialogTitle>
            <DialogDescription>
              {deleteTarget?.name} will be removed. Users assigned to it will lose all access until you give them a
              new level.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccessLevels;
