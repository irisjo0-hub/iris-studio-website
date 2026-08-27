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
  const [activeTab, setActiveTab] = useState('services');
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

  const visualProjects = [
    {
      id: 'tv-ads',
      title_ar: 'إعلانات التلفزيون والسينما',
      title_en: 'TV & Cinema Commercials',
      desc_ar: 'إنتاج إعلانات تجارية سينمائية بأحدث كاميرات السينما ومؤثرات البصرية.',
      desc_en: 'High-impact TV and cinema commercial productions.',
      category_ar: 'إنتاج سينمائي',
      category_en: 'Cinema Production',
      image: 'https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=800&q=80',
      link: '/work'
    },
    {
      id: 'podcast',
      title_ar: 'فيديوهات البودكاست والبرامج',
      title_en: 'Podcast & Show Production',
      desc_ar: 'تجهيز استوديو بودكاست احترافي مع إضاءات متعددة وهندسة صوتية نقية.',
      desc_en: 'Full podcast studio setup and show production.',
      category_ar: 'استوديو بودكاست',
      category_en: 'Podcast Studio',
      image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
      link: '/work'
    },
    {
      id: 'events',
      title_ar: 'تغطيات المؤتمرات والفعاليات',
      title_en: 'Event & Conference Coverage',
      desc_ar: 'تغطية فوتوغرافية وفيديو احترافية للفعاليات الكبرى والمؤتمرات.',
      desc_en: 'Comprehensive photo and video event coverage.',
      category_ar: 'تغطيات حية',
      category_en: 'Live Coverage',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      link: '/work'
    },
    {
      id: 'motion',
      title_ar: 'الموشنات والمؤثرات البصرية 3D',
      title_en: '3D Motion Graphics & VFX',
      desc_ar: 'تصميم جرافيك متحرك ومؤثرات 3D تضفي طابعاً إبداعياً لمشروعك.',
      desc_en: 'Cutting-edge 3D motion graphics and VFX animations.',
      category_ar: 'موشنات 3D',
      category_en: '3D VFX',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      link: '/work'
    }
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

      {/* Smart Sticky Interactive Tabs Bar */}
      <div className="portal-smart-tabs-bar">
        <div className="portal-smart-tabs-container">
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            🎥 {isRtl ? 'الخدمات المرئية' : 'Services'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            🖼️ {isRtl ? 'معرض الأعمال' : 'Portfolio'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'process' ? 'active' : ''}`}
            onClick={() => setActiveTab('process')}
          >
            ⚙️ {isRtl ? 'طريقة العمل' : 'Process'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'quote' ? 'active' : ''}`}
            onClick={() => setActiveTab('quote')}
          >
            📝 {isRtl ? 'طلب عرض سعر' : 'Quote'}
          </button>
        </div>
      </div>

      {/* 1. Services Section */}
      {activeTab === 'services' && (
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
                  <button type="button" onClick={() => setActiveTab('quote')} className="card-link-btn" style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                    <span>{isRtl ? 'اطلب الخدمة' : 'Request'}</span>
                    {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '32px' }} className="portal-banner-feature">
            <div className="feature-info">
              <span className="feature-tag">⚡ استجابة عاجلة</span>
              <h3>هل لديك حدث عاجل أو حملة تسويقية مفاجئة؟</h3>
              <p>نوفر طاقم مصورين ومعدات سينمائية ومحرري فيديو في الموقع مع تسليم فوري للمحتوى بنفس اليوم.</p>
              <button type="button" onClick={() => setActiveTab('projects')} className="btn-portal-primary" style={{ display: 'inline-flex', marginTop: '16px', border: 'none' }}>
                <span>معاينة نماذج تغطيات سابقة</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Project Types & Portfolio Section */}
      {activeTab === 'projects' && (
        <section id="projects-section" className="portal-section">
          <div className="portal-section-header">
            <span className="section-eyebrow">CREATIVE MEDIA SHOWCASE</span>
            <h2>{isRtl ? 'معرض أعمال ومشاريع الميديا' : 'Creative Media Showcase'}</h2>
            <p>{isRtl ? 'استعرض نماذج من أعمالنا السينمائية والإنتاجية المصممة بأعلى التقنيات العالمية.' : 'Explore curated samples of our high-end film and media productions.'}</p>
          </div>

          <div className="visual-portfolio-grid">
            {visualProjects.map((proj) => (
              <Link key={proj.id} to={proj.link} className="visual-project-card">
                <div className="visual-card-thumb">
                  <img src={proj.image} alt={proj.title_ar} loading="lazy" />
                  <div className="visual-card-gradient" />
                  <span className="visual-card-badge">{isRtl ? proj.category_ar : proj.category_en}</span>
                  <div className="visual-card-play-icon">
                    <Play size={22} fill="currentColor" />
                  </div>
                </div>
                <div className="visual-card-body">
                  <h3>{isRtl ? proj.title_ar : proj.title_en}</h3>
                  <p>{isRtl ? proj.desc_ar : proj.desc_en}</p>
                  <div className="visual-card-footer">
                    <span className="visual-card-btn-text">
                      <span>{isRtl ? 'مشاهدة المعرض' : 'Explore Portfolio'}</span>
                      {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. How We Work Section */}
      {activeTab === 'process' && (
        <section id="process-section" className="portal-section theme-alt-bg">
          <div className="portal-section-header">
            <span className="section-eyebrow">HOW WE WORK</span>
            <h2>{isRtl ? 'طريقة وخطة العمل في آيرس' : 'Our Production Process'}</h2>
          </div>

          <div className="workflow-timeline-container">
            {steps.map((st) => (
              <div key={st.num} className="workflow-timeline-card">
                <div className="timeline-step-header">
                  <span className="timeline-step-num">{st.num}</span>
                  <div className="timeline-step-icon">
                    <Sparkles size={18} />
                  </div>
                </div>
                <h4>{st.title_ar}</h4>
                <p>{st.desc_ar}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Request a Quote Section */}
      {activeTab === 'quote' && (
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
      )}

      {/* 6. Contact Section */}
      <section id="contact-section" className="portal-section theme-alt-bg">
        <div className="portal-contact-box">
          <div className="contact-info">
            <h2>هل لديك أي استفسار عاجل؟</h2>
            <p>تواصل مباشرة مع قسم الميديا والإنتاج عبر الهاتف أو الواتساب.</p>
          </div>
          <div className="contact-actions">
            <a href="https://wa.me/962797303260" target="_blank" rel="noreferrer" className="btn-portal-primary whatsapp-bg">
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
