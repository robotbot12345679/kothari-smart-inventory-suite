import { useState, useEffect, createContext, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: { 
    username: string;
    id: string;
    email?: string;
    created_at?: string;
    email_confirmed_at?: string;
  } | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ 
    username: string;
    id: string;
    email?: string;
    created_at?: string;
    email_confirmed_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for authentication
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const username = localStorage.getItem('username');
      
      if (isAuthenticated && username) {
        setUser({ 
          username, 
          id: 'sparsh-user-id',
          email: 'sparsh@kotharisbusinesssuite.com',
          created_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString()
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    setUser(null);
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out."
    });
  };

  const value = {
    user,
    loading,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};