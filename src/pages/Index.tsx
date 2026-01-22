// pages/index.tsx
import { GetServerSideProps } from 'next';

export default function Index() {
  return null; // nothing to render
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: '/dashboard',
      permanent: false,
    },
  };
};
