'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit2, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';
// Using inline modal instead of Dialog component for now
// Actually, let's build a simple inline edit or modal for creating sections/links.

interface Section {
    id: string;
    translations: { locale: string; title: string }[];
    links: LinkItem[];
    order: number;
}

interface LinkItem {
    id: string;
    url: string;
    translations: { locale: string; label: string }[];
    order: number;
}

export function FooterSectionList() {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null); // For adding link to a specific section

    // Form inputs state
    const [sectionInputs, setSectionInputs] = useState<Record<string, string>>(
        Object.fromEntries(SUPPORTED_LOCALES.map(loc => [loc, '']))
    );
    const [linkInputs, setLinkInputs] = useState<Record<string, string>>(
        Object.fromEntries([['url', ''], ...SUPPORTED_LOCALES.map(loc => [loc, ''])])
    );

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const response = await api.get('/admin/footer/sections');
            setSections(response.data || []);
        } catch (error) {
            toast.error('Failed to load sections');
        } finally {
            setLoading(false);
        }
    };

    const handleSectionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                isActive: true, // Default
                translations: SUPPORTED_LOCALES.map(locale => ({
                    locale,
                    title: sectionInputs[locale] || ''
                }))
            };

            if (editingSection) {
                await api.put(`/admin/footer/sections/${editingSection.id}`, payload);
                toast.success('Section updated');
            } else {
                await api.post('/admin/footer/sections', payload);
                toast.success('Section created');
            }
            setIsSectionModalOpen(false);
            setEditingSection(null);
            setSectionInputs(Object.fromEntries(SUPPORTED_LOCALES.map(loc => [loc, ''])));
            fetchSections();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const handleLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeSectionId && !editingLink) return;

        try {
            const payload = {
                sectionId: activeSectionId,
                isActive: true,
                url: linkInputs.url,
                translations: SUPPORTED_LOCALES.map(locale => ({
                    locale,
                    label: linkInputs[locale] || ''
                }))
            };

            if (editingLink) {
                await api.put(`/admin/footer/links/${editingLink.id}`, payload);
                 toast.success('Link updated');
            } else {
                await api.post('/admin/footer/links', payload);
                 toast.success('Link created');
            }
            setIsLinkModalOpen(false);
            setEditingLink(null);
            setLinkInputs(Object.fromEntries([['url', ''], ...SUPPORTED_LOCALES.map(loc => [loc, ''])]));
            fetchSections();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    const deleteSection = async (id: string) => {
        if (!confirm('Delete this section and all its links?')) return;
        try {
            await api.delete(`/admin/footer/sections/${id}`);
            toast.success('Section deleted');
            fetchSections();
        } catch (error) {
            toast.error('Failed delete');
        }
    };

      const deleteLink = async (id: string) => {
        if (!confirm('Delete this link?')) return;
         try {
            await api.delete(`/admin/footer/links/${id}`);
            toast.success('Link deleted');
            fetchSections();
        } catch (error) {
            toast.error('Failed delete');
        }
    };

    const openSectionModal = (section?: Section) => {
        if (section) {
            setEditingSection(section);
            const inputs: Record<string, string> = {};
            SUPPORTED_LOCALES.forEach(locale => {
                inputs[locale] = section.translations.find(t => t.locale === locale)?.title || '';
            });
            setSectionInputs(inputs);
        } else {
            setEditingSection(null);
            setSectionInputs(Object.fromEntries(SUPPORTED_LOCALES.map(loc => [loc, ''])));
        }
        setIsSectionModalOpen(true);
    };

    const openLinkModal = (sectionId: string, link?: LinkItem) => {
        setActiveSectionId(sectionId);
        if (link) {
            setEditingLink(link);
            const inputs: Record<string, string> = { url: link.url };
            SUPPORTED_LOCALES.forEach(locale => {
                inputs[locale] = link.translations.find(t => t.locale === locale)?.label || '';
            });
            setLinkInputs(inputs);
        } else {
            setEditingLink(null);
            setLinkInputs(Object.fromEntries([['url', ''], ...SUPPORTED_LOCALES.map(loc => [loc, ''])]));
        }
        setIsLinkModalOpen(true);
    };

    if (loading) return;

    return (
        <div className="bg-white p-6 rounded-lg shadow mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Footer Sections & Links</h2>
                {/* <button onClick={() => openSectionModal()} className="flex items-center px-4 py-2 bg-[#bddbd1] text-[#02445b] rounded hover:bg-[#02445b]/90 hover:text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Section
                </button> */}
            </div>

            <div className="space-y-6">
                {sections.map((section) => (
                    <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="font-semibold text-lg">{section.translations.find(t => t.locale === 'en')?.title} (EN)</h3>
                            <div className="flex space-x-2">
                                <button onClick={() => openSectionModal(section)} className="p-1 text-[#02445b] hover:bg-[#02445b]/90 hover:text-white rounded">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                {/* <button onClick={() => deleteSection(section.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button> */}
                            </div>
                        </div>

                        {/* Links List */}
                        <ul className="space-y-2 pl-4">
                            {section.links.map(link => (
                                <li key={link.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                    <div className="flex items-center">
                                        <LinkIcon className="w-3 h-3 text-gray-400 mr-2" />
                                        <span className="text-sm font-medium mr-2">{link.translations.find(t=>t.locale === 'en')?.label}</span>
                                        <span className="text-xs text-gray-500">({link.url})</span>
                                    </div>
                                    <div className="flex space-x-2">
                                         <button onClick={() => openLinkModal(section.id, link)} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => deleteLink(link.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <button onClick={() => openLinkModal(section.id)} className="mt-4 text-sm text-blue-600 hover:underline flex items-center">
                            <Plus className="w-3 h-3 mr-1" /> Add Link
                        </button>
                    </div>
                ))}
                {sections.length === 0 && <p className="text-gray-500 text-center py-4">No sections yet.</p>}
            </div>

            {/* Simple Modal Implementation */}
            {(isSectionModalOpen || isLinkModalOpen) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">
                            {isSectionModalOpen ? (editingSection ? 'Edit Section' : 'Nuew Section') : (editingLink ? 'Edit Link' : 'New Link')}
                        </h3>
                        
                        <form onSubmit={isSectionModalOpen ? handleSectionSubmit : handleLinkSubmit}>
                            <div className="space-y-4">
                                {isLinkModalOpen && (
                                     <div>
                                        <label className="block text-sm font-medium">URL</label>
                                        <input 
                                            value={linkInputs.url} 
                                            onChange={e => setLinkInputs({...linkInputs, url: e.target.value})}
                                            className="w-full border p-2 rounded"
                                            required 
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium">{isSectionModalOpen ? 'Title' : 'Label'} (EN)</label>
                                    <input 
                                        value={isSectionModalOpen ? (sectionInputs['en'] || '') : (linkInputs['en'] || '')} 
                                        onChange={e => isSectionModalOpen ? setSectionInputs({...sectionInputs, en: e.target.value}) : setLinkInputs({...linkInputs, en: e.target.value})}
                                        className="w-full border p-2 rounded"
                                        required 
                                    />
                                </div>
                                {(SUPPORTED_LOCALES as unknown as string[]).filter(loc => loc !== 'en').map(locale => (
                                    <div key={locale}>
                                        <label className="block text-sm font-medium">{isSectionModalOpen ? 'Title' : 'Label'} ({locale.toUpperCase()})</label>
                                        <input 
                                            value={isSectionModalOpen ? (sectionInputs[locale] || '') : (linkInputs[locale] || '')} 
                                            onChange={e => isSectionModalOpen 
                                                ? setSectionInputs({...sectionInputs, [locale]: e.target.value}) 
                                                : setLinkInputs({...linkInputs, [locale]: e.target.value})}
                                            className="w-full border p-2 rounded"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end space-x-2">
                                <button type="button" onClick={() => { setIsSectionModalOpen(false); setIsLinkModalOpen(false); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
