import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  Heart,
  HandHeart,
  Users,
  ArrowRight,
  Check,
  Coffee,
  BookOpen,
  Music,
  Gamepad2,
  ShoppingBag,
  Stethoscope,
  Car,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Shield,
  RefreshCw
} from 'lucide-react';
import Button from '@/components/Button';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { AddressSuggestion } from '@/types/address';
import apiClient from '@/utils/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

// Elder interests
const elderInterests = [
  { id: 'conversation', label: 'Friendly Chats', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
  { id: 'reading', label: 'Reading & Stories', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  { id: 'music', label: 'Music & Singing', icon: Music, color: 'bg-purple-100 text-purple-600' },
  { id: 'games', label: 'Games & Puzzles', icon: Gamepad2, color: 'bg-green-100 text-green-600' },
  { id: 'errands', label: 'Help with Errands', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
  { id: 'health', label: 'Health Check-ins', icon: Stethoscope, color: 'bg-red-100 text-red-600' },
];

// Volunteer skills
const volunteerSkills = [
  { id: 'conversation', label: 'Great Listener', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
  { id: 'reading', label: 'Reading Aloud', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  { id: 'music', label: 'Music & Arts', icon: Music, color: 'bg-purple-100 text-purple-600' },
  { id: 'games', label: 'Games & Activities', icon: Gamepad2, color: 'bg-green-100 text-green-600' },
  { id: 'errands', label: 'Running Errands', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
  { id: 'transport', label: 'Transportation', icon: Car, color: 'bg-indigo-100 text-indigo-600' },
];

const availability = [
  { id: 'weekday-morning', label: 'Weekday Mornings' },
  { id: 'weekday-afternoon', label: 'Weekday Afternoons' },
  { id: 'weekday-evening', label: 'Weekday Evenings' },
  { id: 'weekend-morning', label: 'Weekend Mornings' },
  { id: 'weekend-afternoon', label: 'Weekend Afternoons' },
  { id: 'weekend-evening', label: 'Weekend Evenings' },
];

type UserRole = 'elder' | 'volunteer' | 'family';

export default function SignupPage() {
  const router = useRouter();
  const { sendOTP, signup, updateUser, login } = useAuth();
  const toast = useToast();
  
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Step 0: Role selection
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Step 1: Account details (name + email + OTP)
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [generatedOTP, setGeneratedOTP] = useState(''); // Show OTP on screen for testing
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  
  // Step 2+: Preferences (role-specific)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [preferredTime, setPreferredTime] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [travelDistance, setTravelDistance] = useState('');
  const [address, setAddress] = useState('');
  const [addressPostcode, setAddressPostcode] = useState('');
  const [addressLatitude, setAddressLatitude] = useState<number | undefined>();
  const [addressLongitude, setAddressLongitude] = useState<number | undefined>();

  // Initialize from query params (when redirected from login for new user)
  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email as string);
      setOtpVerified(true); // OTP already verified in login
      setStep(1); // Skip to account details step
    }
  }, [router.query]);

  // Reset OTP state when going back to step 0
  const resetOtpState = () => {
    setOtp(['', '', '', '']);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpError('');
    setResendTimer(0);
  };

  const goBack = () => {
    if (step === 1) {
      resetOtpState();
    }
    setStep(step - 1);
  };
  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAvailability = (id: string) => {
    setSelectedAvailability(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    setAddress(suggestion.formattedAddress);
    setAddressPostcode(suggestion.postcode || '');
    setAddressLatitude(suggestion.latitude);
    setAddressLongitude(suggestion.longitude);
  };

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const canProceed = () => {
    if (step === 0) return selectedRole !== null;
    if (step === 1) return name.trim() && email.trim() && otpVerified;
    if (step === 2) {
      if (selectedRole === 'elder') return selectedInterests.length > 0;
      if (selectedRole === 'volunteer') return selectedInterests.length > 0 && selectedAvailability.length > 0;
      return true; // Family skips this
    }
    if (step === 3) {
      if (selectedRole === 'elder') return preferredTime !== '';
      if (selectedRole === 'volunteer') return travelDistance !== '';
      return true;
    }
    return true;
  };

  const getTotalSteps = () => {
    if (selectedRole === 'family') return 2; // Role + Account only
    return 4; // Role + Account + Interests + Preferences
  };

  const handleSendOTP = async () => {
    console.log('handleSendOTP called', email);
    setLoading(true);
    try {
      console.log('Calling sendOTP...');
      const generatedCode = await sendOTP(email);
      console.log('OTP sent successfully:', generatedCode);
      setOtpSent(true);
      setResendTimer(30);
      if (generatedCode) {
        setGeneratedOTP(generatedCode);
        console.log('OTP code:', generatedCode);
      }
      toast.success('Verification code sent!');
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err: any) {
      console.error('Failed to send OTP:', err);
      toast.error(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    if (value && index === 3) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 4) {
        verifyOTP(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const verifyOTP = async (otpValue: string) => {
    setLoading(true);
    setOtpError('');
    try {
      const existingUser = await login(email, otpValue);
      setOtpVerified(true);
      toast.success('Email verified!');

      // Existing user: already authenticated by login().
      if (existingUser) {
        const userRole = existingUser.role?.toLowerCase();
        const dashboards: Record<string, string> = {
          elder: '/elder-dashboard',
          volunteer: '/volunteer-dashboard',
          family: '/family-dashboard',
        };
        router.push(dashboards[userRole] || '/elder-dashboard');
        return;
      }

      // New user: continue signup flow.
      setTimeout(() => {
        if (name.trim() && email.trim()) nextStep();
      }, 800);
    } catch (err: any) {
      const message = err?.message || 'Invalid OTP code. Please request a new one.';
      setOtpError(message);
      toast.error(message);
      setOtp(['', '', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      // Call backend signup endpoint
      const normalizedName = name.trim().replace(/\s+/g, ' ');
      const userData = await signup(email, selectedRole.toUpperCase(), normalizedName);

      // Persist role-specific signup selections immediately so dashboards show them on first load.
      if (selectedRole === 'volunteer') {
        const savedPrefs = await apiClient.updateUserPreferences({
          preferredActivityTypes: selectedInterests,
          availabilityDays: selectedAvailability,
          volunteerTravelDistance: travelDistance,
        });
        if (!savedPrefs.success) {
          toast.error('Account created, but failed to save volunteer preferences. Please review settings.')
        }
      }

      if (selectedRole === 'elder') {
        const savedPrefs = await apiClient.updateUserPreferences({
          preferredActivityTypes: selectedInterests,
          availabilityDays: preferredTime ? [preferredTime] : [],
        });
        if (!savedPrefs.success) {
          toast.error('Account created, but failed to save companion preferences. Please review settings.')
        }
      }

      if (address.trim()) {
        updateUser({
          ...(userData || {}),
          first_name: userData?.first_name || normalizedName,
          role: userData?.role || selectedRole.toUpperCase(),
          email,
          bio: [
            userData?.bio,
            `Address: ${address.trim()}`,
            addressPostcode ? `Postcode: ${addressPostcode}` : '',
            addressLatitude !== undefined && addressLongitude !== undefined
              ? `Coordinates: ${addressLatitude.toFixed(6)}, ${addressLongitude.toFixed(6)}`
              : '',
          ]
            .filter(Boolean)
            .join(' | '),
        });
      }
      
      toast.success('Account created successfully!');
      
      // Redirect to appropriate dashboard based on actual user role
      const userRole = userData?.role?.toLowerCase() || selectedRole;
      const dashboards: Record<string, string> = {
        elder: '/elder-dashboard',
        volunteer: '/volunteer-dashboard',
        family: '/family-dashboard',
      };
      router.push(dashboards[userRole] || '/elder-dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === getTotalSteps() - 1) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  const getAccentColor = () => {
    if (selectedRole === 'volunteer') return 'green';
    if (selectedRole === 'family') return 'blue';
    return 'primary';
  };

  return (
    <>
      <Head>
        <title>Sign Up - ElderConnect+</title>
      </Head>
      
      <div className={`min-h-screen bg-gradient-to-br ${
        selectedRole === 'volunteer' ? 'from-green-50 via-white to-emerald-50' :
        selectedRole === 'family' ? 'from-blue-50 via-white to-indigo-50' :
        'from-primary-50 via-white to-blue-50'
      } flex items-center justify-center p-4 transition-colors duration-500`}>
        <div className="w-full max-w-lg">
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            {Array.from({ length: getTotalSteps() }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div 
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i <= step 
                      ? selectedRole === 'volunteer' ? 'bg-green-600 scale-110' : 'bg-primary-600 scale-110'
                      : 'bg-gray-300'
                  }`}
                />
                {i < getTotalSteps() - 1 && (
                  <div className={`w-12 h-1 mx-1 rounded ${
                    i < step 
                      ? selectedRole === 'volunteer' ? 'bg-green-600' : 'bg-primary-600'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-50 ${
              selectedRole === 'volunteer' ? 'bg-green-100' : 'bg-primary-100'
            }`} />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-tr-full opacity-50" />
            
            <div className="relative">
              {/* Step 0: Choose Role */}
              {step === 0 && (
                <div className="animate-fadeIn">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Join ElderConnect+
                    </h1>
                    <p className="text-gray-600 text-lg">
                      How would you like to participate?
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Elder Option */}
                    <button
                      onClick={() => setSelectedRole('elder')}
                      className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                        selectedRole === 'elder'
                          ? 'border-primary-500 bg-primary-50 shadow-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        selectedRole === 'elder' ? 'bg-primary-100' : 'bg-gray-100'
                      }`}>
                        <Heart className={`w-7 h-7 ${selectedRole === 'elder' ? 'text-primary-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">I&apos;m an Elder</h3>
                        <p className="text-sm text-gray-600">Looking for companionship & support</p>
                      </div>
                      {selectedRole === 'elder' && <Check className="w-6 h-6 text-primary-600" />}
                    </button>

                    {/* Volunteer Option */}
                    <button
                      onClick={() => setSelectedRole('volunteer')}
                      className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                        selectedRole === 'volunteer'
                          ? 'border-green-500 bg-green-50 shadow-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        selectedRole === 'volunteer' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <HandHeart className={`w-7 h-7 ${selectedRole === 'volunteer' ? 'text-green-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">I&apos;m a Volunteer</h3>
                        <p className="text-sm text-gray-600">Ready to help & make a difference</p>
                      </div>
                      {selectedRole === 'volunteer' && <Check className="w-6 h-6 text-green-600" />}
                    </button>

                    {/* Family Option */}
                    <button
                      onClick={() => setSelectedRole('family')}
                      className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left flex items-center gap-4 ${
                        selectedRole === 'family'
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        selectedRole === 'family' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Users className={`w-7 h-7 ${selectedRole === 'family' ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">I&apos;m Family</h3>
                        <p className="text-sm text-gray-600">Supporting my elderly loved one</p>
                      </div>
                      {selectedRole === 'family' && <Check className="w-6 h-6 text-blue-600" />}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Join 10,000+ members</p>
                      <p className="text-sm text-gray-600">Building meaningful connections daily</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Account Details */}
              {step === 1 && (
                <div className="animate-fadeIn">
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      selectedRole === 'volunteer' ? 'bg-green-100' : 
                      selectedRole === 'family' ? 'bg-blue-100' : 'bg-primary-100'
                    }`}>
                      {selectedRole === 'elder' && <Heart className="w-8 h-8 text-primary-600" />}
                      {selectedRole === 'volunteer' && <HandHeart className="w-8 h-8 text-green-600" />}
                      {selectedRole === 'family' && <Users className="w-8 h-8 text-blue-600" />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedRole === 'volunteer' ? 'Thank you for volunteering!' : 'Welcome!'}
                    </h2>
                    <p className="text-gray-600">
                      Let&apos;s create your account
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="What should we call you?"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setOtpVerified(false); setOtpSent(false); }}
                          placeholder="your@email.com"
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                          disabled={otpVerified}
                        />
                        {!otpVerified && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={!email.includes('@') || resendTimer > 0}
                            className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                              !email.includes('@') || resendTimer > 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                            }`}
                          >
                            {resendTimer > 0 ? `${resendTimer}s` : otpSent ? 'Resend' : 'Verify'}
                          </button>
                        )}
                        {otpVerified && (
                          <div className="px-4 py-3 bg-green-100 rounded-xl flex items-center">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* OTP Input */}
                    {otpSent && !otpVerified && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-5 h-5 text-primary-600" />
                          <span className="text-sm font-medium text-gray-700">Enter verification code</span>
                        </div>
                        <div className="flex justify-center gap-2 mb-2">
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
                              className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg outline-none transition-all ${
                                digit 
                                  ? 'border-primary-500 bg-primary-50' 
                                  : 'border-gray-200 focus:border-primary-500'
                              }`}
                            />
                          ))}
                        </div>
                        {otpError && (
                          <p className="text-sm text-red-600 text-center">{otpError}</p>
                        )}
                        {generatedOTP && (
                          <p className="text-xs text-center text-blue-600 mt-2 font-mono font-bold bg-blue-50 p-2 rounded">
                            Code: {generatedOTP}
                          </p>
                        )}
                      </div>
                    )}

                    {otpVerified && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 text-sm font-medium">Email verified!</span>
                      </div>
                    )}
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    No password needed - we&apos;ll send you a code each time
                  </p>
                </div>
              )}

              {/* Step 2: Interests/Skills (Elder & Volunteer only) */}
              {step === 2 && selectedRole !== 'family' && (
                <div className="animate-fadeIn">
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      selectedRole === 'volunteer' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      <Sparkles className={`w-8 h-8 ${selectedRole === 'volunteer' ? 'text-purple-600' : 'text-blue-600'}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedRole === 'elder' ? `Hi ${name}! What brings you joy?` : `What are your superpowers, ${name}?`}
                    </h2>
                    <p className="text-gray-600">
                      {selectedRole === 'elder' 
                        ? 'Pick a few things you\'d enjoy with a companion'
                        : 'Choose what you\'d enjoy doing with elders'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {(selectedRole === 'elder' ? elderInterests : volunteerSkills).map((item) => {
                      const Icon = item.icon;
                      const isSelected = selectedInterests.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => toggleInterest(item.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative ${
                            isSelected 
                              ? selectedRole === 'volunteer'
                                ? 'border-green-500 bg-green-50 shadow-md scale-105'
                                : 'border-primary-500 bg-primary-50 shadow-md scale-105'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-2`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{item.label}</span>
                          {isSelected && (
                            <Check className={`w-5 h-5 absolute top-2 right-2 ${
                              selectedRole === 'volunteer' ? 'text-green-600' : 'text-primary-600'
                            }`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Volunteer: Also show availability */}
                  {selectedRole === 'volunteer' && (
                    <>
                      <div className="border-t border-gray-200 my-4 pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <span className="font-medium text-gray-700">When can you help?</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {availability.map((slot) => {
                            const isSelected = selectedAvailability.includes(slot.id);
                            return (
                              <button
                                key={slot.id}
                                onClick={() => toggleAvailability(slot.id)}
                                className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                                  isSelected 
                                    ? 'border-green-500 bg-green-50 text-green-700' 
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <p className="text-center text-sm text-gray-500">
                    Selected: {selectedInterests.length}
                  </p>
                </div>
              )}

              {/* Step 3: Time/Distance Preferences + Address */}
              {step === 3 && selectedRole !== 'family' && (
                <div className="animate-fadeIn">
                  {selectedRole === 'elder' ? (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          When works best for you?
                        </h2>
                        <p className="text-gray-600">
                          We&apos;ll match you with available companions
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        {[
                          { id: 'morning', label: '🌅 Morning', desc: '8 AM - 12 PM' },
                          { id: 'afternoon', label: '☀️ Afternoon', desc: '12 PM - 5 PM' },
                          { id: 'evening', label: '🌙 Evening', desc: '5 PM - 8 PM' },
                          { id: 'flexible', label: '✨ Flexible', desc: 'Anytime works!' },
                        ].map((time) => (
                          <button
                            key={time.id}
                            onClick={() => setPreferredTime(time.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between ${
                              preferredTime === time.id 
                                ? 'border-primary-500 bg-primary-50 shadow-md' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div>
                              <span className="font-medium text-gray-900 text-lg">{time.label}</span>
                              <p className="text-sm text-gray-500">{time.desc}</p>
                            </div>
                            {preferredTime === time.id && (
                              <Check className="w-6 h-6 text-primary-600" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Your Address (Optional)
                        </label>
                        <AddressAutocomplete
                          value={address}
                          onChange={(value) => {
                            setAddress(value);
                            setAddressPostcode('');
                            setAddressLatitude(undefined);
                            setAddressLongitude(undefined);
                          }}
                          onSelect={handleAddressSelect}
                          placeholder="Search your address or postcode"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          We&apos;ll use this to match you with nearby volunteers
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MapPin className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          How far can you travel?
                        </h2>
                        <p className="text-gray-600">
                          We&apos;ll match you with nearby elders
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        {[
                          { id: '5', label: '🚶 Walking Distance', desc: 'Up to 5 km' },
                          { id: '15', label: '🚲 Short Drive', desc: 'Up to 15 km' },
                          { id: '30', label: '🚗 Willing to Drive', desc: 'Up to 30 km' },
                          { id: '50', label: '🌍 Anywhere', desc: 'Distance no problem!' },
                        ].map((dist) => (
                          <button
                            key={dist.id}
                            onClick={() => setTravelDistance(dist.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center justify-between ${
                              travelDistance === dist.id 
                                ? 'border-green-500 bg-green-50 shadow-md' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div>
                              <span className="font-medium text-gray-900 text-lg">{dist.label}</span>
                              <p className="text-sm text-gray-500">{dist.desc}</p>
                            </div>
                            {travelDistance === dist.id && (
                              <Check className="w-6 h-6 text-green-600" />
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          Your Address (Optional)
                        </label>
                        <AddressAutocomplete
                          value={address}
                          onChange={(value) => {
                            setAddress(value);
                            setAddressPostcode('');
                            setAddressLatitude(undefined);
                            setAddressLongitude(undefined);
                          }}
                          onSelect={handleAddressSelect}
                          placeholder="Search your address or postcode"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          We&apos;ll use this to match you with nearby elders
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <Button
                    variant="secondary"
                    onClick={goBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className={`flex-1 ${
                    selectedRole === 'volunteer' ? 'bg-green-600 hover:bg-green-700' : ''
                  } ${step === getTotalSteps() - 1 ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  icon={step === getTotalSteps() - 1 ? <Sparkles className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                >
                  {step === getTotalSteps() - 1 ? 'Get Started!' : 'Continue'}
                </Button>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Log in
            </Link>
          </p>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </>
  );
}
