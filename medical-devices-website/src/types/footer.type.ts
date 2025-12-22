
export interface FooterConfig {
    id: string;
    email: string | null;
    phone: string | null;
    facebookUrl: string | null;
    twitterUrl: string | null;
    linkedinUrl: string | null;
    instagramUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    translations?: FooterConfigTranslation[];
    sections?: FooterSection[];
}

export interface FooterConfigTranslation {
    id: string;
    footerConfigId: string;
    locale: string;
    name: string | null;
    address: string | null;
    companyDescription: string | null;
    copyrightText: string | null;
}

export interface FooterSection {
    id: string;
    footerConfigId: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    translations?: FooterSectionTranslation[];
    links?: FooterLink[];
}

export interface FooterSectionTranslation {
    id: string;
    footerSectionId: string;
    locale: string;
    title: string;
}

export interface FooterLink {
    id: string;
    footerSectionId: string;
    url: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    translations?: FooterLinkTranslation[];
}

export interface FooterLinkTranslation {
    id: string;
    footerLinkId: string;
    locale: string;
    label: string;
}

// Input Types for API

export interface UpdateFooterConfigInput {
    email?: string;
    phone?: string;
    facebookUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    translations: {
        locale: string;
        name?: string;
        address?: string;
        companyDescription?: string;
        copyrightText?: string;
    }[];
}

export interface CreateFooterSectionInput {
    order?: number;
    isActive: boolean;
    translations: {
        locale: string;
        title: string;
    }[];
}

export interface UpdateFooterSectionInput extends Partial<CreateFooterSectionInput> { }

export interface CreateFooterLinkInput {
    sectionId: string;
    url: string;
    order?: number;
    isActive: boolean;
    translations: {
        locale: string;
        label: string;
    }[];
}

export interface UpdateFooterLinkInput extends Partial<Omit<CreateFooterLinkInput, 'sectionId'>> { }

// Localized Types for Frontend

export interface LocalizedFooterConfig {
    email: string | null;
    phone: string | null;
    facebookUrl: string | null;
    twitterUrl: string | null;
    linkedinUrl: string | null;
    instagramUrl: string | null;
    name: string | null;
    address: string | null;
    companyDescription: string | null;
    copyrightText: string | null;
    sections: LocalizedFooterSection[];
}

export interface LocalizedFooterSection {
    id: string;
    title: string;
    order: number;
    links: LocalizedFooterLink[];
}

export interface LocalizedFooterLink {
    id: string;
    label: string;
    url: string;
    order: number;
}
