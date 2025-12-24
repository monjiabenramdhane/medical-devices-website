import { getLocale } from '@/lib/i18n/locale-resolver';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { Providers } from './providers';
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Devices Group - Leading Healthcare Solutions',
  description: 'Premier provider of medical devices and healthcare solutions across Africa',
  keywords: 'medical devices, healthcare, ultrasound, cardiology, imaging',
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        <Providers>
          <LocaleProvider initialLocale={locale}>
            {children}
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}