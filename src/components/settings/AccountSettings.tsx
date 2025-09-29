
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, LogOut, Mail, Calendar } from "lucide-react";

const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
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

  const handleSignOut = async () => {
    await signOut();
  };
  
  if (user) {
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
                <h3 className="text-lg font-semibold">{profile?.full_name || 'User'}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Account Status</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Verified</span>
                <span className="text-sm font-medium text-green-600">
                  {user.email_confirmed_at ? '✓ Verified' : '⚠ Pending'}
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
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleSignOut} disabled={loading}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>You need to sign in to access your account</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <div className="mb-4">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Not signed in</p>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Sign in to sync your data across devices and access all features.
        </p>
        <Button onClick={() => window.location.href = '/auth'} className="w-full">
          Go to Sign In
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
