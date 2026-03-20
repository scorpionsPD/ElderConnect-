import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Heart, 
  HandHeart, 
  Users, 
  Phone, 
  MessageCircle, 
  Calendar,
  Shield,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  Coffee,
  BookOpen,
  Music,
  Gamepad2,
  Gift,
  ArrowRight,
  Menu,
  X,
  Quote
} from 'lucide-react';
import Button from '@/components/Button';

// Feature cards data
const features = [
  {
    icon: MessageCircle,
    title: 'Friendly Companionship',
    description: 'Regular visits and calls from caring volunteers who become like family.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Phone,
    title: 'Emergency Support',
    description: '24/7 emergency alert system with immediate response from our care network.',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: Calendar,
    title: 'Health Check-ins',
    description: 'Regular wellness checks to ensure you\'re feeling your best every day.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Users,
    title: 'Family Connection',
    description: 'Keep families informed and connected with real-time updates and messaging.',
    color: 'bg-purple-100 text-purple-600',
  },
];

// Activities data
const activities = [
  { icon: Coffee, label: 'Friendly Chats', color: 'bg-amber-100 text-amber-600' },
  { icon: BookOpen, label: 'Reading Together', color: 'bg-blue-100 text-blue-600' },
  { icon: Music, label: 'Music & Singing', color: 'bg-purple-100 text-purple-600' },
  { icon: Gamepad2, label: 'Games & Puzzles', color: 'bg-green-100 text-green-600' },
];

// Testimonials
const testimonials = [
  {
    quote: "ElderConnect+ gave me back my sense of purpose. My volunteer Sarah visits every week, and we've become true friends.",
    name: "Margaret, 78",
    role: "Elder Member",
    avatar: "👵",
  },
  {
    quote: "Knowing my mother has regular companionship gives our family such peace of mind. The health updates are invaluable.",
    name: "David Chen",
    role: "Family Member",
    avatar: "👨",
  },
  {
    quote: "Volunteering here has been the most rewarding experience. The elders have so much wisdom to share.",
    name: "Emily Roberts",
    role: "Volunteer",
    avatar: "👩",
  },
];

// Stats
const stats = [
  { value: '10,000+', label: 'Elders Supported' },
  { value: '5,000+', label: 'Active Volunteers' },
  { value: '50,000+', label: 'Visits Completed' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export default function WelcomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>ElderConnect+ | Companionship for Seniors, Purpose for Volunteers</title>
        <meta name="description" content="Connecting seniors with caring volunteers for companionship, support, and meaningful relationships. Free service, powered by community love." />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">ElderConnect+</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors">How It Works</a>
                <a href="#for-elders" className="text-gray-600 hover:text-primary-600 transition-colors">For Elders</a>
                <a href="#volunteer" className="text-gray-600 hover:text-primary-600 transition-colors">Volunteer</a>
                <a href="#about" className="text-gray-600 hover:text-primary-600 transition-colors">About</a>
              </div>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Link href="/donate">
                  <Button variant="secondary">Donate</Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button icon={<ArrowRight className="w-4 h-4" />}>Get Started</Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4">
              <div className="flex flex-col gap-4">
                <a href="#how-it-works" className="text-gray-600 py-2">How It Works</a>
                <a href="#for-elders" className="text-gray-600 py-2">For Elders</a>
                <a href="#volunteer" className="text-gray-600 py-2">Volunteer</a>
                <a href="#about" className="text-gray-600 py-2">About</a>
                <hr className="my-2" />
                <Link href="/donate" className="text-primary-600 font-medium py-2">Donate</Link>
                <Link href="/login" className="text-primary-600 font-medium py-2">Log In</Link>
                <Link href="/signup">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-primary-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <CheckCircle className="w-4 h-4" />
                  100% Free Service - Always
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  No Senior Should 
                  <span className="text-primary-600"> Feel Alone</span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  We connect caring volunteers with seniors who could use a friendly visit, 
                  a helping hand, or just someone to talk to. Building meaningful relationships 
                  that enrich lives on both sides.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8" icon={<ArrowRight className="w-5 h-5" />}>
                      Join Our Community
                    </Button>
                  </Link>
                  <Link href="/donate">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8" icon={<Gift className="w-5 h-5" />}>
                      Donate Now
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8" icon={<Play className="w-5 h-5" />}>
                      See How It Works
                    </Button>
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Verified Volunteers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>4.9/5 Rating</span>
                  </div>
                </div>
              </div>

              {/* Hero Image/Illustration */}
              <div className="relative">
                <div className="bg-gradient-to-br from-primary-100 to-blue-100 rounded-3xl p-8 md:p-12">
                  {/* Placeholder for hero image */}
                  <div className="aspect-square bg-white/50 rounded-2xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-primary-200 rounded-full flex items-center justify-center">
                          <Heart className="w-12 h-12 text-primary-600" />
                        </div>
                      </div>
                      <p className="text-6xl mb-4">👵❤️👩</p>
                      <p className="text-gray-600 text-lg">Generations connecting through care</p>
                    </div>
                  </div>
                  
                  {/* Floating Cards */}
                  <div className="absolute -left-4 top-1/4 bg-white rounded-xl shadow-lg p-4 hidden md:block">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Visit Completed</p>
                        <p className="text-sm text-gray-500">Margaret & Sarah</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-lg p-4 hidden md:block">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">5-Star Rating</p>
                        <p className="text-sm text-gray-500">&quot;Best companion ever!&quot;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-primary-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How ElderConnect+ Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Simple steps to start making meaningful connections
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign Up Free</h3>
                <p className="text-gray-600">
                  Create your account in minutes. Tell us about yourself and what you&apos;re looking for.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Matched</h3>
                <p className="text-gray-600">
                  Our system matches elders with compatible volunteers based on interests, location, and availability.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Start Connecting</h3>
                <p className="text-gray-600">
                  Begin with visits, calls, or activities. Build a lasting friendship that enriches both lives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Elders Section */}
        <section id="for-elders" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Heart className="w-4 h-4" />
                  For Seniors
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Companionship When You Need It
                </h2>
                
                <p className="text-xl text-gray-600 mb-8">
                  Whether you want someone to chat with, help with errands, or a friend to share activities, 
                  our caring volunteers are here for you.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    'Regular visits from friendly volunteers',
                    'Help with technology, errands, and daily tasks',
                    'Someone to share hobbies and activities with',
                    '24/7 emergency support system',
                    'Stay connected with your family',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup">
                  <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                    Find a Companion
                  </Button>
                </Link>
              </div>

              {/* Activities Grid */}
              <div className="grid grid-cols-2 gap-4">
                {activities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                      <div className={`w-12 h-12 ${activity.color} rounded-xl flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{activity.label}</h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* For Volunteers Section */}
        <section id="volunteer" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image/Illustration */}
              <div className="order-2 md:order-1">
                <div className="bg-white rounded-3xl p-8 shadow-sm">
                  <div className="text-center">
                    <p className="text-8xl mb-6">🤝</p>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Make a Real Difference</h3>
                    <p className="text-gray-600">Just a few hours a week can change someone&apos;s life</p>
                    
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-green-600">2-4</p>
                        <p className="text-sm text-gray-600">Hours/Week</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-blue-600">Free</p>
                        <p className="text-sm text-gray-600">Training</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4">
                        <p className="text-2xl font-bold text-purple-600">Flex</p>
                        <p className="text-sm text-gray-600">Schedule</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <HandHeart className="w-4 h-4" />
                  Become a Volunteer
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Share Your Time, Gain So Much More
                </h2>
                
                <p className="text-xl text-gray-600 mb-8">
                  Volunteering with ElderConnect+ isn&apos;t just about giving—it&apos;s about forming 
                  genuine connections with seniors who have incredible stories to share.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    'Flexible scheduling that fits your life',
                    'Free training and ongoing support',
                    'Background checks for everyone\'s safety',
                    'Match with elders who share your interests',
                    'Join a community of caring volunteers',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/signup">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700" icon={<HandHeart className="w-5 h-5" />}>
                    Start Volunteering
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A complete platform for connecting seniors with care and companionship
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Stories from Our Community
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real experiences from elders, volunteers, and families
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
                  <Quote className="w-10 h-10 text-primary-200 mb-4" />
                  <p className="text-gray-700 mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About / Mission Section */}
        <section id="about" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                ElderConnect+ was founded with a simple belief: <strong>every senior deserves companionship</strong>, 
                and every person has the capacity to make a difference. We&apos;re building bridges between 
                generations, creating meaningful relationships that combat loneliness and isolation.
              </p>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                We&apos;re a <strong>non-profit organization</strong> run by dedicated staff and powered by 
                volunteers who believe in the power of human connection. Our service is and will always 
                be <strong>completely free</strong> for seniors and their families.
              </p>

              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Shield className="w-8 h-8 text-primary-600" />
                  <Clock className="w-8 h-8 text-blue-600" />
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Commitments</h3>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Safety First</h4>
                    <p className="text-gray-600 text-sm">All volunteers undergo background checks and training</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Always Available</h4>
                    <p className="text-gray-600 text-sm">24/7 support for emergencies and concerns</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Local Focus</h4>
                    <p className="text-gray-600 text-sm">Matching volunteers with seniors in their community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Donation Section */}
        <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Gift className="w-10 h-10 text-amber-600" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Love What We Do?
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                ElderConnect+ is free for everyone, but it takes resources to keep running. 
                If our service has touched your life or the life of someone you love, 
                consider supporting us with a donation.
              </p>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                <p className="text-gray-700 mb-6">
                  Your donation helps us:
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-left mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Train more volunteers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Expand to new areas</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Improve our technology</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600" icon={<Heart className="w-5 h-5" />}>
                    Make a Donation
                  </Button>
                  <Button variant="secondary" size="lg">
                    Learn About Sponsorship
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                ElderConnect+ is a registered 501(c)(3) non-profit. All donations are tax-deductible.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Make a Connection?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Whether you&apos;re a senior looking for companionship, a volunteer ready to help, 
              or a family member seeking support for a loved one—we&apos;re here for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100" icon={<ArrowRight className="w-5 h-5" />}>
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="ghost" className="text-white border-white/30 hover:bg-white/10">
                  Already a Member? Log In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">ElderConnect+</span>
                </div>
                <p className="text-sm">
                  Connecting generations through care, companionship, and community.
                </p>
              </div>

              {/* Links */}
              <div>
                <h4 className="text-white font-semibold mb-4">For Elders</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/signup" className="hover:text-white transition-colors">Find a Companion</Link></li>
                  <li><Link href="/elder-guide" className="hover:text-white transition-colors">How It Works</Link></li>
                  <li><Link href="/safety-trust" className="hover:text-white transition-colors">Safety & Trust</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">For Volunteers</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/signup" className="hover:text-white transition-colors">Become a Volunteer</Link></li>
                  <li><Link href="/volunteer-resources" className="hover:text-white transition-colors">Training Program</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Volunteer Stories</Link></li>
                  <li><Link href="/volunteer-resources" className="hover:text-white transition-colors">Resources</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Organization</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                  <li><Link href="/donate" className="hover:text-white transition-colors">Donate</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm">
                © 2026 ElderConnect+. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="/partners" className="hover:text-white transition-colors">Partners</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
