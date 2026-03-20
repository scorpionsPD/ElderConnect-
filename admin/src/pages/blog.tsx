import React from 'react';
import Head from 'next/head';
import { Clock, Users, TrendingUp, Star } from 'lucide-react';
import Button from '@/components/Button';
import type { GetServerSideProps } from 'next';

export default function BlogPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    notFound: true,
  };
};
