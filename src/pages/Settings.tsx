import React, { useState } from "react";
import BillingSettings from "@/components/settings/BillingSettings";
import { useCloudData } from "@/context/CloudDataContext";
import { usePermissions } from "@/context/PermissionsContext";
import { AccessDenied } from "@/components/auth/RequirePermission";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, Receipt, UserCog } from "lucide-react";
import { DEFAULT_USER_PASSWORD } from "@/lib/permissions";
import { escapeHtml, escapeHtmlArray } from "@/lib/htmlUtils";

const MyAccount = () => {
  const { toast } = useToast();
  const { profile, myRole, isOwner, permissions } = usePermissions();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", description: "Both fields must be identical.", variant: "destructive" });
      return;
    }
    if (password.trim().toLowerCase() === DEFAULT_USER_PASSWORD) {
      toast({ title: "Choose a different password", description: "The default password cannot be reused.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      if (profile) {
        await supabase.from("profiles").update({ must_change_password: false }).eq("id", profile.id);
      }
      setPassword("");
      setConfirm("");
      toast({ title: "Password updated", description: "Your new password is active." });
    } catch (err: any) {
      toast({ title: "Could not update password", description: err?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" /> My account
          </CardTitle>
          <CardDescription>Your profile and access level in this organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{profile?.display_name ?? "—"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{profile?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Access level</span>
            <Badge variant="secondary">
              {isOwner ? "Owner (full access)" : myRole?.name ?? "No access level assigned"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Permissions</span>
            <span className="font-medium">{permissions.includes("all") ? "All" : permissions.length}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> Change password
          </CardTitle>
          <CardDescription>Update the password you use to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="acc-new-password">New password</Label>
              <Input
                id="acc-new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-confirm-password">Confirm password</Label>
              <Input
                id="acc-confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat the new password"
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const Settings = () => {
  const { billingTemplate, updateBillingTemplate } = useCloudData();
  const { can, profile } = usePermissions();

  const canBilling = can("settings.billing") && !profile?.must_change_password;

  const handleSaveTemplate = async (template: any) => {
    await updateBillingTemplate(template);
  };

  const handlePrintTestReceipt = () => {
    if (!billingTemplate) return;

    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    if (!receiptWindow) return;

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Test Order</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; max-width: 380px; }
          .receipt { border: 1px solid #ddd; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { max-width: 100px; margin: 0 auto; display: block; }
          .title { font-size: 18px; font-weight: bold; margin: 10px 0; }
          .info { margin: 5px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid #ddd; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <img src="${escapeHtml(billingTemplate.logoUrl)}" alt="Shop logo" class="logo" />
            <h1 class="title">${escapeHtml(billingTemplate.shopName)}</h1>
            <p class="info">${escapeHtml(billingTemplate.address)}</p>
            <p class="info">${escapeHtml(billingTemplate.phone)}</p>
            <p class="info">${billingTemplate.gstNumber ? 'GSTIN: ' + escapeHtml(billingTemplate.gstNumber) : ''}</p>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th>Quantity</th><th>Price</th></tr>
            </thead>
            <tbody>
              <tr><td>Chilean Walnuts (500g)</td><td>2</td><td>₹980.00</td></tr>
              <tr><td>Cashews (200g)</td><td>1</td><td>₹420.00</td></tr>
            </tbody>
          </table>
          <div class="footer">
            ${escapeHtmlArray(billingTemplate.footerText).map(line => `<p>${line}</p>`).join('')}
          </div>
        </div>
      </body>
      </html>
    `);

    receiptWindow.document.close();
    setTimeout(() => {
      receiptWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and, if allowed, the shop billing template.</p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">
            <UserCog className="mr-2 h-4 w-4" /> My account
          </TabsTrigger>
          <TabsTrigger value="billing">
            <Receipt className="mr-2 h-4 w-4" /> Billing & receipt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <MyAccount />
        </TabsContent>

        <TabsContent value="billing">
          {!canBilling ? (
            <AccessDenied message="Billing and receipt settings are limited to accounts with billing permission." />
          ) : (
            billingTemplate && (
              <BillingSettings
                billingTemplate={billingTemplate}
                onSave={handleSaveTemplate}
                onPrintTest={handlePrintTestReceipt}
              />
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
