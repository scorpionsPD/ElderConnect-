import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  HandHeart, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Check,
  Coffee,
  BookOpen,
  Music,
  Gamepad2,
  ShoppingBag,
  Car,
  Sparkles,
  Star
} from 'lucide-react';
import Button from '@/components/Button';

const skills = [
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

export default function VolunteerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [travelDistance, setTravelDistance] = useState('');

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAvailability = (id: string) => {
    setSelectedAvailability(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    // Save onboarding data to localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      user.onboardingComplete = true;
      user.profile = { name, skills: selectedSkills, availability: selectedAvailability, travelDistance };
      localStorage.setItem('user', JSON.stringify(user));
    }
    router.push('/volunteer-dashboard');
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return selectedSkills.length > 0;
    if (step === 2) return selectedAvailability.length > 0 && travelDistance !== '';
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i <= step ? 'bg-green-600 scale-110' : 'bg-gray-300'
                }`}
              />
              {i < 2 && (
                <div className={`w-12 h-1 mx-1 rounded ${
                  i < step ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-bl-full opacity-50" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-100 rounded-tr-full opacity-50" />
          
          <div className="relative">
            {/* Step 0: Welcome & Name */}
            {step === 0 && (
              <div className="text-center animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HandHeart className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Thank You for Volunteering!
                </h1>
                <p className="text-gray-600 mb-8 text-lg">
                  Your kindness will make a real difference. Let&apos;s set you up.
                </p>
                
                <div className="text-left mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What&apos;s your name?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your first name"
                    className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    autoFocus
                  />
                </div>

                {/* Impact Stats */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Join our volunteer community</p>
                    <p className="text-sm text-gray-600">Helping elders feel connected and supported</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Skills & Interests */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    What are your superpowers, {name}?
                  </h2>
                  <p className="text-gray-600">
                    Choose what you&apos;d enjoy doing with elders
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {skills.map((skill) => {
                    const Icon = skill.icon;
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => toggleSkill(skill.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left relative ${
                          isSelected 
                            ? 'border-green-500 bg-green-50 shadow-md scale-105' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${skill.color} flex items-center justify-center mb-2`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{skill.label}</span>
                        {isSelected && (
                          <Check className="w-5 h-5 text-green-600 absolute top-2 right-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-center text-sm text-gray-500">
                  Selected: {selectedSkills.length} {selectedSkills.length === 1 ? 'skill' : 'skills'}
                </p>
              </div>
            )}

            {/* Step 2: Availability & Location */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    When can you help?
                  </h2>
                  <p className="text-gray-600">
                    Select your available times
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {availability.map((slot) => {
                    const isSelected = selectedAvailability.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        onClick={() => toggleAvailability(slot.id)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          isSelected 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                        {slot.label}
                      </button>
                    );
                  })}
                </div>

                {/* Travel Distance */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <MapPin className="w-4 h-4" />
                    How far can you travel?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '5', label: '5 km' },
                      { id: '15', label: '15 km' },
                      { id: '30', label: '30+ km' },
                    ].map((dist) => (
                      <button
                        key={dist.id}
                        onClick={() => setTravelDistance(dist.id)}
                        className={`p-3 rounded-lg border-2 font-medium transition-all ${
                          travelDistance === dist.id 
                            ? 'border-green-500 bg-green-50 text-green-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {dist.label}
                      </button>
                    ))}
                  </div>
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
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  icon={<HandHeart className="w-5 h-5" />}
                >
                  Start Helping!
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Skip Link */}
        <p className="text-center mt-6 text-gray-500">
          <button 
            onClick={() => router.push('/volunteer-dashboard')}
            className="hover:text-green-600 underline"
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
