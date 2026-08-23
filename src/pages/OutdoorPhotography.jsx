import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const OutdoorPhotography = () => {
  const { lang } = useSiteSettings();
  const isRtl = lang === 'ar';

  return (
    <div className={`min-h-screen bg-[#120911] text-[#ECEBE7] flex flex-col justify-center items-center px-6 py-24 text-center dir-${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#67245F]/40 border border-[#F5BD1A]/50 flex items-center justify-center mx-auto text-[#F5BD1A]">
          <Camera size={32} />
        </div>
        
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#F5BD1A]/10 border border-[#F5BD1A]/30 text-[#F5BD1A] text-xs font-bold tracking-wider uppercase">
          {isRtl ? 'التصوير الخارجي' : 'OUTDOOR PHOTOGRAPHY'}
        </span>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          {isRtl ? 'خدمة التصوير الخارجي والمواقع' : 'Outdoor Photography Service'}
        </h1>

        <p className="text-[#ECEBE7]/70 text-base md:text-lg">
          {isRtl
            ? 'نعمل حاليًا على تجهيز صفحة جلسات التصوير الخارجية. يمكنك التواصل معنا للحجز والترتيب.'
            : 'We are preparing the outdoor photography page. Contact us to book your session.'}
        </p>

        <div className="pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#F5BD1A] text-[#044630] font-bold text-base hover:bg-[#F5BD1A]/90 transition-all shadow-lg shadow-[#F5BD1A]/20"
          >
            {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            <span>{isRtl ? 'العودة للرئيسية' : 'Return to Home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OutdoorPhotography;
