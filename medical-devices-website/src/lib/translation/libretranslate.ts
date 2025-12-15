import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '../i18n/types';

interface TranslateParams {
    text: string;
    sourceLang: string;
    targetLang: string;
}

interface DetectLanguageResult {
    confidence: number;
    language: string;
}

// Fields that should be translated for a Product
const TRANSLATABLE_FIELDS = [
    'shortDescription',
    'fullDescription',
    'metaTitle',
    'metaDescription',
    'metaKeywords',
    'heroImageAlt'
] as const;

type TranslatableField = (typeof TRANSLATABLE_FIELDS)[number];

class LibreTranslateService {
    private baseUrl: string;
    private timeout: number;

    constructor() {
        this.baseUrl = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000';
        this.timeout = parseInt(process.env.LIBRETRANSLATE_TIMEOUT || '30000');
    }

    async detectLanguage(text: string): Promise<Locale> {
        try {
            if (!text || !text.trim()) return DEFAULT_LOCALE;

            const response = await fetch(`${this.baseUrl}/detect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: text }),
                signal: AbortSignal.timeout(this.timeout),
            });

            if (!response.ok) {
                throw new Error(`Detection failed: ${response.statusText}`);
            }

            const data: DetectLanguageResult[] = await response.json();
            const detected = data[0]?.language;

            // Only accept supported locales, or default to English
            // Ideally we would map similar languages (e.g. 'en-US' -> 'en'), but LibreTranslate usually returns 2-char codes
            const isSupported = SUPPORTED_LOCALES.includes(detected as any);
            return isSupported ? (detected as Locale) : DEFAULT_LOCALE;
        } catch (error) {
            console.error('Language detection error:', error);
            return DEFAULT_LOCALE;
        }
    }

    async translate({
        text,
        sourceLang,
        targetLang,
    }: TranslateParams): Promise<string> {
        try {
            if (!text || text.trim() === '') return '';
            if (sourceLang === targetLang) return text;

            const response = await fetch(`${this.baseUrl}/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text',
                }),
                signal: AbortSignal.timeout(this.timeout),
            });

            if (!response.ok) {
                throw new Error(`Translation failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.translatedText || text;
        } catch (error) {
            console.error(`Translation error (${sourceLang} -> ${targetLang}):`, error);
            return text;
        }
    }

    /**
     * Processes product data: detects source language and auto-fills missing translations.
     * Returns an object containing the data organized by locale.
     */
    async processProductContent(data: Record<string, any>) {
        // 1. Identify text to trigger detection (ignore name for translation)
        const detectionText = data.shortDescription || data.fullDescription || '';

        // Default to DEFAULT_LOCALE if no text
        let sourceLang: Locale = DEFAULT_LOCALE;
        if (detectionText) {
            sourceLang = await this.detectLanguage(detectionText);
        }

        console.log(`[LibreTranslate] Detected source language: ${sourceLang}`);

        const results: Record<string, Record<string, any>> = {};

        // Initialize results for all supported locales
        for (const locale of SUPPORTED_LOCALES) {
            results[locale] = {};

            // Always copy the name as-is for every locale
            results[locale]['name'] = data.name || '';
        }

        // 2. Fill the source language data with current input for translatable fields
        TRANSLATABLE_FIELDS.forEach(field => {
            if (data[field] !== undefined) {
                results[sourceLang][field] = data[field];
            }
        });

        // 3. Translate to other locales (skip sourceLang)
        for (const targetLang of SUPPORTED_LOCALES) {
            if (targetLang === sourceLang) continue;

            for (const field of TRANSLATABLE_FIELDS) {
                const sourceText = data[field];
                if (sourceText) {
                    const translated = await this.translate({
                        text: sourceText,
                        sourceLang,
                        targetLang,
                    });
                    results[targetLang][field] = translated;
                }
            }
        }

        return {
            sourceLang,
            localizedData: results
        };
    }

    async autoTranslate(
        enText: string | null | undefined,
        frText: string | null | undefined
    ): Promise<{ en: string; fr: string }> {
        if (enText && frText) return { en: enText, fr: frText };

        const source = enText ? 'en' : (frText ? 'fr' : 'en');
        const text = enText || frText || '';
        if (!text) return { en: '', fr: '' };

        const target = source === 'en' ? 'fr' : 'en';
        const translated = await this.translate({ text, sourceLang: source, targetLang: target });

        return {
            en: source === 'en' ? text : translated,
            fr: source === 'fr' ? text : translated
        };
    }
}

export const translateService = new LibreTranslateService();