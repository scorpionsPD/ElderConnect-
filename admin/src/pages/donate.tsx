import React, { useState } from 'react';
import Head from 'next/head';
import { Gift, CheckCircle, Heart } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const impactLevels = [
  { amount: 25, title: 'Friend', description: 'Provides one companionship visit' },
  { amount: 50, title: 'Supporter', description: 'Covers volunteer training', popular: true },
  { amount: 100, title: 'Champion', description: 'Funds a month of weekly visits' },
  { amount: 250, title: 'Guardian', description: 'Supports emergency response for a quarter' },
];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const finalAmount = selectedAmount === 'custom' ? Number(customAmount) || 0 : selectedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PublicLayout>
        <Head>
          <title>Thank You - ElderConnect+</title>
        </Head>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your {isMonthly ? 'monthly' : ''} donation of ${finalAmount} will help bring companionship 
            to seniors who need it most.
          </p>
          <Button onClick={() => setSubmitted(false)}>Make Another Donation</Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Head>
        <title>Donate - ElderConnect+</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Gift className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">Make a Difference Today</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Your donation helps us connect lonely seniors with caring companions. 
            Every dollar brings more smiles, conversations, and friendship.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Impact Levels */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {impactLevels.map((level) => (
            <button
              key={level.amount}
              onClick={() => setSelectedAmount(level.amount)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedAmount === level.amount
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-primary-300'
              }`}
            >
              {level.popular && (
                <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <p className="text-2xl font-bold text-gray-900 mt-2">${level.amount}</p>
              <p className="text-sm font-medium text-gray-700">{level.title}</p>
              <p className="text-xs text-gray-500 mt-1">{level.description}</p>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="mb-8">
          <button
            onClick={() => setSelectedAmount('custom')}
            className={`w-full p-4 rounded-xl border-2 transition-all ${
              selectedAmount === 'custom'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-primary-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Custom Amount</span>
              {selectedAmount === 'custom' && (
                <div className="flex items-center">
                  <span className="text-xl text-gray-700">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-24 text-xl font-bold border-b-2 border-primary-600 bg-transparent focus:outline-none ml-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Monthly Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`font-medium ${!isMonthly ? 'text-gray-900' : 'text-gray-400'}`}>
            One-time
          </span>
          <button
            onClick={() => setIsMonthly(!isMonthly)}
            className={`w-14 h-8 rounded-full transition-colors ${
              isMonthly ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ml-1 ${
              isMonthly ? 'translate-x-6' : ''
            }`} />
          </button>
          <span className={`font-medium ${isMonthly ? 'text-gray-900' : 'text-gray-400'}`}>
            Monthly
          </span>
        </div>

        {/* Donation Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Your Donation</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Your {isMonthly ? 'monthly' : ''} donation:</p>
              <p className="text-3xl font-bold text-primary-600">${finalAmount}</p>
            </div>
            <Button type="submit" size="lg" disabled={finalAmount <= 0}>
              Donate Now
            </Button>
          </div>
        </form>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>Secure payment • Tax-deductible • 501(c)(3) nonprofit</span>
        </div>
      </div>
    </PublicLayout>
  );
}
