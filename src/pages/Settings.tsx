
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Save, 
  Store, 
  User, 
  Shield, 
  Lock, 
  Database, 
  Truck, 
  CreditCard, 
  Bell, 
  Upload 
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Store settings state
  const [storeSettings, setStoreSettings] = useState({
    name: "Kothari Dry Fruits & More",
    email: "info@kotharidryfruits.com",
    address: "123 Main Street, Bangalore, Karnataka, 560001",
    phone: "+91 98765 43210",
    currency: "inr",
    taxRate: "18",
    timeZone: "ist",
    gstEnabled: true,
    lowStockAlerts: true,
    expiryDateTracking: true,
    aiAnalytics: true
  });
  
  // Handle form field changes
  const handleStoreSettingChange = (field, value) => {
    setStoreSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle save changes button click
  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // Simulate saving to database
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your changes have been successfully saved.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Button 
          className="gap-1" 
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="border-b">
          <div className="flex overflow-x-auto py-2">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mx-auto">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                User
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipping
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Backup
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input 
                    id="store-name" 
                    value={storeSettings.name} 
                    onChange={(e) => handleStoreSettingChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-email">Store Email</Label>
                  <Input 
                    id="store-email" 
                    type="email" 
                    value={storeSettings.email}
                    onChange={(e) => handleStoreSettingChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-address">Store Address</Label>
                <Textarea 
                  id="store-address" 
                  value={storeSettings.address}
                  onChange={(e) => handleStoreSettingChange('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Phone Number</Label>
                  <Input 
                    id="store-phone" 
                    value={storeSettings.phone}
                    onChange={(e) => handleStoreSettingChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-currency">Currency</Label>
                  <Select 
                    value={storeSettings.currency}
                    onValueChange={(value) => handleStoreSettingChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="usd">US Dollar ($)</SelectItem>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                      <SelectItem value="gbp">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
                  <Input 
                    id="tax-rate" 
                    type="number" 
                    value={storeSettings.taxRate}
                    onChange={(e) => handleStoreSettingChange('taxRate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-zone">Time Zone</Label>
                  <Select 
                    value={storeSettings.timeZone}
                    onValueChange={(value) => handleStoreSettingChange('timeZone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ist">Indian Standard Time (IST)</SelectItem>
                      <SelectItem value="utc">Coordinated Universal Time (UTC)</SelectItem>
                      <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
                      <SelectItem value="pst">Pacific Standard Time (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="store-logo">Store Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md border overflow-hidden bg-muted flex items-center justify-center">
                    <Store className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>
                Configure your business preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">GST Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable GST calculations for your invoices
                  </p>
                </div>
                <Switch 
                  checked={storeSettings.gstEnabled}
                  onCheckedChange={(checked) => handleStoreSettingChange('gstEnabled', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notifications when stock is running low
                  </p>
                </div>
                <Switch 
                  checked={storeSettings.lowStockAlerts}
                  onCheckedChange={(checked) => handleStoreSettingChange('lowStockAlerts', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Expiry Date Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Track and get alerts for product expiry dates
                  </p>
                </div>
                <Switch 
                  checked={storeSettings.expiryDateTracking}
                  onCheckedChange={(checked) => handleStoreSettingChange('expiryDateTracking', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">AI-Powered Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable AI insights and recommendations
                  </p>
                </div>
                <Switch 
                  checked={storeSettings.aiAnalytics}
                  onCheckedChange={(checked) => handleStoreSettingChange('aiAnalytics', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Backup</CardTitle>
              <CardDescription>
                Configure automatic data backup settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Daily Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup your data every day
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />

              <div className="space-y-2">
                <Label htmlFor="backup-time">Backup Time</Label>
                <Select defaultValue="0200">
                  <SelectTrigger>
                    <SelectValue placeholder="Select backup time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0000">12:00 AM</SelectItem>
                    <SelectItem value="0200">2:00 AM</SelectItem>
                    <SelectItem value="0400">4:00 AM</SelectItem>
                    <SelectItem value="0600">6:00 AM</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a time when system load is typically low
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-destination">Backup Destination</Label>
                <Select defaultValue="google-drive">
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google-drive">Google Drive</SelectItem>
                    <SelectItem value="dropbox">Dropbox</SelectItem>
                    <SelectItem value="onedrive">Microsoft OneDrive</SelectItem>
                    <SelectItem value="local">Local Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <Button className="w-full">Connect Google Drive</Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Backup Retention</Label>
                  <span className="text-sm text-muted-foreground">14 days</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Number of days to keep backup files
                </p>
                <Input type="range" min="7" max="90" defaultValue="14" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>7 days</span>
                  <span>30 days</span>
                  <span>90 days</span>
                </div>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full">Backup Now</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              <Button className="gap-2">
                <Lock className="h-4 w-4" />
                Update Password
              </Button>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tabs would go here */}
      </Tabs>
    </div>
  );
};

export default Settings;
