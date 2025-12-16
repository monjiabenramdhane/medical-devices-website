
import { HomeSection } from '@prisma/client';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import Link from 'next/link';

interface FacesBehindDeviceProps {
  data: HomeSection | null;
}

export function FacesBehindDevice({ data }: FacesBehindDeviceProps) {
  // Default static content if no data is found in DB
  const defaultContent = {
    title: "Faces Behind The Device",
    content: `
      <p class="text-lg text-gray-600 mb-6">
        At Medical Devices Group, we bring together the world's leading medical 
        technology brands to deliver comprehensive healthcare solutions across 
        Africa and beyond.
      </p>
      <p class="text-lg text-gray-600 mb-8">
        Our commitment extends beyond supplying equipment. We provide complete 
        support including installation, training, maintenance, and ongoing technical 
        assistance to ensure optimal performance and patient outcomes.
      </p>
    `,
    imageUrl: "/images/about-building.jpg",
    imageAlt: "Medical Devices Group headquarters",
    ctaText: "Meet Our Team",
    ctaLink: "/about",
  };

  const content = {
    title: data?.title || defaultContent.title,
    htmlContent: data?.content || defaultContent.content,
    imageUrl: data?.imageUrl || defaultContent.imageUrl,
    imageAlt: data?.imageAlt || defaultContent.imageAlt,
    ctaText: data?.ctaText || defaultContent.ctaText,
    ctaLink: data?.ctaLink || defaultContent.ctaLink,
  };

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#02445b]  sm:text-4xl mb-6">
              {content.title}
            </h2>
            <div 
              className="prose prose-lg text-gray-600 mb-8"
              dangerouslySetInnerHTML={{ __html: content.htmlContent }}
            />
            {content.ctaLink && content.ctaText && (
              <Link
                href={content.ctaLink}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#02445b] hover:bg-blue-700 transition-colors"
              >
                {content.ctaText}
              </Link>
            )}
          </div>
          <div className="mt-10 lg:mt-0">
            {content.imageUrl && (
              <ImageWithFallback
                src={content.imageUrl}
                alt={content.imageAlt || content.title}
                className="rounded-lg shadow-xl"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
