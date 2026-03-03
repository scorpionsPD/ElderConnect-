import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Phone, Calendar, Shield, Users, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const steps = [
  { step: 1, title: 'Create Your Account', description: 'Sign up with your phone number or email.', icon: <Phone className="w-6 h-6" /> },
  { step: 2, title: 'Tell Us About Yourself', description: 'Share your interests and preferences.', icon: <Users className="w-6 h-6" /> },
  { step: 3, title: 'Get Matched', description: 'We\'ll find volunteers who share your interests.', icon: <CheckCircle className="w-6 h-6" /> },
  { step: 4, title: 'Schedule Visits', description: 'Choose times that work for you.', icon: <Calendar className="w-6 h-6" /> },
];

const activities = [
  { emoji: '☕', title: 'Coffee & Chat', description: 'Enjoy conversation' },
  { emoji: '🎮', title: 'Games', description: 'Cards, board games' },
  { emoji: '📚', title: 'Reading', description: 'Share stories' },
  { emoji: '🚶', title: 'Walks', description: 'Fresh air together' },
  { emoji: '🎨', title: 'Crafts', description: 'Creative projects' },
  { emoji: '💻', title: 'Tech Help', description: 'Learn technology' },
];

const faqs = [
  { question: 'Is ElderConnect+ free?', answer: 'Yes! Our services are completely free for seniors.' },
  { question: 'Are the volunteers safe?', answer: 'All volunteers undergo background checks and training.' },
  { question: 'Can I choose my companion?', answer: 'Yes! You can accept or decline any match.' },
  { question: 'What if I need help in an emergency?', answer: 'Use our one-touch emergency button anytime.' },
];

export default function ElderGuidePage() {
  return (
    <PublicLayout>
      <Head>
        <title>Elder Guide - ElderConnect+</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6">👋</div>
          <h1 className="text-4xl font-bold mb-4">Welcome to ElderConnect+</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Your guide to enjoying friendly companionship, staying connected, and living life to the fullest.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Getting Started</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step) => (
              <div key={step.step} className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-600">
                  {step.icon}
                </div>
                <div>
                  <span className="text-sm font-medium text-primary-600">Step {step.step}</span>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activities */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Things to Do Together</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activities.map((activity, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="text-4xl mb-3">{activity.emoji}</div>
                <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{activity.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety */}
        <section className="mb-12 bg-green-50 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Safety Comes First</h2>
              <p className="text-gray-600">We take your safety very seriously.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'All volunteers are background-checked',
              'Identity verification required',
              'Mandatory safety training',
              'Regular check-ins during visits',
              'One-touch emergency button',
              'Family notifications available',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency */}
        <section className="mb-12 bg-red-50 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Emergency Help</h2>
              <p className="text-gray-600 mb-4">
                If you ever need help urgently, use the red emergency button in the app.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Alert your emergency contacts immediately</li>
                <li>• Notify our support team</li>
                <li>• Call emergency services if needed</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/faq">
              <Button variant="secondary">View All FAQs</Button>
            </Link>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-2xl p-8 shadow-sm mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Need Help?</h2>
              <p className="text-gray-600">Our friendly team is here to assist you.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Call Us</p>
              <p className="text-lg font-semibold text-gray-900">1-800-ELDER-HELP</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Email Us</p>
              <p className="text-lg font-semibold text-gray-900">help@elderconnect.com</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-primary-50 to-pink-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands of seniors already enjoying companionship and connection.
          </p>
          <Link href="/signup">
            <Button size="lg">Sign Up Now</Button>
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
}
