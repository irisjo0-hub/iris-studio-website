import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, GraduationCap, Calendar, Sparkles, Layers, 
  ArrowLeft, ArrowRight, HelpCircle, PhoneCall, Image, BookOpen
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import '../styles/home.css';

const StudioPortal = () => {
  const { lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState('sessions');
  const [openFaq, setOpenFaq] = useState(null);

  const handleTabSelect = (tabKey, e) => {
    setActiveTab(tabKey);
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

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
      id: 'grad-sessions',
      title_ar: 'جلسات تصوير الخريجين',
      desc_ar: 'جلسات تصوير فردية وجماعية لأثواب التخرج مع الدفاتر والشهادات.',
      category_ar: 'تصوير تخرج',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
      link: '/graduation-package'
    },
    {
      id: 'grad-books',
      title_ar: 'دفاتر التخرج الفاخرة',
      desc_ar: 'دفاتر تخرج مخصصة عالية الجودة لطباعة ذكريات سنوات الدراسة.',
      category_ar: 'طباعة فاخرة',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      link: '/graduation-books'
    },
    {
      id: 'grad-templates',
      title_ar: 'قوالب الأغلفة الخارجية والداخلية',
      desc_ar: 'معرض تشكيلة واسعة من الأغلفة الذهبية والصفحات الداخلية لتختار منها.',
      category_ar: 'تصاميم أغلفة',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
      link: '/templates'
    },
    {
      id: 'grad-custom',
      title_ar: 'طلب دفتر تخرج مخصص',
      desc_ar: 'نموذج تقديم طلب دفتر تخرج جديد وإرفاق صورك وإهدائك بسهولة.',
      category_ar: 'طلب مباشر',
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
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

      {/* Smart Sticky Interactive Tabs Bar */}
      <div className="portal-smart-tabs-bar">
        <div className="portal-smart-tabs-container">
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={(e) => handleTabSelect('sessions', e)}
          >
            📸 {isRtl ? 'جلسات التصوير' : 'Sessions'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'graduation' ? 'active' : ''}`}
            onClick={(e) => handleTabSelect('graduation', e)}
          >
            🎓 {isRtl ? 'ركن التخرج' : 'Graduation'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={(e) => handleTabSelect('portfolio', e)}
          >
            🖼️ {isRtl ? 'معرض الأعمال' : 'Gallery'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={(e) => handleTabSelect('faq', e)}
          >
            ❓ {isRtl ? 'الأسئلة الشائعة' : 'FAQ'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* 1. Studio Sessions & Packages Section */}
          {activeTab === 'sessions' && (
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
          )}

          {/* 2. Full Graduation Branch Section */}
          {activeTab === 'graduation' && (
            <section id="graduation-section" className="portal-section theme-alt-bg">
              <div className="portal-section-header">
                <span className="section-eyebrow">GRADUATION CORNER</span>
                <h2>{isRtl ? 'ركن وفروع التخرج الشامل (Graduation)' : 'Full Graduation Hub'}</h2>
                <p>{isRtl ? 'كل ما يحتاجه الخريج من جلسات تصوير، دفاتر تخرج، وقوالب أغلفة في مكان واحد.' : 'Everything a graduate needs from photoshoots to custom notebooks.'}</p>
              </div>

              <div className="visual-portfolio-grid">
                {graduationSubBranches.map((g) => (
                  <Link key={g.id} to={g.link} className="visual-project-card">
                    <div className="visual-card-thumb">
                      <img src={g.image} alt={g.title_ar} loading="lazy" />
                      <div className="visual-card-gradient" />
                      <span className="visual-card-badge">{g.category_ar}</span>
                    </div>
                    <div className="visual-card-body">
                      <h3>{g.title_ar}</h3>
                      <p>{g.desc_ar}</p>
                      <div className="visual-card-footer">
                        <span className="visual-card-btn-text">
                          <span>{isRtl ? 'انتقال للفرع' : 'Open Branch'}</span>
                          {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 3. Portfolio & Work Section */}
          {activeTab === 'portfolio' && (
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
          )}

          {/* 4. FAQ Section */}
          {activeTab === 'faq' && (
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
          )}
        </motion.div>
      </AnimatePresence>

      {/* 5. Contact & Location Section */}
      <section id="contact-section" className="portal-section">
        <div className="portal-contact-box studio-contact">
          <div className="contact-info">
            <h2>نرحب بزيارتكم واستفساراتكم في الاستوديو</h2>
            <p>تواصل معنا لحجز المواعيد أو الاستفسار عن تفاصيل البكجات.</p>
          </div>
          <div className="contact-actions">
            <a href="https://wa.me/962797303260" target="_blank" rel="noreferrer" className="btn-portal-primary whatsapp-bg">
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
