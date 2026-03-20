import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Handshake } from 'lucide-react';
import Button from '@/components/Button';
import PublicLayout from '@/components/PublicLayout';

export default function PartnersPage() {
  return (
    <PublicLayout>
      <Head>
        <title>Partners - ElderConnect+</title>
      </Head>

      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Handshake className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Partnerships Are Opening Soon</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            We&apos;re preparing our partnership program for launch. If you&apos;d like to collaborate, please contact our team.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
