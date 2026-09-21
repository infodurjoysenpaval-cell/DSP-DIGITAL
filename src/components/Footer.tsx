import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { SHOP_INFO } from '../data/storeData';
import { getPage, getAllPages } from '../utils/pagesStorage';
import { PolicyPage } from '../types';

interface FooterProps {
  onSelectCategory?: (slug: string | null) => void;
  onSelectPolicy?: (policyKey: string) => void;
}

type PolicyType =
  | 'refund'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'why-shop'
  | 'payment-methods'
  | 'support'
  | 'faq'
  | null;

export const Footer: React.FC<FooterProps> = ({ onSelectPolicy }) => {
  const [activeModal, setActiveModal] = useState<PolicyType>(null);

  const handlePolicyClick = (policy: Exclude<PolicyType, null>) => {
    if (onSelectPolicy) {
      onSelectPolicy(policy);
    } else {
      setActiveModal(policy);
    }
  };
  const [pagesVersion, setPagesVersion] = useState(0);
  const phone = SHOP_INFO.whatsappNumber.replace(/[^0-9]/g, '');

  useEffect(() => {
    const handleUpdate = () => setPagesVersion((v) => v + 1);
    window.addEventListener('dsp_pages_updated', handleUpdate);
    return () => window.removeEventListener('dsp_pages_updated', handleUpdate);
  }, []);

  const currentPage: PolicyPage | null = activeModal ? getPage(activeModal) : null;

  const policyContent: Record<
    Exclude<PolicyType, null>,
    { title: string; content: React.ReactNode }
  > = {
    refund: {
      title: 'Return & Refund Policy',
      content: (
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            At <strong>DSP DIGITAL MART</strong>, we are committed to delivering 100% genuine and fully functional digital products, software licenses, and subscription accounts.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-900 text-xs">
            <strong>Key Guarantee:</strong> If any provided license key or login credential does not work upon delivery, our support team will replace it within 1–2 hours or issue a full refund.
          </div>
          <h4 className="font-semibold text-slate-800 text-sm pt-1">Eligibility for Refund / Replacement:</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Any key or account that fails activation within the initial warranty period.</li>
            <li>Inability from our technical support team to resolve the activation error.</li>
            <li>Out-of-stock items where immediate delivery cannot be completed.</li>
          </ul>
          <p className="text-xs text-slate-500 pt-1">
            Refunds are processed to your original payment method (bKash, Nagad, Rocket, or Bank) within 24 to 48 hours.
          </p>
        </div>
      ),
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            Your privacy and data security are our top priorities at <strong>DSP DIGITAL MART</strong>. We strictly safeguard all customer information collected during order placement and checkout.
          </p>
          <h4 className="font-semibold text-slate-800 text-sm pt-1">What Information We Collect:</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li>Customer Name, Phone number, and Email address for license delivery.</li>
            <li>Transaction IDs for payment confirmation and receipt generation.</li>
          </ul>
          <h4 className="font-semibold text-slate-800 text-sm pt-1">Information Security:</h4>
          <p className="text-xs text-slate-600">
            We never share, sell, or disclose your personal contact or payment information to any third party. All records are securely stored and encrypted for order tracking and warranty service.
          </p>
        </div>
      ),
    },
    terms: {
      title: 'Terms and Conditions',
      content: (
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            Welcome to <strong>DSP DIGITAL MART</strong>. By placing an order on our platform, you agree to comply with our service terms:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>Digital Product Delivery:</strong> License keys and subscriptions are delivered electronically via WhatsApp, Email, or your account dashboard.</li>
            <li><strong>Single / Multi-Device Rules:</strong> License keys must only be activated on the allowed number of devices specified in the product description.</li>
            <li><strong>Warranty Period:</strong> Replacement warranty is valid throughout the advertised subscription duration provided account credentials are not modified.</li>
            <li><strong>Support:</strong> Our team is available 24/7 to assist with remote setup, activation verification, and troubleshooting.</li>
          </ul>
        </div>
      ),
    },
    about: {
      title: 'About Us',
      content: (
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>DSP DIGITAL MART</strong> is Bangladesh's premier and trusted online destination for authentic software licenses, creative design tools, streaming passes, antivirus protection, and premium digital subscriptions.
          </p>
          <p className="text-xs text-slate-600">
            Headquartered in Khulna, Bangladesh, our mission is to empower professionals, students, freelancers, and businesses with affordable, genuine digital solutions backed by lightning-fast delivery and reliable 24/7 customer service.
          </p>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-600">
            <span><strong>Location:</strong> Khulna, Bangladesh</span>
            <span><strong>Hotline:</strong> +8801712792184</span>
            <span><strong>Email:</strong> dspdigitalmart@gmail.com</span>
          </div>
        </div>
      ),
    },
    'why-shop': {
      title: 'Why Shop Online with Us',
      content: (
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            Shopping with <strong>DSP DIGITAL MART</strong> guarantees authentic software, zero risk, and complete peace of mind:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800 text-xs block">100% Genuine Keys</span>
              <span className="text-[11px] text-slate-500">Directly sourced official license keys and verified accounts.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800 text-xs block">Instant Delivery</span>
              <span className="text-[11px] text-slate-500">Delivered within minutes to your WhatsApp and Email.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800 text-xs block">Affordable BD Pricing</span>
              <span className="text-[11px] text-slate-500">Unbeatable rates with localized bKash/Nagad checkout.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800 text-xs block">24/7 Friendly Support</span>
              <span className="text-[11px] text-slate-500">Human support ready to assist via WhatsApp & call anytime.</span>
            </div>
          </div>
        </div>
      ),
    },
    'payment-methods': {
      title: 'Online Payment Methods',
      content: (
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            We support the most convenient, secure, and widely used payment options in Bangladesh:
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="p-2.5 bg-pink-50/60 border border-pink-100 rounded-lg flex items-center justify-between">
              <div>
                <strong>bKash Personal / Send Money</strong>
                <p className="text-[11px] text-slate-500">Instant verification via Transaction ID</p>
              </div>
              <span className="text-pink-600 font-semibold text-xs">01712792184</span>
            </li>
            <li className="p-2.5 bg-orange-50/60 border border-orange-100 rounded-lg flex items-center justify-between">
              <div>
                <strong>Nagad Personal / Send Money</strong>
                <p className="text-[11px] text-slate-500">Fast & zero-hassle confirmation</p>
              </div>
              <span className="text-orange-600 font-semibold text-xs">01712792184</span>
            </li>
            <li className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-lg flex items-center justify-between">
              <div>
                <strong>Rocket Personal / Send Money</strong>
                <p className="text-[11px] text-slate-500">Dutch-Bangla Bank mobile banking</p>
              </div>
              <span className="text-purple-600 font-semibold text-xs">01712792184</span>
            </li>
            <li className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between">
              <div>
                <strong>Bank Transfer / Online Banking</strong>
                <p className="text-[11px] text-slate-500">Available upon request via WhatsApp</p>
              </div>
              <span className="text-blue-600 font-semibold text-xs">Available</span>
            </li>
          </ul>
        </div>
      ),
    },
    support: {
      title: 'After Sales Support',
      content: (
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            Our relationship doesn't end when you complete your purchase! We provide lifetime customer guidance and full warranty backing:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
            <li><strong>Step-by-step Setup Guides:</strong> Detailed video and screenshot guides for smooth installation.</li>
            <li><strong>Remote Desk Assistance:</strong> If you face activation issues, our technical specialists can assist via AnyDesk or TeamViewer.</li>
            <li><strong>Warranty Renewal Notifications:</strong> Friendly reminders before your subscription expires so your work is never interrupted.</li>
            <li><strong>Direct WhatsApp Helpline:</strong> Call or chat with us directly at +8801712792184.</li>
          </ul>
        </div>
      ),
    },
    faq: {
      title: 'Frequently Asked Questions (FAQ)',
      content: (
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block text-[13px] mb-1">Q: How do I receive my product after payment?</strong>
              <p className="text-slate-600">A: Within 5 to 30 minutes of payment confirmation, your license key or account details will be sent to your WhatsApp and Email address.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block text-[13px] mb-1">Q: Are the licenses 100% genuine and safe?</strong>
              <p className="text-slate-600">A: Yes! All our software keys and subscriptions are genuine, official, and covered by our replacement warranty.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <strong className="text-slate-800 block text-[13px] mb-1">Q: What if I have trouble activating my key?</strong>
              <p className="text-slate-600">A: Simply contact our WhatsApp support at +8801712792184. Our support agents will guide you or provide a replacement immediately.</p>
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <>
      <footer
        id="footer-support-section"
        className="bg-white text-slate-700 border-t border-slate-200/90 pt-10 pb-4"
      >
        {/* Centered container with balanced padding & max-width matching reference image */}
        <div className="w-full max-w-[1240px] xl:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main 4-Column Grid exactly matching reference image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 xl:gap-10 items-start">
            
            {/* Column 1: Brand Logo, Description & Social Icons */}
            <div className="space-y-3.5">
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt="DSP DIGITAL MART - Your Smart Partner in the Digital World"
                  className="h-10 w-auto object-contain select-none"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = SHOP_INFO.logoPrimary || '/logo.png';
                  }}
                />
              </div>

              <p className="text-[13px] leading-relaxed text-slate-700 max-w-[285px]">
                Get official software license keys, premium mobile apps, design tools, and digital subscriptions in Bangladesh at affordable prices. Enjoy fast delivery and reliable 24/7 support.
              </p>

              {/* 4 Circular Social Icons matching reference image with authentic brand SVGs */}
              <div className="flex items-center gap-2.5 pt-1">
                {/* Facebook */}
                <a
                  id="footer-social-facebook"
                  href="https://www.facebook.com/dspdigitalmart"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit Facebook Page"
                  className="w-[34px] h-[34px] rounded-full bg-[#EBF0F5] hover:bg-[#1877F2]/15 flex items-center justify-center transition-all duration-150 hover:scale-105"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  id="footer-social-instagram"
                  href="https://www.instagram.com/dspdigitalmart.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit Instagram"
                  className="w-[34px] h-[34px] rounded-full bg-[#EBF0F5] hover:bg-[#E4405F]/15 flex items-center justify-center transition-all duration-150 hover:scale-105"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-[#E4405F]" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  id="footer-social-youtube"
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit YouTube Channel"
                  className="w-[34px] h-[34px] rounded-full bg-[#EBF0F5] hover:bg-[#FF0000]/15 flex items-center justify-center transition-all duration-150 hover:scale-105"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-[#FF0000]" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  id="footer-social-whatsapp"
                  href={`https://wa.me/${phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  className="w-[34px] h-[34px] rounded-full bg-[#EBF0F5] hover:bg-[#25D366]/15 flex items-center justify-center transition-all duration-150 hover:scale-105"
                  title="WhatsApp"
                >
                  <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.301-.15-1.781-.879-2.057-.98-.276-.102-.477-.15-.678.15-.2.3-.777.98-.953 1.18-.176.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.501-1.786-1.677-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.201-.301.301-.502.101-.201.05-.376-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515h-.578c-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.511s1.079 2.912 1.229 3.113c.15.201 2.124 3.243 5.145 4.548.719.311 1.28.497 1.718.636.722.23 1.378.197 1.898.12.579-.086 1.781-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.075-.126-.276-.201-.577-.351zM12.042 21.879h-.002c-1.745 0-3.457-.468-4.96-1.354l-.356-.21-3.69 1.218 1.242-3.597-.231-.367A9.83 9.83 0 0 1 2.19 12.04c0-5.433 4.42-9.854 9.856-9.854 2.632 0 5.107 1.025 6.968 2.887a9.814 9.814 0 0 1 2.887 6.969c-.002 5.435-4.424 9.837-9.859 9.837zM12.042 0C5.402 0 0 5.402 0 12.042c0 2.122.553 4.192 1.604 6.012L.058 24l6.096-1.599a12.007 12.007 0 0 0 5.888 1.53h.005c6.64 0 12.042-5.402 12.042-12.042 0-3.217-1.253-6.241-3.528-8.516C18.286 1.254 15.26 0 12.042 0z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Contact Us */}
            <div>
              <h3 className="text-[17px] font-bold text-black mb-4 tracking-normal">
                Contact Us
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 fill-[#2563EB] text-[#2563EB] shrink-0" />
                  <a
                    href="mailto:dspdigitalmart@gmail.com"
                    className="hover:text-blue-600 transition-colors truncate"
                  >
                    dspdigitalmart@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 fill-[#2563EB] text-[#2563EB] shrink-0" />
                  <a
                    href="tel:+8801712792184"
                    className="hover:text-blue-600 transition-colors"
                  >
                    +8801712792184
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 fill-[#2563EB] text-[#2563EB] shrink-0" />
                  <span>Khulna, Bangladesh</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h3 className="text-[17px] font-bold text-black mb-4 tracking-normal">
                Quick Links
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li>
                  <button
                    type="button"
                    onClick={() => handlePolicyClick('refund')}
                    className="hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Return & Refund Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handlePolicyClick('privacy')}
                    className="hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handlePolicyClick('terms')}
                    className="hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Terms and Conditions
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handlePolicyClick('about')}
                    className="hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                  >
                    About us
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Useful Links */}
            <div>
              <h3 className="text-[17px] font-bold text-black mb-4 tracking-normal">
                Useful Links
              </h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li>
                  <button
                    type="button"
                    onClick={() => handlePolicyClick('why-shop')}
                    className="hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Why Shop Online with Us
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handlePolicyClick('payment-methods')}
                    className="hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                  >
                    Online Payment Methods
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handlePolicyClick('support')}
                    className="hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                  >
                    After Sales Support
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handlePolicyClick('faq')}
                    className="hover:text-blue-600 hover:underline transition-colors text-left cursor-pointer"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Divider Line & Centered Copyright matching reference image */}
          <div className="w-full border-t border-slate-200 mt-10 pt-4 pb-2 text-center">
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal">
              Copyright © 2026 www.dspdigitalmart.com
            </p>
          </div>
        </div>
      </footer>

      {/* Clean Policy & Information Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative max-h-[85vh] overflow-y-auto border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-main-heading">
                  {currentPage ? currentPage.title : policyContent[activeModal]?.title}
                </h3>
                {currentPage?.lastUpdated && (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Last Updated: {currentPage.lastUpdated}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content rendering from Admin Pages Storage */}
            {currentPage ? (
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                {currentPage.summary && (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 font-medium">
                    {currentPage.summary}
                  </div>
                )}

                {/* Main Content paragraphs */}
                <div className="space-y-2.5 whitespace-pre-line text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentPage.content}
                </div>

                {/* Highlights / Features if any */}
                {currentPage.highlights && currentPage.highlights.length > 0 && (
                  <div className="pt-2">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Key Highlights:
                    </h5>
                    <ul className="space-y-1.5">
                      {currentPage.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle className="w-3.5 h-3.5 text-[#0052FF] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>{policyContent[activeModal]?.content}</div>
            )}

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
