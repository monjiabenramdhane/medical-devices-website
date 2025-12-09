'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRequest = pathname?.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRequest && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdminRequest && <Footer />}
    </div>
  );
}
