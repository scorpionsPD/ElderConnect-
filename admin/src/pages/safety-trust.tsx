import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Shield, CheckCircle, UserCheck, GraduationCap, Phone, AlertTriangle } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const safetyFeatures = [
  {
    icon: <UserCheck className="w-8 h-8" />,
    title: 'Profile Review',
    description: 'Volunteer profiles, activity history, and reporting tools support safer coordination at launch.',
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Clear Access Controls',
    description: 'Role-based access, family permissions, and request-level workflows help keep information scoped correctly.',
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: 'Safety Guidance',
    description: 'The platform is designed to reinforce safe communication, boundaries, and escalation paths.',
  },
  {
    icon: <Phone className="w-8 h-8" />,
    title: 'Emergency Alerts',
    description: 'Emergency actions can notify trusted contacts quickly when urgent help is needed.',
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
        <meta
          name="description"
          content="Understand how ElderConnect+ approaches safety, reporting, family visibility, and emergency support at launch."
        />
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">Your Safety is Our Priority</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            ElderConnect+ is designed to support safer companionship with clear reporting, family visibility, and emergency tools.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How We Manage Trust At Launch</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {[
              { step: 1, title: 'Profile Setup', description: 'Users complete role-specific profile details and preferences.' },
              { step: 2, title: 'Connection Review', description: 'Requests, family links, and access rules are checked in-platform.' },
              { step: 3, title: 'Messaging & History', description: 'Request activity and communication stay visible in the product.' },
              { step: 4, title: 'Family Awareness', description: 'Families can stay informed through connected views and notifications.' },
              { step: 5, title: 'Escalation', description: 'Emergency actions and reporting tools are available when something feels wrong.' },
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
                <li>• Contact your family member, emergency contact, or local support network</li>
                <li>• For immediate danger, always call <strong>999</strong></li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Start your ElderConnect+ journey with a safety-first approach to companionship.
          </p>
          <Link href="/signup">
            <Button size="lg">Sign Up Now</Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
