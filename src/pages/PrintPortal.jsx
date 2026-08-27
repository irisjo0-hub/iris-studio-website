import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Printer, ShoppingBag, Truck, Layers, Sparkles, 
  ArrowLeft, ArrowRight, PhoneCall, Check, Search, PackageCheck
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import '../styles/home.css';

const PrintPortal = () => {
  const { lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [trackNumber, setTrackNumber] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  const [activeTab, setActiveTab] = useState('categories');

  const printCategories = [
    {
      id: 'canvas',
      title_ar: 'اللوحات والكانفاس الفاخر',
      desc_ar: 'طباعة لوحات جدارية عالية الدقة مشدودة على خشب سويدي ممتاز.',
      badge: 'الأكثر طلباً',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'albums',
      title_ar: 'ألبومات الصور والأكريليك',
      desc_ar: 'ألبومات حرارية وأغطية أكريليك شفافة لحفظ أفخم الذكريات.',
      badge: 'جودة حرارية',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'custom',
      title_ar: 'الطباعة المخصصة للتجار والشركات',
      desc_ar: 'طباعة التغليف، الكروت، والاستيكرات بأشكال ومقاسات مخصصة.',
      badge: 'مخصص 🖨️',
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'gifts',
      title_ar: 'الهدايا التذكارية والمطبوعات',
      title_en: 'Gifts & Souvenirs',
      desc_ar: 'طباعة الهدايا المخصصة للطلاب والخريجين والشركات.',
      badge: 'هدايا',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (!trackNumber.trim()) return;
    setTrackResult({
      id: trackNumber,
      status: 'قيد الطباعة والتجهيز 🖨️',
      estimatedDelivery: 'خلال 24-48 ساعة',
      details: 'تم استلام الملف وجاري معالجة الألوان والطباعة الحرارية.'
    });
  };

  return (
    <div className="division-portal-page" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Banner */}
      <section className="portal-hero-banner theme-print-bg">
        <div className="portal-hero-overlay" />
        <div className="portal-hero-container">
          <div className="portal-hero-badge print-badge">
            <span className="badge-dot" />
            <span>{isRtl ? '03 المطبوعات الفاخرة' : '03 PRINT DIVISION'}</span>
          </div>

          <h1 className="portal-hero-title">
            {isRtl ? 'قطاع المطبوعات الفاخرة والتغليف الراقي' : 'LUXURY PRINT & PREMIUM PACKAGING'}
          </h1>
          <p className="portal-hero-sub">
            {isRtl 
              ? 'نحول تصاميمك ورسوماتك إلى منتجات ملموسة بأعلى دقة طباعة وتغليف فاخر.' 
              : 'Transforming your artwork and photos into tangible luxury print products.'}
          </p>

          <div className="portal-hero-ctas">
            <Link to="/printing-products" className="btn-portal-primary print-btn">
              <ShoppingBag size={18} />
              <span>{isRtl ? 'تصفح متجر المطبوعات' : 'Print Shop'}</span>
            </Link>
            <button type="button" onClick={() => setActiveTab('custom')} className="btn-portal-secondary" style={{ cursor: 'pointer' }}>
              <Printer size={18} />
              <span>{isRtl ? 'طلب طباعة مخصصة' : 'Custom Printing'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Smart Sticky Interactive Tabs Bar */}
      <div className="portal-smart-tabs-bar">
        <div className="portal-smart-tabs-container">
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            🗂️ {isRtl ? 'تصنيفات الطباعة' : 'Categories'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            🖨️ {isRtl ? 'طلب مخصص' : 'Custom Request'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => setActiveTab('track')}
          >
            📦 {isRtl ? 'تتبع الطلب' : 'Track Order'}
          </button>
        </div>
      </div>

      {/* 1. Categories & Products Section */}
      {activeTab === 'categories' && (
        <section id="categories-section" className="portal-section theme-alt-bg">
          <div className="portal-section-header">
            <span className="section-eyebrow">CATEGORIES</span>
            <h2>{isRtl ? 'تصنيفات المطبوعات المتاحة' : 'Printing Categories'}</h2>
            <p>{isRtl ? 'استعرض واطلب منتجاتنا المطبوعة الجاهزة مع خدمة التوصيل السريع.' : 'Browse and order our luxury print items with fast delivery.'}</p>
          </div>

          <div className="visual-portfolio-grid">
            {printCategories.map((c) => (
              <Link key={c.id} to="/printing-products" className="visual-project-card">
                <div className="visual-card-thumb">
                  <img src={c.image} alt={c.title_ar} loading="lazy" />
                  <div className="visual-card-gradient" />
                  <span className="visual-card-badge">{c.badge}</span>
                </div>
                <div className="visual-card-body">
                  <h3>{c.title_ar}</h3>
                  <p>{c.desc_ar}</p>
                  <div className="visual-card-footer">
                    <span className="visual-card-btn-text">
                      <span>{isRtl ? 'طلب الآن' : 'Order Now'}</span>
                      {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: '32px' }} className="portal-banner-feature print-banner">
            <div className="feature-info">
              <span className="feature-tag">🖨️ طباعة بدقة عالية</span>
              <h3>منتجات طباعة أكريليك، كانفاس، وخشب فاخر</h3>
              <p>اختر الحجم والأبعاد المطلوبة وارفع صورتك مباشرة ليتم طباعتها وتغليفها وشحنها لك.</p>
              <Link to="/printing-products" className="btn-portal-primary print-btn" style={{ display: 'inline-flex', marginTop: '16px' }}>
                <span>فتح المتجر الإلكتروني كامل</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 2. Custom Order Section */}
      {activeTab === 'custom' && (
        <section id="custom-section" className="portal-section">
          <div className="portal-section-header">
            <span className="section-eyebrow">CUSTOM PRINTING</span>
            <h2>{isRtl ? 'طلب طباعة بمواصفات مخصصة' : 'Custom Printing Request'}</h2>
            <p>{isRtl ? 'هل لديك ملف جاهز أو أبعاد خاصة؟ ارفع ملفك وسنقوم بالتسعير والطباعة.' : 'Upload your design and custom dimensions for tailored pricing.'}</p>
          </div>

          <div className="portal-quote-container">
            <div className="custom-print-box">
              <h3>ارفع ملفك أو صمم مطبوعاتك من خلال المتجر</h3>
              <p>نوفر خدمة الطباعة الفاخرة للكميات والمؤسسات والطلاب بخصومات خاصة.</p>
              <Link to="/printing-products" className="btn-portal-primary print-btn" style={{ display: 'inline-flex', marginTop: '16px' }}>
                <Printer size={18} />
                <span>انتقال لصفحة طلب المطبوعات المخصصة</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. Track Order Section */}
      {(activeTab === 'all' || activeTab === 'track') && (
        <section id="track-section" className="portal-section theme-alt-bg">
          <div className="portal-section-header">
            <span className="section-eyebrow">TRACK ORDER</span>
            <h2>{isRtl ? 'تتبع حالة طلب الطباعة الخاص بك' : 'Track Your Print Order'}</h2>
            <p>{isRtl ? 'أدخل رقم الطلب للتحقق من مرحلة الطباعة والتوصيل.' : 'Enter your order ID to check current printing and shipping status.'}</p>
          </div>

          <div className="portal-quote-container" style={{ maxWidth: 600 }}>
            <form onSubmit={handleTrackOrder} className="portal-quote-form">
              <div className="form-group">
                <label className="as-label">رقم الطلب (Order ID) *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    required
                    value={trackNumber}
                    onChange={(e) => setTrackNumber(e.target.value)}
                    placeholder="مثال: #IRIS-PRINT-1024"
                    className="as-input"
                    dir="ltr"
                  />
                  <button type="submit" className="btn-portal-primary print-btn" style={{ padding: '0 24px', flexShrink: 0 }}>
                    <Search size={18} />
                    <span>تتبع</span>
                  </button>
                </div>
              </div>
            </form>

            {trackResult && (
              <div className="quote-success-box" style={{ marginTop: '20px', textAlign: 'right' }}>
                <PackageCheck size={36} className="success-icon" />
                <h3>حالة الطلب: {trackResult.id}</h3>
                <p style={{ color: '#F5BD1A', fontWeight: 'bold', fontSize: '1.1rem' }}>{trackResult.status}</p>
                <p>{trackResult.details}</p>
                <span className="file-name-badge">⏱️ الوقت المتوقع: {trackResult.estimatedDelivery}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Contact Section */}
      <section id="contact-section" className="portal-section">
        <div className="portal-contact-box print-contact">
          <div className="contact-info">
            <h2>هل تحتاج لمساعدة في تجهيز ملف الطباعة؟</h2>
            <p>فريق المطبوعات والتصميم جاهز لمساعدتك في إعداد وتدقيق الملفات.</p>
          </div>
          <div className="contact-actions">
            <a href="https://wa.me/962797303260" target="_blank" rel="noreferrer" className="btn-portal-primary whatsapp-bg">
              💬 واتساب قسم الطباعة
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

export default PrintPortal;
