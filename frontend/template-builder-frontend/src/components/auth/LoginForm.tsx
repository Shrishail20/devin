import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles } from 'lucide-react';
import { authAPI } from '../../services/api';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // Error is handled by the store
    }
  };

  const handleDemoLogin = async () => {
    clearError();
    setIsDemoLoading(true);
    
    const demoEmail = 'demo@templatebuilder.com';
    const demoPassword = 'demo123456';
    const demoName = 'Demo User';
    
    try {
      // Try to login first
      await login(demoEmail, demoPassword);
      navigate('/');
    } catch {
      // If login fails, register the demo user first
      try {
        const response = await authAPI.register(demoEmail, demoPassword, demoName);
        setAuth(response.data.token, response.data.user);
        navigate('/');
      } catch {
        // If registration also fails (user might exist with different password), show error
        // Try login one more time with the credentials
        try {
          await login(demoEmail, demoPassword);
          navigate('/');
        } catch {
          // Error is handled by the store
        }
      }
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the template builder
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
        </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading || isDemoLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                  </Button>
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    onClick={handleDemoLogin}
                    disabled={isLoading || isDemoLoading}
                  >
                    {isDemoLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Demo Login
                  </Button>
                  <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-500 hover:underline">
                      Register
                    </Link>
                  </p>
                </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
