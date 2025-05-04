
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
    logoUrl: "/lovable-uploads/6ab04e40-2860-4562-bace-e35da6383972.png",
    footerText: ["Thank you for shopping with us!", "Visit again soon!"]
  });

  const handleSaveTemplate = (template: BillingTemplate) => {
    setBillingTemplate(template);
    // Store in localStorage to persist across page refreshes
    localStorage.setItem("billingTemplate", JSON.stringify(template));
    toast({
      title: "Settings Saved",
      description: "Billing template has been updated successfully."
    });
  };

  const handlePrintTestReceipt = () => {
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (!receiptWindow) {
      toast({
        title: "Print Error",
        description: "Could not open print window. Please check your popup blocker settings.",
        variant: "destructive"
      });
      return;
    }
    
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Test Order</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            max-width: 380px;
          }
          .receipt {
            border: 1px solid #ddd;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .logo {
            max-width: 100px;
            margin: 0 auto;
            display: block;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin: 10px 0;
          }
          .info {
            margin: 5px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            text-align: left;
            padding: 8px 4px;
            border-bottom: 1px solid #ddd;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <img src="${billingTemplate.logoUrl}" alt="Shop logo" class="logo" />
            <h1 class="title">${billingTemplate.shopName}</h1>
            <p class="info">${billingTemplate.address}</p>
            <p class="info">${billingTemplate.phone}</p>
            <p class="info">${billingTemplate.gstNumber ? 'GSTIN: ' + billingTemplate.gstNumber : ''}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Chilean Walnuts (500g)</td>
                <td>2</td>
                <td>₹980.00</td>
              </tr>
              <tr>
                <td>Cashews (200g)</td>
                <td>1</td>
                <td>₹420.00</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            ${billingTemplate.footerText.map(line => `<p>${line}</p>`).join('')}
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
