import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { User, Store, Bell, CreditCard, Shield, Printer, Download, Cloud } from "lucide-react";
import BillingSettings from "@/components/settings/BillingSettings";
import { BillingTemplate } from "@/types/pos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const { toast } = useToast();
  
  // Default billing template
  const [billingTemplate, setBillingTemplate] = useState<BillingTemplate>({
    shopName: "Kothari's Dry Fruits",
    address: "123 Market Street, Mumbai, India",
    phone: "+91 9876543210",
    gstNumber: "27AAAAA0000A1Z5",
    footerText: [
      "Thank you for shopping with us!",
      "All prices are inclusive of taxes.",
      "Visit us again soon."
    ]
  });

  // OneDrive connection state
  const [isConnectedToOneDrive, setIsConnectedToOneDrive] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  
  const handleSaveBillingTemplate = (template: BillingTemplate) => {
    setBillingTemplate(template);
  };
  
  // Function to handle OneDrive connection
  const connectToOneDrive = () => {
    // This would integrate with Microsoft Graph API in a real implementation
    toast({
      title: "OneDrive Connection",
      description: "Setting up connection to OneDrive. This would open Microsoft authentication in a real implementation."
    });
    
    // Simulate successful connection for demo
    setTimeout(() => {
      setIsConnectedToOneDrive(true);
      toast({
        title: "Connected to OneDrive",
        description: "Your store data will now be backed up automatically."
      });
    }, 2000);
  };

  // Function to handle backup immediately
  const backupNow = () => {
    toast({
      title: "Backup Started",
      description: "Backing up all store data to OneDrive."
    });
    
    // Simulate successful backup
    setTimeout(() => {
      toast({
        title: "Backup Complete",
        description: "All data has been successfully backed up to OneDrive."
      });
    }, 3000);
  };

  // Function to disconnect from OneDrive
  const disconnectOneDrive = () => {
    setIsConnectedToOneDrive(false);
    toast({
      title: "Disconnected from OneDrive",
      description: "Your store data will no longer be backed up automatically."
    });
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
    
    // Sample order data for testing
    const sampleOrder = {
      id: "TEST-ORDER",
      customerName: "Test Customer",
      items: [
        { id: 1, name: "Test Product 1", price: 100, quantity: 2, unit: "kg", weight: 1 },
        { id: 2, name: "Test Product 2", price: 200, quantity: 1, unit: "kg", weight: 0.5 }
      ],
      subtotal: 400,
      total: 400,
      paymentMethod: "cash",
      orderDate: new Date().toISOString()
    };
    
    const orderDate = new Date();
    const formattedDate = orderDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Generate UPI QR code
    const upiQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=ashokkothari738@oksbi%26pn=${encodeURIComponent(billingTemplate.shopName)}%26am=${sampleOrder.total}%26cu=INR`;
    
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Test Order</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
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
          th {
            font-weight: bold;
          }
          .item-price {
            text-align: right;
          }
          .subtotal-row td {
            border-top: 1px solid #000;
            border-bottom: none;
            padding-top: 10px;
          }
          .total-row td {
            font-weight: bold;
            border-bottom: none;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
          }
          .divider {
            border-top: 1px dashed #ddd;
            margin: 15px 0;
          }
          .qr-code {
            text-align: center;
            margin: 15px 0;
          }
          .qr-code img {
            max-width: 150px;
            margin: 10px auto;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .receipt {
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            ${billingTemplate.logoUrl ? `<img src="${billingTemplate.logoUrl}" alt="Logo" class="logo">` : ''}
            <div class="title">${billingTemplate.shopName}</div>
            <div class="info">${billingTemplate.address}</div>
            <div class="info">Phone: ${billingTemplate.phone}</div>
            <div class="info">${billingTemplate.gstNumber ? 'GST No: ' + billingTemplate.gstNumber : ''}</div>
          </div>
          
          <div class="order-info">
            <div class="info">Order #: ${sampleOrder.id}</div>
            <div class="info">Date: ${formattedDate} ${formattedTime}</div>
            <div class="info">Customer: ${sampleOrder.customerName}</div>
          </div>
          
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th class="item-price">Price</th>
                <th class="item-price">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${sampleOrder.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td class="item-price">₹${item.price.toFixed(2)}</td>
                  <td class="item-price">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              
              <tr class="subtotal-row">
                <td colspan="3">Subtotal</td>
                <td class="item-price">₹${sampleOrder.subtotal.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Total</td>
                <td class="item-price">₹${sampleOrder.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3">Payment Method</td>
                <td class="item-price">${sampleOrder.paymentMethod.toUpperCase()}</td>
              </tr>
              ${sampleOrder.paymentMethod === 'cash' ? `
                <tr>
                  <td colspan="3">Amount Tendered</td>
                  <td class="item-price">₹500.00</td>
                </tr>
                <tr>
                  <td colspan="3">Change</td>
                  <td class="item-price">₹100.00</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          
          <div class="qr-code">
            <p>Scan to pay via UPI:</p>
            <img src="${upiQrCode}" alt="UPI QR Code">
            <p>UPI ID: ashokkothari738@oksbi</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            ${billingTemplate.footerText.map(line => `<p>${line}</p>`).join('')}
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    
    receiptWindow.document.close();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>Store</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account settings and personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" placeholder="Enter your first name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" placeholder="Enter your last name" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  onClick={() => {
                    toast({
                      title: "Settings Saved",
                      description: "Your account settings have been updated.",
                    });
                  }}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="store">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                  <CardDescription>
                    Configure your store information and operational settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store name</Label>
                    <Input id="store-name" placeholder="Enter your store name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="store-description">Description</Label>
                    <Input id="store-description" placeholder="Brief description of your store" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="store-address">Store address</Label>
                    <Input id="store-address" placeholder="Enter your store address" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-phone">Phone number</Label>
                      <Input id="store-phone" placeholder="Enter phone number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-email">Store email</Label>
                      <Input id="store-email" type="email" placeholder="Enter email" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax-percentage">Tax percentage</Label>
                      <Input id="tax-percentage" type="number" min="0" max="100" placeholder="Enter tax percentage" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input id="currency" placeholder="INR" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch id="tax-included" />
                    <Label htmlFor="tax-included">Prices include tax</Label>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button
                    onClick={() => {
                      toast({
                        title: "Store Settings Saved",
                        description: "Your store settings have been updated.",
                      });
                    }}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>OneDrive Backup</CardTitle>
                  <CardDescription>
                    Back up your store data and database to Microsoft OneDrive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isConnectedToOneDrive ? (
                    <>
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Cloud className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Connected to OneDrive</p>
                          <p className="text-sm text-muted-foreground">
                            Last backup: Today at 12:45 PM
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backup-frequency">Backup Frequency</Label>
                        <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                          <SelectTrigger id="backup-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Every Hour</SelectItem>
                            <SelectItem value="daily">Once a Day</SelectItem>
                            <SelectItem value="weekly">Once a Week</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>What to Back Up</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Switch id="backup-products" defaultChecked />
                            <Label htmlFor="backup-products">Products & Categories</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="backup-orders" defaultChecked />
                            <Label htmlFor="backup-orders">Orders & Transactions</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="backup-customers" defaultChecked />
                            <Label htmlFor="backup-customers">Customer Data</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch id="backup-settings" defaultChecked />
                            <Label htmlFor="backup-settings">Store Settings</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button className="gap-2" onClick={backupNow}>
                          <Download className="h-4 w-4" />
                          Backup Now
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={disconnectOneDrive}>
                          Disconnect OneDrive
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-semibold mb-2">Why Back Up to OneDrive?</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex gap-2">
                            <div className="flex-shrink-0 mt-0.5 bg-primary rounded-full h-1.5 w-1.5 p-0"></div>
                            <div>Never lose product data, transactions or customer information</div>
                          </li>
                          <li className="flex gap-2">
                            <div className="flex-shrink-0 mt-0.5 bg-primary rounded-full h-1.5 w-1.5 p-0"></div>
                            <div>Automatic backup on your preferred schedule</div>
                          </li>
                          <li className="flex gap-2">
                            <div className="flex-shrink-0 mt-0.5 bg-primary rounded-full h-1.5 w-1.5 p-0"></div>
                            <div>Access your store data from anywhere via OneDrive</div>
                          </li>
                          <li className="flex gap-2">
                            <div className="flex-shrink-0 mt-0.5 bg-primary rounded-full h-1.5 w-1.5 p-0"></div>
                            <div>Encrypted and secure data transfer</div>
                          </li>
                        </ul>
                      </div>
                      
                      <Button onClick={connectToOneDrive} className="w-full gap-2 mt-4">
                        <Cloud className="h-4 w-4" />
                        Connect to Microsoft OneDrive
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="billing">
            <BillingSettings 
              billingTemplate={billingTemplate}
              onSave={handleSaveBillingTemplate}
              onPrintTest={printTestReceipt}
            />
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Orders</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications when new orders are placed
                      </p>
                    </div>
                    <Switch id="new-orders" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Low Stock Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified when products are low in stock
                      </p>
                    </div>
                    <Switch id="low-stock" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Payment Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for new payments and refunds
                      </p>
                    </div>
                    <Switch id="payment-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Be notified about system and feature updates
                      </p>
                    </div>
                    <Switch id="system-updates" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  onClick={() => {
                    toast({
                      title: "Notification Settings Saved",
                      description: "Your notification preferences have been updated.",
                    });
                  }}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your security preferences and access controls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Login Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts for new login attempts
                      </p>
                    </div>
                    <Switch id="login-alerts" defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" min="5" max="120" defaultValue="60" />
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after period of inactivity
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  onClick={() => {
                    toast({
                      title: "Security Settings Saved",
                      description: "Your security preferences have been updated.",
                    });
                  }}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
