import React from "react";
import BillingSettings from "@/components/settings/BillingSettings";
import { useCloudData } from "@/context/CloudDataContext";

const Settings = () => {
  const { billingTemplate, updateBillingTemplate } = useCloudData();

  const handleSaveTemplate = async (template: any) => {
    await updateBillingTemplate(template);
  };

  const handlePrintTestReceipt = () => {
    if (!billingTemplate) return;
    
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (!receiptWindow) {
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
          Manage your billing preferences and receipt template.
        </p>
      </div>

      {billingTemplate && (
        <BillingSettings 
          billingTemplate={billingTemplate}
          onSave={handleSaveTemplate}
          onPrintTest={handlePrintTestReceipt}
        />
      )}
    </div>
  );
};

export default Settings;
