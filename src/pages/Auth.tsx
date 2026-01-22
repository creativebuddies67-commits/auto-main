"use client";
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthMode = 'signin' | 'signup';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit() {
    const result = authSchema.safeParse({ email, password });
    
    if (!result.success) {
      toast({
        title: 'Validation Error',
        description: result.error.errors[0].message,
        variant: 'default',
      });
      return;
    }

    setLoading(true);
    
    try {
      const authFn = mode === 'signin' ? signIn : signUp;
      const { error } = await authFn(email, password);

      if (error) {
        const message = error.message.includes('Invalid login credentials')
          ? 'Invalid email or password'
          : error.message.includes('User already registered')
          ? 'An account with this email already exists'
          : error.message;
          
        toast({
          title: 'Authentication Error',
          description: message,
          variant: 'destructive',
        });
        return;
      }

      if (mode === 'signup') {
        toast({
          title: 'Account Created',
          description: 'You can now sign in.',
        });
      }
      
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  const isSignIn = mode === 'signin';
  const buttonText = loading
    ? (isSignIn ? 'Signing in...' : 'Creating...')
    : (isSignIn ? 'Sign in' : 'Create account');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-xs space-y-6">
        <header className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 border-2 border-foreground flex items-center justify-center">
            <span className="text-sm font-medium">A</span>
          </div>
          <h1 className="text-lg font-medium">AutoAce</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Internal onboarding dashboard
          </p>
        </header>

        <div className="space-y-4 border border-border p-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 text-sm"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 text-sm"
            />
          </div>
          
          <Button
            className="w-full h-9 text-sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {buttonText}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {isSignIn ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(isSignIn ? 'signup' : 'signin')}
            className="text-foreground underline"
          >
            {isSignIn ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
