'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useTransition,
  ReactNode,
} from 'react';
import { LOCALE_COOKIE_NAME, type Locale } from './types';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

import { useRouter } from 'next/navigation';

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const setLocale = useCallback((newLocale: Locale) => {
    // Update cookie
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    startTransition(() => {
      setLocaleState(newLocale);
      // Trigger soft navigation to refresh Server Components
      router.refresh();
    });
  }, [router]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isPending }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}