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
    location: 'Edinburgh, Scotland (Hybrid)',
    type: 'Full-time',
    salary: '£80K - £110K',
    description: 'Build features that connect seniors with caring companions.',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    salary: '£60K - £80K',
    description: 'Design intuitive, accessible experiences for seniors and volunteers.',
  },
  {
    id: 3,
    title: 'Community Manager',
    import type { GetServerSideProps } from 'next';

    export default function CareersPage() {
      return null;
    }

    export const getServerSideProps: GetServerSideProps = async () => {
      return {
        notFound: true,
      };
    };
    type: 'Full-time',
