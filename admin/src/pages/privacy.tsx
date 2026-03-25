import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Shield, Lock, Eye, FileText, Mail, Trash2 } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

export default function PrivacyPolicyPage() {
  return (
    <PublicLayout>
      <Head>
        <title>Privacy Policy - ElderConnect+</title>
        <meta
          name="description"
          content="Read how ElderConnect+ collects, uses, and protects personal information across the platform."
        />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-500">Last updated: January 2024</p>
            </div>
          </div>
          <p className="text-gray-600">
            At ElderConnect+, we are committed to protecting your privacy. This policy explains how we collect, 
            use, and safeguard your personal information.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Date of birth and address</li>
                  <li>Profile photo (optional)</li>
                  <li>Emergency contact information</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Visit history and scheduling information</li>
                  <li>Messages exchanged through our platform</li>
                  <li>App usage and preferences</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Match you with compatible volunteer companions</li>
              <li>Schedule and coordinate visits</li>
              <li>Provide emergency assistance when needed</li>
              <li>Keep your family members informed (with your consent)</li>
              <li>Improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">How We Protect Your Data</h2>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Role-based access controls and scoped permissions in the platform</li>
              <li>Managed infrastructure and hosted data storage providers</li>
              <li>Authentication, logging, and audit features that support account security</li>
              <li>Limited operational access to user information where needed to run the service</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Information Sharing</h2>
            </div>
            <p className="text-gray-600 mb-3">
              We do <strong>not</strong> sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>Volunteer Companions:</strong> Basic information needed for visits</li>
              <li><strong>Family Members:</strong> Visit updates (with your consent)</li>
              <li><strong>Emergency Services:</strong> When you request emergency assistance</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Your Rights</h2>
            </div>
            <p className="text-gray-600 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correct:</strong> Update inaccurate information</li>
              <li><strong>Delete:</strong> Request deletion of your data</li>
              <li><strong>Withdraw Consent:</strong> Change your privacy preferences anytime</li>
            </ul>
            <p className="mt-4 text-gray-600">
              Contact us at{' '}
              <a href="mailto:privacy@scotitech.com" className="text-primary-600 hover:underline">
                privacy@scotitech.com
              </a>
            </p>
          </section>

          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">Questions about this privacy policy?</p>
            <div className="space-y-2 text-gray-600">
              <p><strong>Email:</strong> privacy@scotitech.com</p>
              <p><strong>Support:</strong> Use the contact page or in-product support options.</p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/terms">
            <Button variant="secondary">Read Terms of Service</Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
