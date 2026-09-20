import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, Headphones, CreditCard } from 'lucide-react';
import { CAROUSELS } from '../data/storeData';

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (CAROUSELS.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSELS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSELS.length) % CAROUSELS.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSELS.length);
  };

  return (
    <section className="w-full max-w-[1600px] 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Main Carousel Banner with Apple-Style Clean Border */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        <div className="relative overflow-hidden bg-white aspect-[2.6/1] min-h-[160px] sm:min-h-[240px] md:min-h-[320px]">
          {CAROUSELS.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={banner.images[0]}
                alt={banner.name || 'DSP Digital Mart Promo Banner'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Carousel Controls */}
          {CAROUSELS.length > 1 && (
            <>
              <button
                id="hero-carousel-prev"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                id="hero-carousel-next"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Slide Indicators with Brand Blue Active */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {CAROUSELS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? 'w-6 bg-[#3B82F6]'
                        : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Trust Badges Highlights with Harmonized Palette */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-sub-heading text-[#0F172A]">Instant Delivery</h4>
            <p className="text-[11px] text-slate-500 font-body-text">Delivered immediately after order</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-sub-heading text-[#0F172A]">100% Genuine License</h4>
            <p className="text-[11px] text-slate-500 font-body-text">Official & secure subscriptions</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-sub-heading text-[#0F172A]">24/7 Live Support</h4>
            <p className="text-[11px] text-slate-500 font-body-text">Quick support via WhatsApp</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-sub-heading text-[#0F172A]">Easy Payment</h4>
            <p className="text-[11px] text-slate-500 font-body-text">bKash, Nagad, Rocket & Bank</p>
          </div>
        </div>
      </div>
    </section>
  );
};
