import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Mail, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { BRAND_ICON_ALT, BRAND_ICON_WITH_VERSION } from '@/utils/branding';

// Route mapping based on role
const getDashboard = (role: string) => {
  switch (role.toLowerCase()) {
    case 'elder': return '/elder-dashboard';
    case 'volunteer': return '/volunteer-dashboard';
    case 'family': return '/family-dashboard';
    case 'admin': return '/dashboard';
    default: return '/dashboard';
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { sendOTP: sendOTPAPI, login, user } = useAuth();
  const toast = useToast();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [generatedOTP, setGeneratedOTP] = useState(''); // Show OTP on screen for testing
  
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send OTP via API and capture the code
      const otp = await sendOTPAPI(email);
      
      setStep('otp');
      setResendTimer(30);
      
      // Display the generated OTP for testing
      if (otp) {
        setGeneratedOTP(otp);
        console.log('OTP generated:', otp);
      }
      
      toast.success('OTP sent to your email!');
      
      // Focus first OTP input
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    // Auto-verify when all digits entered
    if (value && index === 3) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 4) {
        verifyOTP(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(['', '', '', '']).slice(0, 4);
      setOtp(newOtp);
      if (pastedData.length === 4) {
        verifyOTP(pastedData);
      }
    }
  };

  const verifyOTP = async (otpValue: string) => {
    setLoading(true);
    setError('');

    try {
      // Call login API for OTP verification
      console.log('Verifying OTP for email:', email);
      const userData = await login(email, otpValue);
      console.log('Login response userData:', userData);

      if (!userData) {
        // New user detected - redirect to signup page
        console.log('New user detected, redirecting to signup');
        toast.info('Please complete your signup');
        router.push(`/signup?email=${encodeURIComponent(email)}&otp=${otpValue}`);
        return;
      }

      toast.success('Login successful!');
      
      // Redirect based on user role from API
      const userRole = userData?.role?.toLowerCase() || 'elder';
      console.log('Redirecting to dashboard for role:', userRole);
      const dashboardRoute = getDashboard(userRole);
      router.push(dashboardRoute);
    } catch (err: any) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
      toast.error(err.message || 'Invalid OTP');
      setOtp(['', '', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setOtp(['', '', '', '']);
    setError('');
    
    try {
      const otp = await sendOTPAPI(email);
      if (otp) {
        setGeneratedOTP(otp);
        console.log('OTP resent:', otp);
      }
      toast.success('OTP resent! Check your email.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <>
      <Head>
        <title>Login - ElderConnect+</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img src={BRAND_ICON_WITH_VERSION} alt={BRAND_ICON_ALT} className="w-8 h-8 rounded" />
            </div>
            <h1 className="text-2xl font-bold text-primary-600">ElderConnect+</h1>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            {step === 'email' ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                  <p className="text-gray-600">Enter your email to receive a login code</p>
                </div>

                <form onSubmit={handleSendOTP}>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-4 text-lg"
                    icon={loading ? undefined : <ArrowRight className="w-5 h-5" />}
                  >
                    {loading ? 'Sending Code...' : 'Send Login Code'}
                  </Button>
                </form>

                {/* Sign up link */}
                <p className="text-center text-gray-600 mt-6">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup" className="text-primary-600 font-semibold hover:text-primary-700">
                    Sign up
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-7 h-7 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Code</h2>
                  <p className="text-gray-600">
                    We sent a 4-digit code to<br />
                    <span className="font-medium text-gray-900">{email}</span>
                  </p>
                  
                  {/* Display generated OTP for testing */}
                  {generatedOTP && (
                    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                      <p className="text-xs text-blue-600 font-medium mb-2">TEST OTP (for development):</p>
                      <p className="text-2xl font-bold text-blue-700 tracking-widest">{generatedOTP}</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className={`mb-4 p-3 rounded-xl text-sm ${
                    error.includes('resent') 
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {error}
                  </div>
                )}

                {/* OTP Input */}
                <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all ${
                        digit 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                      }`}
                      disabled={loading}
                    />
                  ))}
                </div>

                {loading && (
                  <div className="text-center text-gray-600 mb-4">
                    Verifying...
                  </div>
                )}

                {/* Resend */}
                <div className="text-center">
                  <button
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0}
                    className={`inline-flex items-center gap-2 text-sm ${
                      resendTimer > 0 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-primary-600 hover:text-primary-700'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>

                {/* Change email */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      setStep('email');
                      setOtp(['', '', '', '']);
                      setError('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Use different email
                  </button>
                </div>

                {/* Hint */}
                <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-sm text-amber-700">
                    <strong>Test OTP:</strong> 0000
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Sign up link */}
          <p className="text-center mt-6 text-gray-600">
            New to ElderConnect+?{' '}
            <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
