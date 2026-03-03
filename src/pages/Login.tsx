import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Lock, User } from "lucide-react";

const EMAIL_DOMAIN = "@kothari.system";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const withTimeout = async <T,>(operation: () => Promise<T>, ms = 20000): Promise<T> => {
    return await new Promise<T>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        reject(new Error("AUTH_TIMEOUT"));
      }, ms);

      operation()
        .then(resolve)
        .catch(reject)
        .finally(() => window.clearTimeout(timeoutId));
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please enter User ID and Password", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const email = userId.toLowerCase().trim().includes("@")
        ? userId.toLowerCase().trim()
        : userId.toLowerCase().trim() + EMAIL_DOMAIN;

      const signIn = () => supabase.auth.signInWithPassword({ email, password });
      let result;

      try {
        result = await withTimeout(signIn);
      } catch (firstError: any) {
        const firstMessage = String(firstError?.message || "").toLowerCase();
        const shouldRetry =
          firstMessage.includes("failed to fetch") ||
          firstMessage.includes("network") ||
          firstMessage.includes("auth_timeout");

        if (!shouldRetry) throw firstError;
        result = await withTimeout(signIn);
      }

      const { error } = result;

      if (error) {
        toast({ title: "Login Failed", description: "Invalid User ID or Password", variant: "destructive" });
      }
    } catch (err: any) {
      const message = err?.message?.includes("Failed to fetch") || err?.message?.toLowerCase?.().includes("network") || err?.message?.includes("AUTH_TIMEOUT")
        ? "Cannot reach authentication service right now. Please retry in a few seconds."
        : err?.message || "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Kothari's Dry Fruits
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your User ID"
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
