import type { GetServerSideProps } from 'next';

export default function VolunteerResourcesPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    notFound: true,
  };
};
