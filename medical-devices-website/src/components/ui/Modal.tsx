'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
}

export default function Modal({ isOpen, onClose, children, closeLabel = 'Close modal' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop with premium blur */}
      <div 
        className="absolute inset-0 bg-[#02445b]/90 backdrop-blur-xl transition-all duration-500 animate-in fade-in"
        onClick={onClose}
      />

      <div
        className="relative max-w-6xl w-full mx-auto animate-in fade-in zoom-in duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Clean & Modern */}
        <button
          className="absolute -top-12 right-0 md:-right-12 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
