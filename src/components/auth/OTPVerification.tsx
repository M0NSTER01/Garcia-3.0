
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resetPassword, resendOTP } = useAuth();
  
  // Get email from location state
  const email = location.state?.email || '';
  const isReset = location.state?.isReset || false;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!email) {
      // Redirect if no email is provided
      navigate('/login');
      return;
    }

    // Start resend countdown
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    console.log('OTP Verification component mounted with email:', email);

    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Attempting to verify OTP:', otp, 'for email:', email);
    
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    
    try {
      if (isReset) {
        if (!newPassword || !confirmPassword) {
          toast.error('Please enter your new password');
          setIsLoading(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (newPassword.length < 6) {
          toast.error('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        console.log('Resetting password with OTP');
        const success = await resetPassword(email, otp, newPassword);
        if (success) {
          navigate('/login');
        }
      } else {
        console.log('Verifying OTP for email verification');
        const success = await verifyOTP(email, otp);
        if (success) {
          navigate('/quiz');
        }
      }
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    
    try {
      setIsLoading(true);
      console.log('Resending OTP to', email, 'for', isReset ? 'password reset' : 'account verification');
      await resendOTP(email, isReset);
      toast.success('New OTP code sent to your email');
      setResendCountdown(60);
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-display">
          {isReset ? 'Reset Password' : 'Verify Your Email'}
        </CardTitle>
        <CardDescription>
          {isReset 
            ? 'Enter the verification code sent to your email and set a new password'
            : `We've sent a verification code to ${email}`}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleVerify}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={(value) => {
                  console.log('OTP changed:', value);
                  setOtp(value);
                }}
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
            <p className="text-xs text-gray-500 mt-1 text-center">
              The code is valid for 10 minutes
            </p>
          </div>

          {isReset && (
            <>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isReset ? (
              'Reset Password'
            ) : (
              'Verify & Continue'
            )}
          </Button>
          
          <div className="text-center text-sm">
            <p>
              Didn't receive a code?{' '}
              {resendCountdown > 0 ? (
                <span className="text-muted-foreground">
                  Resend in {resendCountdown}s
                </span>
              ) : (
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend code
                </Button>
              )}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => navigate(isReset ? '/login' : '/signup')}
          >
            {isReset ? 'Back to Login' : 'Back to Sign Up'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OTPVerification;
