import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, ArrowLeft, Shield, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const emailSchema = z.string().email('Please enter a valid email address');

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [emailError, setEmailError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verify secret access token
  const accessToken = searchParams.get('access');
  const validToken = 'phantom-gate-2024';

  useEffect(() => {
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

  if (accessToken !== validToken) {
    return null;
  }

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const response = await supabase.functions.invoke('request-otp', {
        body: {
          email: email.toLowerCase().trim(),
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send verification code');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      setStep('otp');
      toast({
        title: 'Verification code sent!',
        description: 'Check your email for the 6-digit code.',
      });
    } catch (error: any) {
      const isNotAuthorized = error.message?.includes('not authorized');
      toast({
        title: isNotAuthorized ? 'Access Denied' : 'Authentication Error',
        description: isNotAuthorized 
          ? 'You are not allowed to access this application. Redirecting to homepage...'
          : error.message || 'Failed to send verification code.',
        variant: 'destructive',
      });
      
      if (isNotAuthorized) {
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter the complete 6-digit verification code.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Call our custom verify-otp edge function
      const response = await supabase.functions.invoke('verify-otp', {
        body: {
          email: email.toLowerCase().trim(),
          code: otpCode,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Verification failed');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      // Set the session from the response
      const { access_token, refresh_token } = response.data;
      
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        throw sessionError;
      }

      toast({
        title: 'Login successful!',
        description: 'Welcome back.',
      });
      navigate('/admin', { replace: true });
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('request-otp', {
        body: {
          email: email.toLowerCase().trim(),
        },
      });

      if (response.error || response.data?.error) {
        throw new Error(response.data?.error || 'Failed to resend code');
      }

      toast({
        title: 'Code resent!',
        description: 'Check your email for the new verification code.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // OTP verification step
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background cyber-grid p-4">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
        
        <div className="glass-card p-8 w-full max-w-md relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="font-display text-2xl font-bold text-center mb-2 text-neon">
            Enter Verification Code
          </h1>
          <p className="font-mono text-sm text-muted-foreground text-center mb-2">
            We sent a 6-digit code to
          </p>
          <p className="font-mono text-sm text-primary text-center mb-8">
            {email}
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(value) => setOtpCode(value)}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="cyber-button w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                setStep('email');
                setOtpCode('');
              }}
              disabled={loading}
              className="flex items-center justify-center gap-2 mx-auto text-muted-foreground hover:text-primary transition-colors font-mono text-sm"
            >
              <ArrowLeft size={16} />
              Use a different email
            </button>
            
            <p className="font-mono text-xs text-center text-muted-foreground/70">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-primary hover:underline disabled:opacity-50"
              >
                Resend
              </button>
            </p>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/30" />
      </div>
    );
  }

  // Email input step
  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid p-4">
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />
      
      <div className="glass-card p-8 w-full max-w-md relative z-10">
        <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>

        <h1 className="font-display text-2xl font-bold text-center mb-2 text-neon">
          Secure Access
        </h1>
        <p className="font-mono text-xs text-muted-foreground text-center mb-8 uppercase tracking-wider">
          OTP Authentication
        </p>

        <form onSubmit={handleRequestOtp} className="space-y-6">
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
                Sending Code...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Verification Code
              </>
            )}
          </button>
        </form>

        <p className="font-mono text-xs text-center mt-6 text-muted-foreground/70">
          A 6-digit verification code will be sent to your email.
          <br />Only authorized emails can receive codes.
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
