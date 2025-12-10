'use client';

import { usePathname } from 'next/navigation';



export function AppShell({ 
  children,
  header,
  footer
}: { 
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRequest = pathname?.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRequest && header}
      <main className="flex-grow">{children}</main>
      {!isAdminRequest && footer}
    </div>
  );
}
