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

interface ProcessContentConfig {
    data: Record<string, any>;
    translatableFields: readonly string[];
    detectionFields?: readonly string[];
    skipTranslationFields?: readonly string[];
    copyAsIsFields?: readonly string[];
}

// Model-specific translatable field configurations
export const MODEL_TRANSLATABLE_FIELDS = {
    HERO_SLIDE: ['title', 'subtitle', 'description', 'ctaText'],
    HOME_SECTION: ['title', 'subtitle', 'content', 'ctaText', 'imageAlt'],
    BRAND: ['name', 'description', 'metaTitle', 'metaDescription'],
    EQUIPMENT_TYPE: ['name', 'description'],
    SUBCATEGORY: ['name', 'description', 'heroImageAlt'],
    SERIES: ['name', 'description', 'imageAlt'],
    PRODUCT: ['name', 'shortDescription', 'fullDescription', 'metaTitle', 'metaDescription', 'heroImageAlt', 'metaKeywords'],
    PRODUCT_SECTION: ['title', 'content', 'imageAlt'],
    PRODUCT_SPECIFICATION: ['category', 'name', 'value']
} as const;

// Fields that should be translated for a Product (backward compatibility)
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
     * Generic content processing method that handles translation for any model.
     * Detects source language and auto-fills missing translations for all supported locales.
     */
    async processContent({
        data,
        translatableFields,
        detectionFields,
        skipTranslationFields = [],
        copyAsIsFields = []
    }: ProcessContentConfig): Promise<{
        sourceLang: Locale;
        localizedData: Record<string, Record<string, any>>;
    }> {
        // 1. Identify text to trigger detection
        const fieldsForDetection = detectionFields || translatableFields;
        let detectionText = '';

        for (const field of fieldsForDetection) {
            if (data[field] && typeof data[field] === 'string' && data[field].trim()) {
                detectionText = data[field];
                break;
            }
        }

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
        }

        // 2. Fill the source language data with current input
        translatableFields.forEach(field => {
            if (data[field] !== undefined) {
                results[sourceLang][field] = data[field];
            }
        });

        // Copy fields that should be the same across all locales
        copyAsIsFields.forEach(field => {
            if (data[field] !== undefined) {
                for (const locale of SUPPORTED_LOCALES) {
                    results[locale][field] = data[field];
                }
            }
        });

        // 3. Translate to other locales
        for (const targetLang of SUPPORTED_LOCALES) {
            if (targetLang === sourceLang) continue;

            for (const field of translatableFields) {
                const sourceText = data[field];

                if (!sourceText) continue;

                // Skip translation for specific fields (e.g., URLs)
                if (skipTranslationFields.includes(field)) {
                    results[targetLang][field] = sourceText;
                } else {
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

    /**
     * Process HeroSlide content
     */
    async processHeroSlideContent(data: Record<string, any>) {
        return this.processContent({
            data,
            translatableFields: MODEL_TRANSLATABLE_FIELDS.HERO_SLIDE,
            detectionFields: ['description', 'subtitle', 'title']
        });
    }

    /**
     * Process HomeSection content
     */
    async processHomeSectionContent(data: Record<string, any>) {
        return this.processContent({
            data,
            translatableFields: MODEL_TRANSLATABLE_FIELDS.HOME_SECTION,
            detectionFields: ['content', 'subtitle', 'title'],
            skipTranslationFields: ['imageUrl']
        });
    }

    /**
     * Process Brand content
     */
    async processBrandContent(data: Record<string, any>) {
        return this.processContent({
            data,
            translatableFields: MODEL_TRANSLATABLE_FIELDS.BRAND,
            detectionFields: ['description', 'name']
        });
    }

    /**
     * Process EquipmentType content
     */
    async processEquipmentTypeContent(data: Record<string, any>) {
        return this.processContent({
            data,
            translatableFields: MODEL_TRANSLATABLE_FIELDS.EQUIPMENT_TYPE,
            detectionFields: ['description', 'name']
        });
    }

    /**
     * Process Subcategory content
     */
    async processSubcategoryContent(data: Record<string, any>) {
        return this.processContent({
            data,
            translatableFields: MODEL_TRANSLATABLE_FIELDS.SUBCATEGORY,
            detectionFields: ['description', 'name']
        });
    }

    /**
     * Process Series content
     */
    async processSeriesContent(data: Record<string, any>) {
        return this.processContent({
            data,
            translatableFields: MODEL_TRANSLATABLE_FIELDS.SERIES,
            detectionFields: ['description', 'name']
        });
    }

    /**
     * Process Product content
     */
    async processProductContent(data: Record<string, any>) {
        return this.processContent({
            data,
            translatableFields: MODEL_TRANSLATABLE_FIELDS.PRODUCT,
            detectionFields: ['shortDescription', 'fullDescription', 'name']
        });
    }

    /**
     * Process ProductSection content
     */
    async processProductSectionContent(data: Record<string, any>) {
        return this.processContent({
            data,
            translatableFields: MODEL_TRANSLATABLE_FIELDS.PRODUCT_SECTION,
            detectionFields: ['content', 'title']
        });
    }

    /**
     * Process ProductSpecification content
     */
    async processProductSpecificationContent(data: Record<string, any>) {
        return this.processContent({
            data,
            translatableFields: MODEL_TRANSLATABLE_FIELDS.PRODUCT_SPECIFICATION,
            detectionFields: ['value', 'name']
        });
    }
    
    /**
     * Simple auto-translate helper for two-language scenarios (backward compatibility)
     */
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