import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const GraduationPackage = () => {
  const { lang } = useSiteSettings();
  const isRtl = lang === 'ar';

  return (
    <div className={`min-h-screen bg-[#120911] text-[#ECEBE7] flex flex-col justify-center items-center px-6 py-24 text-center dir-${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#67245F]/40 border border-[#F5BD1A]/50 flex items-center justify-center mx-auto text-[#F5BD1A]">
          <GraduationCap size={32} />
        </div>
        
        <span className="inline-block px-4 py-1.5 rounded-full bg-[#F5BD1A]/10 border border-[#F5BD1A]/30 text-[#F5BD1A] text-xs font-bold tracking-wider uppercase">
          {isRtl ? 'بكج مطبوعات التخرج' : 'GRADUATION PACKAGE'}
        </span>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          {isRtl ? 'بكجات مطبوعات التخرج الشاملة' : 'Complete Graduation Print Package'}
        </h1>

        <p className="text-[#ECEBE7]/70 text-base md:text-lg">
          {isRtl
            ? 'نعمل حاليًا على تفصيل البكجات المتكاملة للخريجين. يمكنك مشاهدة دفاتر التخرج المتاحة حاليًا.'
            : 'Graduation packages page under preparation. Explore our graduation books in the meantime.'}
        </p>

        <div className="pt-6 flex flex-wrap gap-4 justify-center">
          <Link
            to="/graduation-books"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#F5BD1A] text-[#044630] font-bold text-base hover:bg-[#F5BD1A]/90 transition-all shadow-lg shadow-[#F5BD1A]/20"
          >
            <span>{isRtl ? 'استعرض دفاتر التخرج' : 'Explore Graduation Books'}</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#20101E] text-[#ECEBE7] border border-[#ECEBE7]/20 font-bold text-base hover:border-[#F5BD1A] transition-all"
          >
            {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GraduationPackage;
