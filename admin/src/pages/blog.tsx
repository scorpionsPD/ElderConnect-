import React from 'react';
import Head from 'next/head';
import { Clock, Users, TrendingUp, Star } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

const blogPosts = [
  {
    id: 1,
    title: 'The Power of Intergenerational Friendships',
    excerpt: 'Discover how connections between generations benefit both seniors and young volunteers.',
    author: 'Dr. Sarah Chen',
    date: 'January 15, 2024',
    category: 'Research',
    readTime: '5 min read',
    image: '👵👨‍🦱',
  },
  {
    id: 2,
    title: 'Tips for Your First Companion Visit',
    excerpt: 'Nervous about your first visit? Here are 10 tips to help you connect.',
    author: 'Maria Santos',
    date: 'January 10, 2024',
    category: 'Volunteer Tips',
    readTime: '4 min read',
    image: '🤝',
  },
  {
    id: 3,
    title: 'How Technology Keeps Families Connected',
    excerpt: 'Learn how ElderConnect+ helps families stay informed about their loved ones.',
    author: 'James Wilson',
    date: 'January 5, 2024',
    category: 'Technology',
    readTime: '3 min read',
    image: '📱',
  },
  {
    id: 4,
    title: 'Celebrating 100,000 Companion Visits',
    excerpt: 'We\'ve reached a major milestone! Here\'s a look at the impact we\'ve made.',
    author: 'ElderConnect+ Team',
    date: 'December 28, 2023',
    category: 'News',
    readTime: '2 min read',
    image: '🎉',
  },
  {
    id: 5,
    title: 'Loneliness Among Seniors: Understanding the Crisis',
    excerpt: 'A deep dive into the loneliness epidemic affecting millions of seniors worldwide.',
    author: 'Dr. Michael Park',
    date: 'December 20, 2023',
    category: 'Research',
    readTime: '7 min read',
    image: '📊',
  },
  {
    id: 6,
    title: 'Volunteer Spotlight: Meet Harold, 82',
    excerpt: 'Yes, you read that right—Harold is one of our oldest volunteers!',
    author: 'Lisa Thompson',
    date: 'December 15, 2023',
    category: 'Stories',
    readTime: '4 min read',
    image: '🌟',
  },
];

const categories = ['All', 'Research', 'Volunteer Tips', 'Technology', 'News', 'Stories'];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <PublicLayout>
      <Head>
        <title>Blog - ElderConnect+</title>
      </Head>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stories, research, and tips about companionship, aging, and building meaningful connections.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 text-primary-600 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-2xl font-bold">50+</span>
            </div>
            <p className="text-gray-500 text-sm">Articles Published</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-2xl font-bold">10K+</span>
            </div>
            <p className="text-gray-500 text-sm">Monthly Readers</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-600 mb-2">
              <Star className="w-5 h-5" />
              <span className="text-2xl font-bold">20+</span>
            </div>
            <p className="text-gray-500 text-sm">Expert Contributors</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gradient-to-br from-primary-50 to-pink-50 flex items-center justify-center text-5xl">
                {post.image}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{post.author}</p>
                    <p className="text-xs text-gray-400">{post.date}</p>
                  </div>
                  <Button variant="ghost" size="sm">Read More</Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter */}
        <section className="bg-gradient-to-r from-primary-50 to-pink-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-6">
            Get the latest articles delivered to your inbox.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button>Subscribe</Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
