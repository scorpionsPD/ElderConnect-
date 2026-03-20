import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(50);
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const finalAmount = useMemo(
    () => (selectedAmount === 'custom' ? Number(customAmount) || 0 : selectedAmount),
    [selectedAmount, customAmount],
  );

  useEffect(() => {
    const status = router.query.status;
    const donationId = router.query.donation_id;
    const sessionId = router.query.session_id;

    if (status !== 'success' || !donationId || !sessionId || !supabaseUrl || !supabaseAnonKey) {
      return;
    }

    const confirmSession = async () => {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/confirm-donation-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            donationId: String(donationId),
            sessionId: String(sessionId),
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || 'Unable to verify donation session');
        }

        setSubmitted(true);
        setError(null);
      } catch (sessionError) {
        setError(sessionError instanceof Error ? sessionError.message : 'Verification failed');
      }
    };

    void confirmSession();
  }, [router.query, supabaseUrl, supabaseAnonKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase environment variables are missing.');
      return;
    }

    if (finalAmount <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    if (!isAnonymous && (!name.trim() || !email.trim())) {
      setError('Name and email are required unless donating anonymously.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const successUrl = `${origin}/donate?status=success&donation_id={DONATION_ID}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}/donate?status=cancelled`;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-donation-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'GBP',
          donationType: 'ONE_TIME',
          donorName: isAnonymous ? null : name.trim(),
          donorEmail: isAnonymous ? null : email.trim(),
          donorMessage: message.trim() || null,
          isAnonymous,
          successUrl,
          cancelUrl,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Unable to create checkout session');
      }

      if (payload.checkout_url) {
        const checkoutUrl = String(payload.checkout_url);
        window.location.assign(checkoutUrl);
        return;
      }

      throw new Error('Checkout URL missing from server response.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Donation request failed');
    } finally {
      setSubmitting(false);
    }
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
            Your donation of £{finalAmount} will help bring companionship to seniors who need it most.
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
              <p className="text-2xl font-bold text-gray-900 mt-2">£{level.amount}</p>
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
                  <span className="text-xl text-gray-700">£</span>
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

        {/* Donation Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Complete Your Donation</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required={!isAnonymous}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required={!isAnonymous}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>
          <label className="mb-6 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            Donate anonymously
          </label>
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Your donation:</p>
              <p className="text-3xl font-bold text-primary-600">£{finalAmount}</p>
            </div>
            <Button type="submit" size="lg" disabled={finalAmount <= 0 || submitting}>
              {submitting ? 'Redirecting...' : 'Donate Now'}
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
