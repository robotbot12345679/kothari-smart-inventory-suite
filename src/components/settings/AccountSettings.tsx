
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Calendar } from "lucide-react";

const AccountSettings = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Static user info since auth is removed
  const user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'kothari@businesssuite.com',
    created_at: new Date().toISOString()
  };
  
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your account information and settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{profile?.full_name || "Kothari's Business"}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Mail className="h-4 w-4 mr-1" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Active Account
              </div>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Account Status</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">System Access</span>
              <span className="text-sm font-medium text-green-600">
                ✓ Active
              </span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Data Security</h4>
            <p className="text-sm text-muted-foreground">
              Your data is securely stored and automatically synced across all your devices. 
              All sensitive information is encrypted and protected.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
