import { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from './types';

export function getLocaleFromRequest(request: NextRequest): string {
    // 1. Check cookie
    const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as any)) {
        return cookieLocale;
    }

    // 2. Check headers
    const headers = { 'accept-language': request.headers.get('accept-language') || '' };
    const languages = new Negotiator({ headers }).languages();

    try {
        return match(languages, SUPPORTED_LOCALES as unknown as string[], DEFAULT_LOCALE);
    } catch (e) {
        return DEFAULT_LOCALE;
    }
}
