import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Video, Film, Sparkles, Layers, CheckCircle2, 
  Send, PhoneCall, ArrowLeft, ArrowRight, Play, Briefcase, Zap, HelpCircle
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import '../styles/home.css';

const MediaPortal = () => {
  const navigate = useNavigate();
  const { lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState('all');
  const [quoteForm, setQuoteForm] = useState({ name: '', phone: '', serviceType: 'video', budget: '', details: '' });
  const [submitted, setSubmitted] = useState(false);

  const mediaServices = [
    {
      id: 'commercial',
      title_ar: 'إنتاج الإعلانات التجارية',
      title_en: 'Commercial Video Production',
      desc_ar: 'تصوير وإخراج إعلانات سينمائية عالية الجودة للماركات والشركات.',
      icon: Film,
      badge: 'المرتبة 1'
    },
    {
      id: 'social',
      title_ar: 'صناعة محتوى السوشيال ميديا',
      title_en: 'Social Media Content',
      desc_ar: 'فيديوهات قصيرة ريلز وتيك توك سريعة وتفاعلية بأسلوب عصري جذاب.',
      icon: Video,
      badge: 'شائع جداً'
    },
    {
      id: 'ondemand',
      title_ar: 'الخدمات الفورية (On-Demand)',
      title_en: 'On-Demand Media Services',
      desc_ar: 'فريق مصورين ومونتاج فوري لمواكبة الفعاليات والأحداث العاجلة.',
      icon: Zap,
      badge: 'فوري ⚡'
    },
    {
      id: 'documentary',
      title_ar: 'المستندات والأفلام الوثائقية',
      title_en: 'Documentaries & Corporate',
      desc_ar: 'توثيق قصة نجاح مؤسستك أو مشروعك برواية سينمائية مؤثرة.',
      icon: Layers,
      badge: 'احترافي'
    }
  ];

  const projectTypes = [
    { name_ar: 'إعلانات التلفزيون والراديو', name_en: 'TV & Radio Commercials' },
    { name_ar: 'فيديوهات البودكاست والبرامج', name_en: 'Podcast & Show Production' },
    { name_ar: 'تغطيات المؤتمرات والفعاليات', name_en: 'Event & Conference Coverage' },
    { name_ar: 'الموشنات والمؤثرات البصرية', name_en: 'Motion Graphics & VFX' }
  ];

  const steps = [
    { num: '01', title_ar: 'جلسة الاستشارة وتحديد الهدف', desc_ar: 'نناقش فكرتك وهدفك وتحديد هوية المحتوى المطلوب.' },
    { num: '02', title_ar: 'كتابة النص والسيناريو', desc_ar: 'صياغة فكرة مبتكرة ورسم مشاهد الفيديو (Storyboard).' },
    { num: '03', title_ar: 'التصوير والإخراج الساحر', desc_ar: 'استخدام أحدث الكاميرات والإضاءات والعدسات السينمائية.' },
    { num: '04', title_ar: 'المونتاج والتلوين الهندسي', desc_ar: 'مونتاج بدقة فائقة، هندسة صوتية وتلوين سينمائي جذاب.' }
  ];

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.phone) {
      alert(isRtl ? 'يرجى تعبئة الاسم ورقم الهاتف' : 'Please fill name and phone');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="division-portal-page" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Banner */}
      <section className="portal-hero-banner theme-media-bg">
        <div className="portal-hero-overlay" />
        <div className="portal-hero-container">
          <div className="portal-hero-badge">
            <span className="badge-dot" />
            <span>{isRtl ? '01 الدعاية والإعلان' : '01 MEDIA DIVISION'}</span>
          </div>

          <h1 className="portal-hero-title">
            {isRtl ? 'قطاع الميديا وصناعة المحتوى الإبداعي' : 'MEDIA & CREATIVE CONTENT PRODUCTION'}
          </h1>
          <p className="portal-hero-sub">
            {isRtl 
              ? 'نبتكر تجارب بصريّة سينمائية تصنع الفارق لعلامتك التجارية من الفكرة حتى الإنتاج النهائي.' 
              : 'Cinematic visual experiences that elevate your brand from concept to final cut.'}
          </p>

          <div className="portal-hero-ctas">
            <a href="#quote-section" className="btn-portal-primary">
              <Sparkles size={18} />
              <span>{isRtl ? 'طلب عرض سعر مباشر' : 'Request a Quote'}</span>
            </a>
            <a href="#projects-section" className="btn-portal-secondary">
              <Play size={18} />
              <span>{isRtl ? 'استكشف مشاريعنا' : 'Explore Projects'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Sub-branches Anchor Links Bar */}
      <div className="portal-sub-nav-bar">
        <div className="portal-nav-container">
          <a href="#services-section">🎥 الخدمات</a>
          <a href="#ondemand-section">⚡ خدمات فورية</a>
          <a href="#projects-section">📁 المشاريع</a>
          <a href="#process-section">⚙️ كيف نعمل</a>
          <a href="#quote-section">📝 طلب عرض سعر</a>
          <a href="#contact-section">📞 التواصل</a>
        </div>
      </div>

      {/* 1. Services Section */}
      <section id="services-section" className="portal-section">
        <div className="portal-section-header">
          <span className="section-eyebrow">SERVICES</span>
          <h2>{isRtl ? 'خدمات الإنتاج والمرئيات' : 'Media Production Services'}</h2>
          <p>{isRtl ? 'حلول إنتاجية شاملة تناسب تطلعاتكم وأهدافكم التسويقية.' : 'Comprehensive production solutions tailored to your marketing goals.'}</p>
        </div>

        <div className="portal-grid-4">
          {mediaServices.map((svc) => {
            const IconComp = svc.icon;
            return (
              <div key={svc.id} className="portal-card-box">
                <div className="card-top-icon">
                  <IconComp size={28} />
                  <span className="card-tag">{svc.badge}</span>
                </div>
                <h3>{isRtl ? svc.title_ar : svc.title_en}</h3>
                <p>{svc.desc_ar}</p>
                <a href="#quote-section" className="card-link-btn">
                  <span>{isRtl ? 'اطلب الخدمة' : 'Request'}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. On-Demand Section */}
      <section id="ondemand-section" className="portal-section theme-alt-bg">
        <div className="portal-section-header">
          <span className="section-eyebrow">ON-DEMAND MEDIA</span>
          <h2>{isRtl ? 'الخدمات الفورية التكيفية (On-Demand)' : 'On-Demand Fast Services'}</h2>
          <p>{isRtl ? 'فريق إنتاجي متخصص وجاهز للتنفيذ الفوري والتغطيات العاجلة في أي وقت.' : 'Dedicated team ready for fast turnaround and urgent event coverage.'}</p>
        </div>

        <div className="portal-banner-feature">
          <div className="feature-info">
            <span className="feature-tag">⚡ استجابة عاجلة</span>
            <h3>هل لديك حدث عاجل أو حملة تسويقية مفاجئة؟</h3>
            <p>نوفر طاقم مصورين ومعدات سينمائية ومحرري فيديو في الموقع مع تسليم فوري للمحتوى بنفس اليوم.</p>
            <Link to="/work" className="btn-portal-primary" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>معاينة نماذج تغطيات سابقة</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Project Types & Portfolio Section */}
      <section id="projects-section" className="portal-section">
        <div className="portal-section-header">
          <span className="section-eyebrow">PROJECT TYPES & PORTFOLIO</span>
          <h2>{isRtl ? 'أنواع المشاريع ومعرض الأعمال' : 'Project Types & Portfolio'}</h2>
        </div>

        <div className="portal-grid-4">
          {projectTypes.map((pt, idx) => (
            <div key={idx} className="portal-card-box project-type-card">
              <div className="card-top-icon">
                <span className="step-badge-num" style={{ fontSize: '1.6rem', margin: 0 }}>0{idx + 1}</span>
                <span className="card-tag">مشاريع آيرس</span>
              </div>
              <h3>{isRtl ? pt.name_ar : pt.name_en}</h3>
              <p style={{ fontSize: '0.85rem' }}>نماذج سابقة مصورة بتقنيات عالية الجودة.</p>
              <Link to="/work" className="card-link-btn" style={{ marginTop: 'auto' }}>
                <span>{isRtl ? 'مشاهدة المعرض' : 'View Work'}</span>
                {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How We Work Section */}
      <section id="process-section" className="portal-section theme-alt-bg">
        <div className="portal-section-header">
          <span className="section-eyebrow">HOW WE WORK</span>
          <h2>{isRtl ? 'طريقة وخطة العمل في آيرس' : 'Our Production Process'}</h2>
        </div>

        <div className="portal-grid-4">
          {steps.map((st) => (
            <div key={st.num} className="process-step-card">
              <span className="step-badge-num">{st.num}</span>
              <h4>{st.title_ar}</h4>
              <p>{st.desc_ar}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Request a Quote Section */}
      <section id="quote-section" className="portal-section">
        <div className="portal-section-header">
          <span className="section-eyebrow">REQUEST A QUOTE</span>
          <h2>{isRtl ? 'احصل على عرض سعر مخصص لمشروعك' : 'Request a Custom Quote'}</h2>
          <p>{isRtl ? 'أدخل تفاصيل مشروعك وسيقوم فريق الميديا بالتواصل معك خلال ساعات.' : 'Fill in your project details and our media team will contact you shortly.'}</p>
        </div>

        <div className="portal-quote-container">
          {submitted ? (
            <div className="quote-success-box">
              <CheckCircle2 size={48} className="success-icon" />
              <h3>تم استلام طلب عرض السعر بنجاح!</h3>
              <p>شكراً لاهتمامك. سيتواصل معك أحد منتجي آيرس خلال وقت قصير لمناقشة التفاصيل.</p>
              <button type="button" className="btn-portal-primary" onClick={() => setSubmitted(false)}>
                تقديم طلب آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleQuoteSubmit} className="portal-quote-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label className="as-label">الاسم الكامل *</label>
                  <input 
                    type="text" 
                    required 
                    value={quoteForm.name} 
                    onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                    placeholder="مثال: أحمد العبدالله" 
                    className="as-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="as-label">رقم الهاتف / الواتساب *</label>
                  <input 
                    type="tel" 
                    required 
                    value={quoteForm.phone} 
                    onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                    placeholder="07XXXXXXXX" 
                    className="as-input" 
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="as-label">نوع الخدمة المطلوب</label>
                  <select 
                    value={quoteForm.serviceType}
                    onChange={(e) => setQuoteForm({ ...quoteForm, serviceType: e.target.value })}
                    className="as-input"
                  >
                    <option value="video">إنتاج فيديو تجاري / إعلاني</option>
                    <option value="social">محتوى سوشيال ميديا (ريلز / تيك توك)</option>
                    <option value="ondemand">تغطية قريبة / خدمة فورية</option>
                    <option value="documentary">فيلم وثائقي / شركي</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="as-label">الميزانية التقديرية (JOD)</label>
                  <input 
                    type="text" 
                    value={quoteForm.budget} 
                    onChange={(e) => setQuoteForm({ ...quoteForm, budget: e.target.value })}
                    placeholder="مثال: 300 - 800 JOD" 
                    className="as-input" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="as-label">تفاصيل أو فكرة المشروع</label>
                <textarea 
                  rows={4}
                  value={quoteForm.details}
                  onChange={(e) => setQuoteForm({ ...quoteForm, details: e.target.value })}
                  placeholder="اكتب نبذة عن الفكرة، المدة المتوقعة، أو مواقع التصوير المطلوب..."
                  className="as-input"
                />
              </div>

              <button type="submit" className="btn-portal-primary btn-submit-full">
                <Send size={18} />
                <span>إرسال طلب عرض السعر</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 6. Contact Section */}
      <section id="contact-section" className="portal-section theme-alt-bg">
        <div className="portal-contact-box">
          <div className="contact-info">
            <h2>هل لديك أي استفسار عاجل؟</h2>
            <p>تواصل مباشرة مع قسم الميديا والإنتاج عبر الهاتف أو الواتساب.</p>
          </div>
          <div className="contact-actions">
            <a href="https://wa.me/962798627259" target="_blank" rel="noreferrer" className="btn-portal-primary whatsapp-bg">
              💬 تواصل عبر الواتساب
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

export default MediaPortal;
