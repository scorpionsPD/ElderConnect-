import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MapPin, Users, Sparkles, Clock, DollarSign } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const jobOpenings = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Edinburgh, Scotland (Hybrid)',
    type: 'Full-time',
    salary: '£80K - £110K',
    description: 'Build features that connect seniors with caring companions.',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    salary: '£60K - £80K',
    description: 'Design intuitive, accessible experiences for seniors and volunteers.',
  },
  {
    id: 3,
    title: 'Community Manager',
    department: 'Operations',
    location: 'Glasgow, Scotland',
    type: 'Full-time',
    salary: '£35K - £45K',
    description: 'Build and nurture our volunteer community.',
  },
  {
    id: 4,
    title: 'Customer Support Specialist',
    department: 'Support',
    location: 'Remote',
    type: 'Full-time',
    salary: '£28K - £35K',
    description: 'Help seniors and families navigate our platform with patience.',
  },
];

const benefits = [
  { icon: '🏥', title: 'Health & Wellness', description: 'Full medical, dental, vision' },
  { icon: '🏖️', title: 'Flexible PTO', description: 'Unlimited vacation' },
  { icon: '🏠', title: 'Remote Friendly', description: 'Work from anywhere' },
  { icon: '📚', title: 'Learning Budget', description: '£1,500/year' },
  { icon: '💰', title: 'Pension', description: 'Workplace pension with 5% employer contribution' },
  { icon: '👶', title: 'Parental Leave', description: '16 weeks paid' },
  { icon: '🧘', title: 'Wellness Stipend', description: '$100/month' },
  { icon: '📱', title: 'Equipment', description: 'Mac/PC of choice' },
];

const values = [
  { title: 'Impact First', description: 'Every decision is guided by our mission.' },
  { title: 'Empathy Always', description: 'We approach every interaction with compassion.' },
  { title: 'Inclusive by Design', description: 'We build accessible products and foster diversity.' },
  { title: 'Growth Mindset', description: 'We embrace challenges and learn from failures.' },
];

export default function CareersPage() {
  return (
    <PublicLayout>
      <Head>
        <title>Careers - ElderConnect+</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-pink-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Mission</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Help us build technology that brings joy to seniors and makes the world less lonely.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>45 Team Members</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>3 Locations + Remote</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Series A Funded</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                import type { GetServerSideProps } from 'next';

                export default function CareersPage() {
                  return null;
                }

                export const getServerSideProps: GetServerSideProps = async () => {
                  return {
                    notFound: true,
                  };
                };
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Why Join Us</h2>
