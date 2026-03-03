import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { BookOpen, Video, FileText, Download, ExternalLink } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const trainingModules = [
  { title: 'Introduction to ElderConnect+', duration: '30 min', description: 'Learn about our mission and values.' },
  { title: 'Communicating with Seniors', duration: '45 min', description: 'Best practices for compassionate communication.' },
  { title: 'Recognizing Health Concerns', duration: '60 min', description: 'Identify signs of distress or emergency.' },
  { title: 'Safety Protocols', duration: '30 min', description: 'Your safety and the elder\'s safety.' },
  { title: 'Using the ElderConnect+ App', duration: '20 min', description: 'Navigate the platform effectively.' },
];

const resources = [
  { title: 'Volunteer Handbook', description: 'Complete guide to volunteering', type: 'PDF', size: '2.4 MB' },
  { title: 'Conversation Starters', description: '50+ ideas to spark discussions', type: 'PDF', size: '1.1 MB' },
  { title: 'Activity Ideas', description: 'Games, crafts, and activities', type: 'PDF', size: '3.2 MB' },
  { title: 'Emergency Procedures', description: 'Quick reference guide', type: 'PDF', size: '0.8 MB' },
];

const stories = [
  { name: 'Maria S.', duration: '2 years volunteering', quote: 'My weekly visits with Harold have become the highlight of my week!', avatar: '👩' },
  { name: 'James T.', duration: '1 year volunteering', quote: 'I started volunteering after my grandmother passed. It helped me heal.', avatar: '👨' },
  { name: 'Aisha K.', duration: '3 years volunteering', quote: 'Now I lead a team of 10 volunteers in my neighborhood.', avatar: '👩‍🦱' },
];

export default function VolunteerResourcesPage() {
  return (
    <PublicLayout>
      <Head>
        <title>Volunteer Resources - ElderConnect+</title>
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">Volunteer Resources</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Everything you need to be a successful volunteer companion. Training, guides, and support.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Training Modules */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Training Program</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {trainingModules.map((module, index) => (
              <div 
                key={index}
                className={`p-6 flex items-center gap-4 ${
                  index !== trainingModules.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{module.title}</h3>
                  <p className="text-gray-600 text-sm">{module.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{module.duration}</span>
                  <Button variant="ghost" size="sm" className="mt-1">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            * Training must be completed before your first visit. Total time: ~3 hours.
          </p>
        </section>

        {/* Downloadable Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Downloadable Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                  <p className="text-gray-500 text-sm">{resource.type} • {resource.size}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Volunteer Stories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mb-4">
                  {story.avatar}
                </div>
                <p className="text-gray-700 italic mb-4">&quot;{story.quote}&quot;</p>
                <p className="font-semibold text-gray-900">{story.name}</p>
                <p className="text-sm text-gray-500">{story.duration}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Support */}
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Our volunteer support team is here for you. Reach out anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button>Contact Support</Button>
            </Link>
            <Link href="/faq">
              <Button variant="secondary">View FAQ</Button>
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
