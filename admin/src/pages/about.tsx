import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Users, Target, Award, MapPin } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const team = [
  {
    name: 'Program Leadership',
    role: 'Strategy & Operations',
    bio: 'Guides service quality, safeguarding standards, and long-term program direction.',
    avatar: '🧭',
  },
  {
    name: 'Community Team',
    role: 'Volunteer Support',
    bio: 'Supports onboarding, training, and day-to-day volunteer coordination.',
    avatar: '🤝',
  },
  {
    name: 'Care Coordination',
    role: 'Elder & Family Support',
    bio: 'Helps elders and families access companionship with clear communication and continuity.',
    avatar: '❤️',
  },
  {
    name: 'Product & Engineering',
    role: 'Platform Experience',
    bio: 'Builds reliable tools that keep companionship services simple, safe, and accessible.',
    avatar: '💻',
  },
];

const milestones = [
  { year: 'Phase 1', title: 'Research & Listening', description: 'Started from conversations about loneliness, isolation, and practical support needs.' },
  { year: 'Phase 2', title: 'Service Design', description: 'Shaped the platform around companionship, family visibility, and emergency support.' },
  { year: 'Phase 3', title: 'Safeguarding Focus', description: 'Refined trust, reporting, and care coordination features for launch readiness.' },
  { year: 'Phase 4', title: 'Product Build', description: 'Built web and mobile experiences for elders, volunteers, and families.' },
  { year: 'Phase 5', title: 'Launch Preparation', description: 'Prepared the platform for an initial public rollout in the UK.' },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <Head>
        <title>About Us - ElderConnect+</title>
        <meta
          name="description"
          content="Learn about the mission behind ElderConnect+ and how the platform is being prepared for an initial UK launch."
        />
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
              alone, without meaningful human connection. Our team saw this need firsthand
              through community support work and local care experiences.
            </p>
            <p>
              The project has grown from that initial idea into a launch-ready platform focused on companionship, family communication, and practical support.
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
            ElderConnect+ is preparing for an initial UK launch, with product and service design centred on local community use.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Mission</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/donate">
              <Button size="lg" variant="secondary">Support With a Donation</Button>
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
