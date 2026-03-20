import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Building, Handshake, Gift, Users, Star, ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const partnerTypes = [
  {
    icon: <Building className="w-8 h-8" />,
    title: 'Corporate Partners',
    description: 'Engage employees in meaningful volunteer work and CSR initiatives.',
    benefits: ['Employee volunteer programs', 'Team building opportunities', 'CSR reporting support'],
  },
  {
    icon: <Handshake className="w-8 h-8" />,
    title: 'Healthcare Partners',
    description: 'Improve patient outcomes through companionship care.',
    benefits: ['Reduced patient isolation', 'Improved mental health', 'Care coordination support'],
  },
  {
    icon: <Gift className="w-8 h-8" />,
    title: 'Foundation Partners',
    description: 'Fund programs with measurable impact on senior loneliness.',
    benefits: ['Impact measurement reporting', 'Program customization', 'Grant management'],
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Community Partners',
    description: 'Join our network of local organizations bringing companionship.',
    benefits: ['Local volunteer recruitment', 'Shared resources', 'Training programs'],
  },
];

const currentPartners = [
  { name: 'HealthFirst Medical', type: 'Healthcare', since: '2021' },
  { name: 'TechCorp Foundation', type: 'Foundation', since: '2020' },
  { name: 'Sunrise Senior Living', type: 'Senior Care', since: '2021' },
  { name: 'Community Bank', type: 'Corporate', since: '2022' },
  { name: 'City of Edinburgh Council', type: 'Government', since: '2020' },
  { name: 'Age Scotland', type: 'Foundation', since: '2023' },
];

const impactStats = [
  { number: '50+', label: 'Active Partners' },
  { number: '$2M+', label: 'Partner Contributions' },
  { number: '5,000+', label: 'Employee Volunteers' },
  { number: '25', label: 'Cities Served' },
];

export default function PartnersPage() {
  return (
    <PublicLayout>
      <Head>
        <title>Partners - ElderConnect+</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Partner With Us</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Together, we can end the loneliness epidemic affecting millions of seniors.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Become a Partner
          </Button>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-primary-600 mb-1">{stat.number}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Partnership Opportunities</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We offer flexible partnership models to match your organization&apos;s goals.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {partnerTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                  {type.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-600 mb-4">{type.description}</p>
                <ul className="space-y-2">
                  {type.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="mt-4">
                  Learn More <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Our Partners</h2>
          <p className="text-gray-600 text-center mb-12">
            We&apos;re proud to work with these organizations in our mission.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {currentPartners.map((partner, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                <p className="text-sm text-gray-500">{partner.type}</p>
                <p className="text-xs text-gray-400 mt-1">Partner since {partner.since}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-lg opacity-90 mb-8">
            Let&apos;s discuss how a partnership can benefit your organization and seniors in your community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Schedule a Call
            </Button>
            <Link href="/contact">
              <Button size="lg" variant="ghost" className="border-2 border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
