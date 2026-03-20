import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Users, Target, Award, MapPin } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const team = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Founder & CEO',
    bio: 'Former geriatric physician with 20 years of experience. Founded ElderConnect+ after seeing the impact of loneliness on her patients.',
    avatar: '👩‍⚕️',
  },
  {
    name: 'Michael Torres',
    role: 'Chief Operations Officer',
    bio: 'Non-profit veteran with experience scaling social impact organizations across the country.',
    avatar: '👨‍💼',
  },
  {
    name: 'Emily Roberts',
    role: 'Head of Volunteer Programs',
    bio: 'Started as a volunteer herself and now leads training and support for our volunteer community.',
    avatar: '👩',
  },
  {
    name: 'David Kim',
    role: 'Chief Technology Officer',
    bio: 'Tech for good advocate. Previously built accessibility tools at major tech companies.',
    avatar: '👨‍💻',
  },
];

const milestones = [
  { year: '2020', title: 'Founded', description: 'Started in Edinburgh, Scotland' },
  { year: '2021', title: 'Early Community Growth', description: 'Expanded local companionship support' },
  { year: '2022', title: 'Program Development', description: 'Strengthened safety and volunteer training' },
  { year: '2023', title: 'Service Expansion', description: 'Broadened support for elders and families' },
  { year: '2024', title: 'Mobile Experience', description: 'Improved access through the app' },
  { year: '2025', title: 'UK Rollout', description: 'Prepared for wider launch across the UK' },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <Head>
        <title>About Us - ElderConnect+</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-pink-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            To ensure no senior feels alone by connecting them with caring volunteers 
            who bring friendship, joy, and support into their lives.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Story */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
          </div>
          <div className="prose prose-lg text-gray-600 space-y-4">
            <p>
              ElderConnect+ was born from a simple observation: too many seniors spend their days 
              alone, without meaningful human connection. Our founder, Dr. Sarah Chen, saw this 
              firsthand during her 20 years as a geriatric physician.
            </p>
            <p>
              In 2020, she decided to do something about it. What started with 10 volunteers 
              visiting seniors in Edinburgh has grown into a community effort spanning towns and cities across the UK.
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {milestone.year}
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm flex-1">
                  <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Values</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Compassion', description: 'Every interaction is guided by empathy and care.', emoji: '💜' },
              { title: 'Community', description: 'We believe in the power of human connection.', emoji: '🤝' },
              { title: 'Respect', description: 'We honor the dignity and wisdom of every senior.', emoji: '🌟' },
              { title: 'Joy', description: 'We bring happiness and laughter into lives.', emoji: '😊' },
            ].map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <span className="text-3xl mb-3 block">{value.emoji}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Our Team</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 text-sm mb-2">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="bg-gray-100 rounded-2xl p-8 text-center mb-12">
          <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Where We Operate</h2>
          <p className="text-gray-600 mb-4">
            ElderConnect+ is active across Scotland, England, Wales, and Northern Ireland.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
          <div className="flex justify-center">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
