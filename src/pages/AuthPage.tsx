import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, ArrowLeft, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verify secret access token
  const accessToken = searchParams.get('access');
  const validToken = 'phantom-gate-2024'; // In production, this would be time-based or encrypted

  useEffect(() => {
    // If no valid access token, redirect away silently
    if (accessToken !== validToken) {
      navigate('/', { replace: true });
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/admin', { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/admin', { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate, accessToken]);

  // Don't render anything if invalid token
  if (accessToken !== validToken) {
    return null;
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Validate email
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        }
      });

      if (error) throw error;

      setMagicLinkSent(true);
      toast({
        title: 'Magic link sent!',
        description: 'Check your email for the login link.',
      });
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background cyber-grid p-4">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        
        <div className="glass-card p-8 w-full max-w-md relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="font-display text-2xl font-bold mb-2 text-neon">
            Check Your Email
          </h1>
          <p className="font-mono text-sm text-muted-foreground mb-6">
            We sent a magic link to <span className="text-foreground">{email}</span>
          </p>
          <p className="font-mono text-xs text-muted-foreground mb-8">
            Click the link in your email to sign in. The link will expire in 1 hour.
          </p>

          <button
            onClick={() => setMagicLinkSent(false)}
            className="flex items-center justify-center gap-2 mx-auto text-muted-foreground hover:text-primary transition-colors font-mono text-sm"
          >
            <ArrowLeft size={16} />
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid p-4">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
      
      <div className="glass-card p-8 w-full max-w-md relative z-10">
        <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>

        <h1 className="font-display text-2xl font-bold text-center mb-2 text-neon">
          Secure Access
        </h1>
        <p className="font-mono text-xs text-muted-foreground text-center mb-8 uppercase tracking-wider">
          Passwordless authentication
        </p>

        <form onSubmit={handleMagicLink} className="space-y-6">
          <div>
            <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              required
              placeholder="admin@example.com"
              className="w-full px-4 py-3 bg-input border border-border/50 rounded-lg font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all"
            />
            {emailError && (
              <p className="mt-2 text-xs text-destructive font-mono">{emailError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cyber-button w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Magic Link
              </>
            )}
          </button>
        </form>

        <p className="font-mono text-xs text-center mt-6 text-muted-foreground/70">
          A secure login link will be sent to your email.
          <br />No password required.
        </p>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30" />
    </div>
  );
};

export default AuthPage;
