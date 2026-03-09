import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/layout/Navbar';
import RouteHandler from '@/components/RouteHandler';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Prompt Engineering LMS',
  description: 'Interactive AI Learning Platform for Prompt Engineering',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <RouteHandler />
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
