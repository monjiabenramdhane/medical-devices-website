import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getImageUrl(url: string, width?: number): string {
  if (!url) return '/images/placeholder.jpg';
  
  // If it's a Cloudinary URL and width is specified, add transformation
  if (url.includes('cloudinary.com') && width) {
    return url.replace('/upload/', `/upload/w_${width},c_scale/`);
  }
  
  return url;
}

// SEO Helpers
export function generateMetadata({
  title,
  description,
  keywords,
  image,
  url,
}: {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
}) {
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}