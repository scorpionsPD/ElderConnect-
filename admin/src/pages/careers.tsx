import type { GetServerSideProps } from 'next';

export default function CareersPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    notFound: true,
  };
};
