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
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    salary: '$150K - $200K',
    description: 'Build features that connect seniors with caring companions.',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    salary: '$120K - $160K',
    description: 'Design intuitive, accessible experiences for seniors and volunteers.',
  },
  {
    id: 3,
    title: 'Community Manager',
    department: 'Operations',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$70K - $90K',
    description: 'Build and nurture our volunteer community.',
  },
  {
    id: 4,
    title: 'Customer Support Specialist',
    department: 'Support',
    location: 'Remote',
    type: 'Full-time',
    salary: '$50K - $65K',
    description: 'Help seniors and families navigate our platform with patience.',
  },
];

const benefits = [
  { icon: '🏥', title: 'Health & Wellness', description: 'Full medical, dental, vision' },
  { icon: '🏖️', title: 'Flexible PTO', description: 'Unlimited vacation' },
  { icon: '🏠', title: 'Remote Friendly', description: 'Work from anywhere' },
  { icon: '📚', title: 'Learning Budget', description: '$2,000/year' },
  { icon: '💰', title: 'Retirement', description: '401(k) with 4% match' },
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Why Join Us</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We believe happy, supported team members do their best work.
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm text-center">
                <div className="text-3xl mb-3">{benefit.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-gray-500 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Open Positions</h2>
          <p className="text-gray-600 text-center mb-12">
            {jobOpenings.length} opportunities to make a difference
          </p>
          <div className="space-y-4">
            {jobOpenings.map((job) => (
              <div key={job.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                        {job.department}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        {job.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                  <Button>Apply Now</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-50 to-pink-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Don&apos;t See a Perfect Fit?</h2>
          <p className="text-gray-600 mb-6">
            Send us your resume and tell us how you&apos;d like to contribute.
          </p>
          <Button variant="secondary">Submit General Application</Button>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Hiring Process</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {[
              { step: 1, title: 'Apply', description: 'Submit your application', time: '5 min' },
              { step: 2, title: 'Screen', description: 'Quick intro call', time: '30 min' },
              { step: 3, title: 'Interview', description: 'Meet the team', time: '2-3 hrs' },
              { step: 4, title: 'Offer', description: 'Accept your offer!', time: '🎉' },
            ].map((step, index) => (
              <div key={index} className="flex-1 relative">
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm mb-2">{step.description}</p>
                  <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
