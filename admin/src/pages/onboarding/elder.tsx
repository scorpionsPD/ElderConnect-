import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Heart, 
  Users, 
  Phone, 
  ArrowRight, 
  Check,
  Coffee,
  BookOpen,
  Music,
  Gamepad2,
  ShoppingBag,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import Button from '@/components/Button';

const interests = [
  { id: 'conversation', label: 'Friendly Chats', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
  { id: 'reading', label: 'Reading & Stories', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  { id: 'music', label: 'Music & Singing', icon: Music, color: 'bg-purple-100 text-purple-600' },
  { id: 'games', label: 'Games & Puzzles', icon: Gamepad2, color: 'bg-green-100 text-green-600' },
  { id: 'errands', label: 'Help with Errands', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
  { id: 'health', label: 'Health Check-ins', icon: Stethoscope, color: 'bg-red-100 text-red-600' },
];

export default function ElderOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [preferredTime, setPreferredTime] = useState('');
  const [name, setName] = useState('');

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    // Save onboarding data to localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      user.onboardingComplete = true;
      user.profile = { name, interests: selectedInterests, preferredTime };
      localStorage.setItem('user', JSON.stringify(user));
    }
    router.push('/elder-dashboard');
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return selectedInterests.length > 0;
    if (step === 2) return preferredTime !== '';
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-primary-600 scale-110' : 'bg-gray-300'
                }`}
              />
              {i < 2 && (
                <div className={`w-12 h-1 mx-1 rounded ${
                  i < step ? 'bg-primary-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-bl-full opacity-50" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-tr-full opacity-50" />
          
          <div className="relative">
            {/* Step 0: Welcome & Name */}
            {step === 0 && (
              <div className="text-center animate-fadeIn">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-primary-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to ElderConnect+
                </h1>
                <p className="text-gray-600 mb-8 text-lg">
                  We&apos;re so glad you&apos;re here! Let&apos;s get to know you.
                </p>
                
                <div className="text-left mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your first name"
                    className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    autoFocus
                  />
                </div>

                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  You can update your full profile anytime
                </p>
              </div>
            )}

            {/* Step 1: Select Interests */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Hi {name}! What brings you joy?
                  </h2>
                  <p className="text-gray-600">
                    Pick a few things you&apos;d enjoy with a companion
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {interests.map((interest) => {
                    const Icon = interest.icon;
                    const isSelected = selectedInterests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                          isSelected 
                            ? 'border-primary-500 bg-primary-50 shadow-md scale-105' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${interest.color} flex items-center justify-center mb-2`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{interest.label}</span>
                        {isSelected && (
                          <Check className="w-5 h-5 text-primary-600 absolute top-2 right-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-center text-sm text-gray-500">
                  Selected: {selectedInterests.length} {selectedInterests.length === 1 ? 'interest' : 'interests'}
                </p>
              </div>
            )}

            {/* Step 2: Preferred Time */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-green-600" />
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
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              
              {step < 2 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="flex-1"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  Let&apos;s Get Started!
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Skip Link */}
        <p className="text-center mt-6 text-gray-500">
          <button 
            onClick={() => router.push('/elder-dashboard')}
            className="hover:text-primary-600 underline"
          >
            Skip for now
          </button>
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
  );
}
