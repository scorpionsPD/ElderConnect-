import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FileText, Shield, AlertTriangle, XCircle } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

export default function TermsOfServicePage() {
  return (
    <PublicLayout>
      <Head>
        <title>Terms of Service - ElderConnect+</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-500">Last updated: January 2024</p>
            </div>
          </div>
          <p className="text-gray-600">
            Please read these terms carefully before using ElderConnect+.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600">
              By accessing or using ElderConnect+, you agree to be bound by these Terms of Service 
              and our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-3">ElderConnect+ provides:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>A platform connecting seniors with volunteer companions</li>
              <li>Scheduling and coordination tools for companion visits</li>
              <li>Health check-in and monitoring features</li>
              <li>Emergency alert systems</li>
            </ul>
            <p className="mt-4 text-gray-600">
              ElderConnect+ is a companionship service and does not provide medical care or professional caregiving.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. User Eligibility</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Be at least 18 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Agree to these Terms of Service and Privacy Policy</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">4. User Responsibilities</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">All Users Must:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Treat all users with respect and dignity</li>
                  <li>Provide accurate information about themselves</li>
                  <li>Report any safety concerns or inappropriate behavior</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Volunteers Must Additionally:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Complete all required training modules</li>
                  <li>Follow safety protocols during visits</li>
                  <li>Respect elder privacy and boundaries</li>
                  <li>Never accept money or gifts from elders</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">5. Prohibited Conduct</h2>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Engage in harassment, abuse, or threatening behavior</li>
              <li>Share explicit, violent, or illegal content</li>
              <li>Impersonate another person or entity</li>
              <li>Exploit vulnerable users in any way</li>
              <li>Solicit personal financial information</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900">6. Safety and Emergencies</h2>
            </div>
            <p className="text-gray-600">
              While we provide emergency notification features, ElderConnect+ is <strong>not</strong> an 
              emergency response service. In a medical emergency, always call 911.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Disclaimers</h2>
            <p className="text-gray-600">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-600">
              We may suspend or terminate your account at any time for violation of these Terms.
              You may also delete your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
            <p className="text-gray-600">
              These Terms shall be governed by the laws of the State of California, United States.
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">Questions about these Terms?</p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong> legal@elderconnect.com</p>
              <p><strong>Phone:</strong> 1-800-ELDER-HELP</p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/privacy">
            <Button variant="secondary">Read Privacy Policy</Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
