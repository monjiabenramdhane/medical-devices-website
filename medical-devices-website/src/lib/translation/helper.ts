import { translateService } from './libretranslate';

export const SUPPORTED_LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export interface TranslationPair {
  en: string;
  fr: string;
}

export async function processFieldTranslation(
  enValue: string | null | undefined,
  frValue: string | null | undefined
): Promise<TranslationPair> {
  return await translateService.autoTranslate(enValue, frValue);
}

export async function processMultipleFields(
  fields: Record<string, TranslationPair>
): Promise<Record<string, TranslationPair>> {
  const result: Record<string, TranslationPair> = {};

  await Promise.all(
    Object.entries(fields).map(async ([key, values]) => {
      result[key] = await processFieldTranslation(values.en, values.fr);
    })
  );

  return result;
}