import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, Headphones, Lock } from 'lucide-react';
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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5">
      {/* Main Carousel Banner with Proportional Responsive Height */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-slate-900 shadow-sm overflow-hidden">
        <div className="relative overflow-hidden w-full h-[180px] xs:h-[210px] sm:h-[280px] md:h-[340px] lg:h-[380px] max-h-[400px]">
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
                className="w-full h-full object-cover object-center"
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

      {/* Trust Badges Highlights - Matched to Website Brand Blue */}
      <div className="mt-4 sm:mt-6 pt-1 pb-4 border-b border-slate-200/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 sm:gap-6">
          {/* Item 1: Instant Delivery */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100/80">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight truncate">Instant Delivery</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Automated, 24/7</p>
            </div>
          </div>

          {/* Item 2: 100% Authentic */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100/80">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight truncate">100% Authentic</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Genuine products</p>
            </div>
          </div>

          {/* Item 3: Safe Payment */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100/80">
              <Lock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight truncate">Safe Payment</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">bKash · Nagad · Card</p>
            </div>
          </div>

          {/* Item 4: 24/7 Support */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-[#0052FF] flex items-center justify-center shrink-0 border border-blue-100/80">
              <Headphones className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] tracking-tight truncate">24/7 Support</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">Always here to help</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
