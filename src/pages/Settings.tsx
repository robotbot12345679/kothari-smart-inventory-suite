
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BillingSettings from "@/components/settings/BillingSettings";
import AccountSettings from "@/components/settings/AccountSettings";
import { BillingTemplate } from "@/types/pos";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [billingTemplate, setBillingTemplate] = useState<BillingTemplate>({
    shopName: "Kothari's Dry Fruits & More",
    address: "89, Sukan Mall, Nr. CIMS Hospital, Science City Road, Ahmedabad, Gujarat 380060",
    phone: "+91 75677 00090",
    gstNumber: "",
    logoUrl: "/lovable-uploads/ae24266c-004d-443e-8160-8559b829245d.png",
    footerText: ["Thank you for shopping with us!", "Visit again soon!"]
  });

  const handleSaveTemplate = (template: BillingTemplate) => {
    setBillingTemplate(template);
    toast({
      title: "Settings Saved",
      description: "Billing template has been updated successfully."
    });
  };

  const handlePrintTestReceipt = () => {
    // The implementation is already in the BillingSettings component
    toast({
      title: "Test Print",
      description: "Generating test receipt..."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and billing preferences.
        </p>
      </div>

      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-6">
          <AccountSettings />
        </TabsContent>
        
        <TabsContent value="billing" className="mt-6">
          <BillingSettings 
            billingTemplate={billingTemplate}
            onSave={handleSaveTemplate}
            onPrintTest={handlePrintTestReceipt}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
