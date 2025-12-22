import Link from 'next/link';
import { Linkedin, MapPin, Mail, Phone } from 'lucide-react';
import { getLocalizedFooter } from '@/lib/services/footer-service';
import Image from 'next/image';
import { FaXTwitter, FaFacebook, FaInstagram } from "react-icons/fa6";

export async function Footer() {
  const currentYear = new Date().getFullYear();

  const footerData = await getLocalizedFooter();

  return (
    <footer className="bg-gray-900 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:pt-16 lg:pb-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10">
          
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Image
              src="/images/logo-footer.svg"
              alt="Medical Devices Group"
              width={100}
              height={100}
              className="h-14 w-auto mb-4"
            />
            {footerData?.companyDescription && (
                <p className="text-sm text-gray-400 mb-4 whitespace-pre-wrap max-w-[265px]">
                {footerData.companyDescription}
                </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:col-span-2">
          {/* Dynamic Sections */}
          {footerData?.sections.map((section) => (
            <div key={section.id}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
                {section.title}
                </h3>
                <ul className="space-y-3">
                {section.links.map((link) => (
                    <li key={link.id}>
                    <Link
                        href={link.url}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        {link.label}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>
          ))}
          </div>
          <div>
            {footerData?.name && (
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">
                {footerData.name}
              </h3>
            )}
            {footerData?.address && (
              <p className="text-sm flex items-start text-gray-400 mb-4 whitespace-pre-wrap">
                <MapPin className="h-4 w-4 mr-2 mt-1"/> {footerData.address}
              </p>
            )}
            {footerData?.email && (
              <p className="text-sm flex items-start text-gray-400 mb-4 whitespace-pre-wrap">
                <Mail className="h-4 w-4 mr-2 mt-1"/> <a href={`mailto:${footerData.email}`} className="hover:text-white">{footerData.email}</a>
              </p>
            )}
            {footerData?.phone && (
              <p className="text-sm flex items-start text-gray-400 mb-4 whitespace-pre-wrap">
                <Phone className="h-4 w-4 mr-2 mt-1"/> <a href={`tel:${footerData.phone}`} className="hover:text-white">{footerData.phone}</a>
              </p>
            )}

            <div className="flex space-x-4">
              {footerData?.facebookUrl && (
                <a href={footerData.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FaFacebook className="h-5 w-5" />
                </a>
              )}
              {footerData?.twitterUrl && (
                  <a href={footerData.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <FaXTwitter className="h-5 w-5" />
                  </a>
                )}
                {footerData?.linkedinUrl && (
                <a href={footerData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {footerData?.instagramUrl && (
                <a href={footerData.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <FaInstagram className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        
      </div>
      <div className="mt-4 pt-20 pb-12 relative overflow-hidden ">
          <div className="absolute top-0 left-0 z-0 max-w-[1280px] opacity-20" >
          <Image
            src="/images/path1.svg"
            alt="Footer Decor"
            width={1280}
            height={369}
            className="w-full h-auto z-0"
          />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-400 max-w-lg pr-4">
            {footerData?.copyrightText || `© ${currentYear} Medical Devices Group. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}