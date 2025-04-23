import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { BillingTemplate } from "@/types/pos";
import { Printer, Save, Upload } from "lucide-react";

interface BillingSettingsProps {
  billingTemplate: BillingTemplate;
  onSave: (template: BillingTemplate) => void;
  onPrintTest: () => void;
}

const BillingSettings = ({ billingTemplate, onSave, onPrintTest }: BillingSettingsProps) => {
  const { toast } = useToast();
  const [template, setTemplate] = useState<BillingTemplate>(billingTemplate);
  const [footerText, setFooterText] = useState(billingTemplate.footerText.join('\n'));
  
  const handleSave = () => {
    const updatedTemplate = {
      ...template,
      footerText: footerText.split('\n').filter(line => line.trim() !== '')
    };
    
    onSave(updatedTemplate);
    toast({
      title: "Settings Saved",
      description: "Billing template settings have been updated successfully."
    });
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 500000) { // 500KB limit
      toast({
        title: "File too large",
        description: "Logo image must be less than 500KB",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setTemplate({
        ...template,
        logoUrl: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };
  
  const printTestReceipt = () => {
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
            font-family: monospace;
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
            font-family: 'Courier New', monospace;
          }
          .info {
            margin: 5px 0;
            font-size: 14px;
            font-family: 'Courier New', monospace;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-family: monospace;
          }
          th, td {
            text-align: left;
            padding: 8px 4px;
            border-bottom: 1px solid #ddd;
            font-size: 14px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <img src="${template.logoUrl}" alt="Shop logo" class="logo" />
            <h1 class="title">${template.shopName}</h1>
            <p class="info">${template.address}</p>
            <p class="info">${template.phone}</p>
            <p class="info">${template.gstNumber}</p>
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
                <td>Item 1</td>
                <td>1</td>
                <td>$10.00</td>
              </tr>
              <tr>
                <td>Item 2</td>
                <td>2</td>
                <td>$20.00</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            ${footerText.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
        </div>
      </body>
      </html>
    `);
    
    receiptWindow.document.close();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Receipt Settings</CardTitle>
        <CardDescription>
          Customize how your receipts and invoices appear to customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop-name">Shop Name</Label>
            <Input 
              id="shop-name" 
              value={template.shopName}
              onChange={(e) => setTemplate({...template, shopName: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea 
              id="address" 
              value={template.address}
              onChange={(e) => setTemplate({...template, address: e.target.value})}
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                value={template.phone}
                onChange={(e) => setTemplate({...template, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst-number">GST Number</Label>
              <Input 
                id="gst-number" 
                value={template.gstNumber}
                onChange={(e) => setTemplate({...template, gstNumber: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="footer-text">Footer Text</Label>
            <Textarea 
              id="footer-text" 
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Enter each line of footer text on a new line"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Enter each line on a new line. These will appear at the bottom of your receipts.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logo">Shop Logo</Label>
            <div className="flex items-center gap-4">
              {template.logoUrl && (
                <div className="h-16 w-16 border rounded overflow-hidden">
                  <img 
                    src={template.logoUrl} 
                    alt="Shop logo" 
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <Label 
                  htmlFor="logo-upload" 
                  className="flex cursor-pointer items-center justify-center rounded-md border border-dashed p-4 hover:bg-muted/50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload logo</span>
                  <Input 
                    id="logo-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload}
                  />
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG or JPG (max. 500KB)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrintTest} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Test Receipt
          </Button>
          <Button type="button" onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillingSettings;
