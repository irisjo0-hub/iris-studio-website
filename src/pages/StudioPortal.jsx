import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, GraduationCap, Calendar, Sparkles, Layers, 
  ArrowLeft, ArrowRight, HelpCircle, PhoneCall, Image, BookOpen
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import '../styles/home.css';

const StudioPortal = () => {
  const { lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [openFaq, setOpenFaq] = useState(null);

  const studioBranches = [
    {
      title_ar: 'جلسات التصوير الاحترافية',
      title_en: 'Studio Sessions & Portraits',
      desc_ar: 'جلسات تصوير شخصية، عائلية، وبورتريهات احترافية بأحدث الإضاءات.',
      link: '/booking',
      icon: Camera,
      badge: 'حجز فوري'
    },
    {
      title_ar: 'البكجات والعروض الخاصة',
      title_en: 'Packages & Special Offers',
      desc_ar: 'بكجات متكاملة توفر عليك وتناسب كافة المناسبات والجلسات.',
      link: '/packages',
      icon: Sparkles,
      badge: 'خصومات'
    },
    {
      title_ar: 'تغطية الفعاليات والمناسبات',
      title_en: 'Events & Celebrations',
      desc_ar: 'تغطية فوتوغرافية وفيديو احترافي للحفلات والأحداث الخاصة.',
      link: '/events',
      icon: Calendar,
      badge: 'تغطية شاملة'
    },
    {
      title_ar: 'معرض الأعمال والبورتريه',
      title_en: 'Our Portfolio & Work',
      desc_ar: 'استعرض أفضل أعمال وجلسات الاستوديو السابقة بكامل تفاصيلها.',
      link: '/work',
      icon: Image,
      badge: 'معرض الصور'
    }
  ];

  const graduationSubBranches = [
    {
      num: '01',
      title_ar: 'جلسات تصوير الخريجين',
      desc_ar: 'جلسات تصوير فردية وجماعية لأثواب التخرج مع الدفاتر والشهادات.',
      link: '/graduation-package'
    },
    {
      num: '02',
      title_ar: 'دفاتر التخرج الفاخرة',
      desc_ar: 'دفاتر تخرج مخصصة عالية الجودة لطباعة ذكريات سنوات الدراسة.',
      link: '/graduation-books'
    },
    {
      num: '03',
      title_ar: 'قوالب الأغلفة الخارجية والداخلية',
      desc_ar: 'معرض تشكيلة واسعة من الأغلفة الذهبية والصفحات الداخلية لتختار منها.',
      link: '/templates'
    },
    {
      num: '04',
      title_ar: 'طلب دفتر تخرج مخصص',
      desc_ar: 'نموذج تقديم طلب دفتر تخرج جديد وإرفاق صورك وإهدائك بسهولة.',
      link: '/graduation-order'
    }
  ];

  const faqs = [
    {
      q_ar: 'كيف يمكنني حجز جلسة تصوير في الاستوديو؟',
      a_ar: 'يمكنك الحجز بسهولة من خلال الانتقال لصفحة "جلسات التصوير" واختيار الموعد والباقة المناسبة، وإرفاق العربون.'
    },
    {
      q_ar: 'ما هي مدة تسليم الصور النهائية للحجز؟',
      a_ar: 'يتم تسليم الصور الرقمية المحررة خلال 48 إلى 72 ساعة من موعد الجلسة عبر رابط تحميل خاص.'
    },
    {
      q_ar: 'هل يمكنني اختيار قالب غلاف دفتر التخرج الخاص بي؟',
      a_ar: 'نعم بالتأكيد! يمكنك تصفح "قوالب الأغلفة" واختيار رقم القالب الذي يعجبك وإدراجه في طلبك.'
    }
  ];

  return (
    <div className="division-portal-page" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Banner */}
      <section className="portal-hero-banner theme-studio-bg">
        <div className="portal-hero-overlay" />
        <div className="portal-hero-container">
          <div className="portal-hero-badge studio-badge">
            <span className="badge-dot" />
            <span>{isRtl ? '02 التصوير والاستوديو' : '02 STUDIO DIVISION'}</span>
          </div>

          <h1 className="portal-hero-title">
            {isRtl ? 'قطاع الاستوديو ورواية القصة البصرية' : 'STUDIO PHOTOGRAPHY & VISUAL STORYTELLING'}
          </h1>
          <p className="portal-hero-sub">
            {isRtl 
              ? 'وثق أجمل لحظاتك وذكريات تخرجك بجلسات تصوير سينمائية ودفاتر تخرج فاخرة.' 
              : 'Capture your cherished moments and graduation memories with cinematic portraits.'}
          </p>

          <div className="portal-hero-ctas">
            <Link to="/booking" className="btn-portal-primary studio-btn">
              <Camera size={18} />
              <span>{isRtl ? 'حجز جلسة تصوير الآن' : 'Book a Session'}</span>
            </Link>
            <Link to="/graduation-books" className="btn-portal-secondary">
              <GraduationCap size={18} />
              <span>{isRtl ? 'تصفح دفاتر التخرج' : 'Graduation Books'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Sub-branches Anchor Links Bar */}
      <div className="portal-sub-nav-bar">
        <div className="portal-nav-container">
          <a href="#sessions-section">📸 الجلسات والبكجات</a>
          <a href="#graduation-section">🎓 ركن التخرج الكامل</a>
          <a href="#portfolio-section">🖼️ معرض الأعمال</a>
          <a href="#faq-section">❓ الأسئلة الشائعة</a>
          <a href="#contact-section">📞 التواصل والموقع</a>
        </div>
      </div>

      {/* 1. Studio Sessions & Packages Section */}
      <section id="sessions-section" className="portal-section">
        <div className="portal-section-header">
          <span className="section-eyebrow">SESSIONS & PACKAGES</span>
          <h2>{isRtl ? 'جلسات التصوير والبكجات' : 'Studio Sessions & Packages'}</h2>
          <p>{isRtl ? 'اختر نوع الجلسة المناسبة لك واستمتع بتجربة تصوير استثنائية.' : 'Choose your preferred session and enjoy an extraordinary studio experience.'}</p>
        </div>

        <div className="portal-grid-4">
          {studioBranches.map((b, idx) => {
            const IconComp = b.icon;
            return (
              <div key={idx} className="portal-card-box">
                <div className="card-top-icon">
                  <IconComp size={28} />
                  <span className="card-tag">{b.badge}</span>
                </div>
                <h3>{b.title_ar}</h3>
                <p>{b.desc_ar}</p>
                <Link to={b.link} className="card-link-btn">
                  <span>{isRtl ? 'استكشف المزيد' : 'Explore'}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Full Graduation Branch Section */}
      <section id="graduation-section" className="portal-section theme-alt-bg">
        <div className="portal-section-header">
          <span className="section-eyebrow">GRADUATION CORNER</span>
          <h2>{isRtl ? 'ركن وفروع التخرج الشامل (Graduation)' : 'Full Graduation Hub'}</h2>
          <p>{isRtl ? 'كل ما يحتاجه الخريج من جلسات تصوير، دفاتر تخرج، وقوالب أغلفة في مكان واحد.' : 'Everything a graduate needs from photoshoots to custom notebooks.'}</p>
        </div>

        <div className="portal-grid-4">
          {graduationSubBranches.map((g) => (
            <div key={g.num} className="process-step-card studio-grad-card">
              <span className="step-badge-num">{g.num}</span>
              <h4>{g.title_ar}</h4>
              <p>{g.desc_ar}</p>
              <Link to={g.link} className="card-link-btn" style={{ marginTop: '12px' }}>
                <span>{isRtl ? 'انتقال للفرع' : 'Open Branch'}</span>
                {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Portfolio & Work Section */}
      <section id="portfolio-section" className="portal-section">
        <div className="portal-section-header">
          <span className="section-eyebrow">OUR PORTFOLIO</span>
          <h2>{isRtl ? 'معرض صور وأعمال الاستوديو' : 'Studio Photography Gallery'}</h2>
        </div>

        <div className="portal-banner-feature studio-banner">
          <div className="feature-info">
            <span className="feature-tag">📸 جودة سينمائية</span>
            <h3>استعرض مئات البورتريهات والذكريات الملتقطة</h3>
            <p>تصفح معرض أعمالنا الفنية المصنفة حسب الجلسات، التخرج، والبورتريه الشخصي.</p>
            <Link to="/work" className="btn-portal-primary studio-btn" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>فتح معرض الأعمال الكامل</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section id="faq-section" className="portal-section theme-alt-bg">
        <div className="portal-section-header">
          <span className="section-eyebrow">FAQ</span>
          <h2>{isRtl ? 'الأسئلة الشائعة حول الاستوديو' : 'Frequently Asked Questions'}</h2>
        </div>

        <div className="portal-faq-list">
          {faqs.map((f, idx) => (
            <div 
              key={idx} 
              className={`portal-faq-item ${openFaq === idx ? 'open' : ''}`}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="faq-question">
                <h4>{f.q_ar}</h4>
                <HelpCircle size={20} className="faq-icon" />
              </div>
              {openFaq === idx && (
                <div className="faq-answer">
                  <p>{f.a_ar}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Contact & Location Section */}
      <section id="contact-section" className="portal-section">
        <div className="portal-contact-box studio-contact">
          <div className="contact-info">
            <h2>نرحب بزيارتكم واستفساراتكم في الاستوديو</h2>
            <p>تواصل معنا لحجز المواعيد أو الاستفسار عن تفاصيل البكجات.</p>
          </div>
          <div className="contact-actions">
            <a href="https://wa.me/962790000000" target="_blank" rel="noreferrer" className="btn-portal-primary whatsapp-bg">
              💬 واتساب الاستوديو
            </a>
            <a href="tel:0790000000" className="btn-portal-secondary">
              <PhoneCall size={18} />
              <span>اتصال مباشر</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudioPortal;
