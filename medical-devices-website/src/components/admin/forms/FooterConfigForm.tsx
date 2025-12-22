'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';

const footerConfigSchema = z.object({
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  translations: z.array(z.object({
    locale: z.string(),
    name: z.string().optional(),
    address: z.string().optional(),
    companyDescription: z.string().optional(),
    copyrightText: z.string().optional(),
  })),
});

type FooterConfigFormData = z.infer<typeof footerConfigSchema>;

export function FooterConfigForm() {
    const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(SUPPORTED_LOCALES[0]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FooterConfigFormData>({
    resolver: zodResolver(footerConfigSchema),
    defaultValues: {
      translations: SUPPORTED_LOCALES.map(locale => ({
        locale, name: '', address: '', companyDescription: '', copyrightText: ''
      }))
    }
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/admin/footer');
      if (response.data) {
        const config = response.data;
        setValue('email', config.email || '');
        setValue('phone', config.phone || '');
        setValue('facebookUrl', config.facebookUrl || '');
        setValue('twitterUrl', config.twitterUrl || '');
        setValue('linkedinUrl', config.linkedinUrl || '');
        setValue('instagramUrl', config.instagramUrl || '');

        // Map translations based on supported locales
        const translations = (SUPPORTED_LOCALES as unknown as string[]).map(locale => {
            const existing = config.translations?.find((t: any) => t.locale === locale);
            return {
                locale,
                name: existing?.name || '',
                address: existing?.address || '',
                companyDescription: existing?.companyDescription || '',
                copyrightText: existing?.copyrightText || '',
            };
        });
        setValue('translations', translations);
      }
    } catch (error) {
      console.error('Failed to fetch footer config', error);
      toast.error('Failed to load footer settings');
    } finally {
        setInitialLoading(false);
    }
  };

  const onSubmit = async (data: FooterConfigFormData) => {
    setLoading(true);
    try {
      await api.put('/admin/footer', data);
      toast.success('Footer settings updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error updating footer config:', error);
      toast.error('Failed to update footer settings');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-gray-500"/></div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div>
        <h2 className="text-xl font-semibold mb-4">Global Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <input {...register('email')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input {...register('phone')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
                <input {...register('facebookUrl')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                {errors.facebookUrl && <p className="text-red-500 text-xs">{errors.facebookUrl.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
                <input {...register('twitterUrl')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                {errors.twitterUrl && <p className="text-red-500 text-xs">{errors.twitterUrl.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                <input {...register('linkedinUrl')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                {errors.linkedinUrl && <p className="text-red-500 text-xs">{errors.linkedinUrl.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
                <input {...register('instagramUrl')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                 {errors.instagramUrl && <p className="text-red-500 text-xs">{errors.instagramUrl.message}</p>}
            </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-4">Localized Content</h2>
        
        <div className="flex space-x-2 mb-4">
          {(SUPPORTED_LOCALES as unknown as string[]).map((lang) => (
            <button
              type="button"
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-4 py-2 rounded-md ${
                activeTab === lang
                  ? 'bg-[#02445b] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {(SUPPORTED_LOCALES as unknown as string[]).map((lang, index) => (
            <div key={lang} className={activeTab === lang ? 'block' : 'hidden'}>
                <input type="hidden" {...register(`translations.${index}.locale`)} value={lang} />
                
                <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Name ({lang.toUpperCase()})</label>
                      <textarea 
                          {...register(`translations.${index}.name`)} 
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" 
                      />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address ({lang.toUpperCase()})</label>
                        <textarea 
                            {...register(`translations.${index}.address`)} 
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Description ({lang.toUpperCase()})</label>
                        <textarea 
                            {...register(`translations.${index}.companyDescription`)} 
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" 
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Copyright Text ({lang.toUpperCase()})</label>
                        <input 
                            {...register(`translations.${index}.copyrightText`)} 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" 
                        />
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#02445b] hover:bg-[#02445b]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            <>
              <Save className="-ml-1 mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
}
