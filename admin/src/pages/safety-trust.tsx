import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Shield, CheckCircle, UserCheck, GraduationCap, Phone, AlertTriangle } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const safetyFeatures = [
  {
    icon: <UserCheck className="w-8 h-8" />,
    title: 'Background Checks',
    description: 'Every volunteer undergoes comprehensive criminal background checks before joining.',
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Identity Verification',
    description: 'We verify the identity of all users through government-issued ID and address verification.',
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: 'Training Required',
    description: 'All volunteers complete our safety and communication training program.',
  },
  {
    icon: <Phone className="w-8 h-8" />,
    title: 'Regular Check-ins',
    description: 'Our team conducts regular check-ins and monitors all visits for quality and safety.',
  },
];

const elderTips = [
  'Always meet volunteers for the first time with a family member present if possible',
  'Never share financial information or passwords with anyone',
  'Use the emergency button if you ever feel uncomfortable',
  'Let your family know your visit schedule',
  'Trust your instincts—you can end a visit at any time',
];

const familyTips = [
  'Review your loved one\'s volunteer match before the first visit',
  'Set up family notifications to stay informed about visits',
  'Have a conversation about safety and boundaries',
  'Know how to use the emergency features',
  'Provide feedback after visits to help us improve',
];

export default function SafetyTrustPage() {
  return (
    <PublicLayout>
      <Head>
        <title>Safety & Trust - ElderConnect+</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">Your Safety is Our Priority</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            We&apos;ve built multiple layers of protection to ensure every interaction on ElderConnect+ is safe and positive.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Safety Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How We Keep You Safe</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="mb-16 bg-gray-100 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Vetting Process</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {[
              { step: 1, title: 'Application', description: 'Detailed application with references' },
              { step: 2, title: 'Background Check', description: 'Comprehensive criminal background check' },
              { step: 3, title: 'Interview', description: 'Personal interview with our team' },
              { step: 4, title: 'Training', description: '4+ hours of safety and skills training' },
              { step: 5, title: 'Monitoring', description: 'Ongoing oversight and feedback' },
            ].map((item, index) => (
              <div key={index} className="flex-1 bg-white rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tips */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Safety Tips for Elders</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <ul className="space-y-3">
                {elderTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tips for Family Members</h2>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <ul className="space-y-3">
                {familyTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* Emergency */}
        <section className="bg-red-50 rounded-2xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Emergency Procedures</h2>
              <p className="text-gray-600 mb-4">
                If you ever feel unsafe or uncomfortable during a visit:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Press the <strong>Emergency Button</strong> in the app</li>
                <li>• Call our 24/7 safety line: <strong>1-800-ELDER-SAFE</strong></li>
                <li>• For immediate danger, always call <strong>911</strong></li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Join thousands who trust ElderConnect+ for safe, meaningful companionship.
          </p>
          <Link href="/signup">
            <Button size="lg">Sign Up Now</Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
