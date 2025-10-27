import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Welcome to Kothari's Dry Fruits
          </CardTitle>
          <CardDescription>
            Point of Sale System - Desktop Edition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>
            This application has been optimized to run as a desktop application.
            You'll be redirected to the dashboard in a moment.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Go to Dashboard Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
