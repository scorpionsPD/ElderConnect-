import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const faqs = {
  elders: [
    {
      question: 'Is ElderConnect+ really free?',
      answer: 'Yes! ElderConnect+ is 100% free for seniors and their families. We are a non-profit organization funded by donations and grants.',
    },
    {
      question: 'How do I get matched with a volunteer?',
      answer: 'After you sign up and complete your profile, our matching system considers your interests, location, preferred activities, and schedule. We then suggest compatible volunteers.',
    },
    {
      question: 'What if I don\'t get along with my volunteer?',
      answer: 'That\'s completely okay! You can request a new volunteer at any time through your dashboard or by contacting support.',
    },
    {
      question: 'What activities can I do with my volunteer?',
      answer: 'Whatever you enjoy! Common activities include conversation, reading together, playing games, going for walks, help with technology, and light errands.',
    },
  ],
  volunteers: [
    {
      question: 'What are the requirements to volunteer?',
      answer: 'You must be at least 18 years old, pass a background check, provide references, and complete our training program.',
    },
    {
      question: 'How much time do I need to commit?',
      answer: 'We ask for a minimum commitment of 2-4 hours per week for at least 6 months. Consistency is important for building meaningful relationships.',
    },
    {
      question: 'What training is provided?',
      answer: 'We provide free online training covering communication with seniors, safety protocols, recognizing health concerns, and how to use our platform. About 4 hours total.',
    },
  ],
  family: [
    {
      question: 'Can I monitor my parent\'s visits?',
      answer: 'Yes! Family members can receive notifications about scheduled visits, check-ins, and overall activity through the family dashboard.',
    },
    {
      question: 'How do I know the volunteers are trustworthy?',
      answer: 'All volunteers undergo comprehensive background checks, provide references, and complete our training program. We also have regular check-ins and monitoring.',
    },
  ],
};

const categories = [
  { id: 'all', label: 'All Questions' },
  { id: 'elders', label: 'For Elders' },
  { id: 'volunteers', label: 'For Volunteers' },
  { id: 'family', label: 'For Family' },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const allFaqs = [
    ...faqs.elders.map(f => ({ ...f, category: 'elders' })),
    ...faqs.volunteers.map(f => ({ ...f, category: 'volunteers' })),
    ...faqs.family.map(f => ({ ...f, category: 'family' })),
  ];

  const filteredFaqs = allFaqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (question: string) => {
    setOpenItems(prev => 
      prev.includes(question) ? prev.filter(q => q !== question) : [...prev, question]
    );
  };

  return (
    <PublicLayout>
      <Head>
        <title>FAQ - ElderConnect+</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find answers to common questions about ElderConnect+</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3 mb-12">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleItem(faq.question)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {openItems.includes(faq.question) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openItems.includes(faq.question) && (
                <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-primary-50 to-pink-50 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h2>
          <p className="text-gray-600 mb-4">Our team is here to help you.</p>
          <Link href="/contact">
            <Button>Contact Us</Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
