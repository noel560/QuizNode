import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'QuizNode Admin - Bejelentkezés',
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}