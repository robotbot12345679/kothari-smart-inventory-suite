import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogIn, UserPlus } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const signupSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  fullName: z.string().trim().min(1, { message: "Full name is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Restrict access to only Sparsh with password 0906
      if (loginEmail.toLowerCase() !== 'sparsh' || loginPassword !== '0906') {
        toast({
          title: "Access Denied",
          description: "Only authorized personnel can access this system.",
          variant: "destructive"
        });
        return;
      }

      // Use Sparsh as the email for Supabase auth
      const email = "sparsh@kotharisbusinesssuite.com";
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: loginPassword
      });

      if (error) {
        // If user doesn't exist, create account
        if (error.message.includes('Invalid login credentials')) {
          const { error: signupError } = await supabase.auth.signUp({
            email: email,
            password: loginPassword,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                full_name: 'Sparsh'
              }
            }
          });
          
          if (signupError) {
            toast({
              title: "Login Failed",
              description: signupError.message,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Welcome Sparsh!",
              description: "Account created and logged in successfully."
            });
          }
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Welcome back, Sparsh!",
          description: "Successfully logged in."
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = signupSchema.parse({
        email: signupEmail,
        fullName,
        password: signupPassword,
        confirmPassword
      });

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validatedData.fullName
          }
        }
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account."
        });
        setActiveTab("login");
        // Clear form
        setSignupEmail("");
        setFullName("");
        setSignupPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Kothari's POS</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground">
              This system is restricted to authorized users only.
            </p>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login">Access System</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Username</Label>
                  <Input 
                    id="login-email" 
                    type="text" 
                    placeholder="Enter username (Sparsh)" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Access restricted to authorized personnel only
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <LogIn className="h-4 w-4 mr-2" /> 
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;