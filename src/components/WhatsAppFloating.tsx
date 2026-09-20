import React, { useState, useEffect, useRef } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { SHOP_INFO } from '../data/storeData';

export const WhatsAppFloating: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent('Hello DSP Digital Mart! I need support and information.')}`;
  const messengerUrl = 'https://m.me/dspdigitalmart';
  const tiktokUrl = 'https://www.tiktok.com/@dspdigitalmart';
  const callUrl = `tel:${SHOP_INFO.whatsappNumber}`;

  // Close floating dial on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const socialItems = [
    {
      id: 'floating-phone-call',
      name: 'Call Support',
      href: callUrl,
      bg: 'bg-[#00C853] hover:bg-[#00B048]',
      icon: <Phone className="w-5 h-5 fill-current text-white" />,
      tooltip: 'Call Us (+8801712792184)',
      isExternal: false,
    },
    {
      id: 'floating-messenger',
      name: 'Messenger',
      href: messengerUrl,
      bg: 'bg-[#0084FF] hover:bg-[#0073E6]',
      icon: (
        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.914 1.45 5.518 3.714 7.207V22l3.373-1.852c.928.257 1.908.396 2.913.396 5.523 0 10-4.145 10-9.26C22 6.145 17.523 2 12 2zm1.066 12.457l-2.613-2.787-5.099 2.787 5.61-5.955 2.677 2.787 5.035-2.787-5.61 5.955z" />
        </svg>
      ),
      tooltip: 'Chat on Messenger',
      isExternal: true,
    },
    {
      id: 'floating-whatsapp',
      name: 'WhatsApp',
      href: whatsappUrl,
      bg: 'bg-[#25D366] hover:bg-[#20BA5A]',
      icon: (
        <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.301-.15-1.781-.879-2.057-.98-.276-.102-.477-.15-.678.15-.2.3-.777.98-.953 1.18-.176.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.376-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515h-.578c-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.511s1.079 2.912 1.229 3.113c.15.201 2.124 3.243 5.145 4.548.719.311 1.28.497 1.718.636.722.23 1.378.197 1.898.12.579-.086 1.781-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12.042 21.879h-.002c-1.745 0-3.457-.468-4.96-1.354l-.356-.21-3.69 1.218 1.242-3.597-.231-.367A9.83 9.83 0 0 1 2.19 12.04c0-5.433 4.42-9.854 9.856-9.854 2.632 0 5.107 1.025 6.968 2.887a9.814 9.814 0 0 1 2.887 6.969c-.002 5.435-4.424 9.837-9.859 9.837zM12.042 0C5.402 0 0 5.402 0 12.042c0 2.122.553 4.192 1.604 6.012L.058 24l6.096-1.599a12.007 12.007 0 0 0 5.888 1.53h.005c6.64 0 12.042-5.402 12.042-12.042 0-3.217-1.253-6.241-3.528-8.516C18.286 1.254 15.26 0 12.042 0z"/>
        </svg>
      ),
      tooltip: 'Chat on WhatsApp',
      isExternal: true,
    },
  ];

  return (
    <aside
      ref={containerRef}
      aria-label="Floating quick contact speed dial"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* Vertically Stacked 4 Social Media Icons (matching reference image) */}
      <div
        className={`flex flex-col items-center gap-3 mb-3.5 transition-all duration-300 ease-out origin-bottom ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-y-8 pointer-events-none scale-90'
        }`}
      >
        {socialItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              transitionDelay: isOpen ? `${(socialItems.length - 1 - index) * 40}ms` : '0ms',
            }}
            className={`group relative flex items-center transition-all duration-200 ${
              isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75'
            }`}
          >
            {/* Desktop Tooltip Hover Tag */}
            <span className="hidden md:inline-block absolute right-14 px-2.5 py-1 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-medium rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
              {item.tooltip}
            </span>

            {/* Circular Action Button */}
            <a
              id={item.id}
              href={item.href}
              target={item.isExternal ? '_blank' : '_self'}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
              aria-label={item.name}
              className={`w-12 h-12 rounded-full ${item.bg} text-white flex items-center justify-center shadow-lg shadow-black/20 hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/90`}
            >
              {item.icon}
            </a>
          </div>
        ))}
      </div>

      {/* Main Bottom Trigger Button matching reference image */}
      <button
        id="floating-speed-dial-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close contact menu' : 'Open social support menu'}
        aria-expanded={isOpen}
        className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-xl shadow-blue-500/30 transition-transform duration-200 hover:scale-105 active:scale-95 border-2 border-white cursor-pointer z-10"
      >
        {/* Pulse effect when collapsed */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        )}

        {/* Smooth Morphing Icon between MessageCircle and X */}
        <div className="relative w-6 h-6 flex items-center justify-center">
          <X
            className={`w-6 h-6 stroke-[2.5] absolute transition-all duration-250 ease-out ${
              isOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
            }`}
          />
          <MessageCircle
            className={`w-6 h-6 fill-white text-white stroke-[1.5] absolute transition-all duration-250 ease-out ${
              isOpen ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
            }`}
          />
        </div>
      </button>
    </aside>
  );
};
