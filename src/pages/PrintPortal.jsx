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

  const printCategories = [
    {
      id: 'canvas',
      title_ar: 'اللوحات والكانفاس الفاخر',
      desc_ar: 'طباعة لوحات جدارية عالية الدقة مشدودة على خشب سويدي ممتاز.',
      badge: 'الأكثر طلباً'
    },
    {
      id: 'albums',
      title_ar: 'ألبومات الصور والأكريليك',
      desc_ar: 'ألبومات حرارية وأغطية أكريليك شفافة لحفظ أفخم الذكريات.',
      badge: 'جودة حرارية'
    },
    {
      id: 'custom',
      title_ar: 'الطباعة المخصصة للتجار والشركات',
      desc_ar: 'طباعة التغليف، الكروت، والاستيكرات بأشكال ومقاسات مخصصة.',
      badge: 'مخصص 🖨️'
    },
    {
      id: 'gifts',
      title_ar: 'الهدايا التذكارية والمطبوعات',
      title_en: 'Gifts & Souvenirs',
      desc_ar: 'طباعة الهدايا المخصصة للطلاب والخريجين والشركات.',
      badge: 'هدايا'
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
            <a href="#custom-section" className="btn-portal-secondary">
              <Printer size={18} />
              <span>{isRtl ? 'طلب طباعة مخصصة' : 'Custom Printing'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Sub-branches Anchor Links Bar */}
      <div className="portal-sub-nav-bar">
        <div className="portal-nav-container">
          <a href="#shop-section">🛒 المتجر والمنتجات</a>
          <a href="#categories-section">🗂️ تصنيفات الطباعة</a>
          <a href="#custom-section">🖨️ طلب طباعة مخصصة</a>
          <a href="#track-section">📦 تتبع حالة الطلب</a>
          <a href="#contact-section">📞 التواصل والاستفسار</a>
        </div>
      </div>

      {/* 1. Shop & Products Section */}
      <section id="shop-section" className="portal-section">
        <div className="portal-section-header">
          <span className="section-eyebrow">SHOP & PRODUCTS</span>
          <h2>{isRtl ? 'متجر المنتجات والمطبوعات الفاخرة' : 'Print Products Shop'}</h2>
          <p>{isRtl ? 'استعرض واطلب منتجاتنا المطبوعة الجاهزة مع خدمة التوصيل السريع.' : 'Browse and order our luxury print items with fast delivery.'}</p>
        </div>

        <div className="portal-banner-feature print-banner">
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

      {/* 2. Categories Section */}
      <section id="categories-section" className="portal-section theme-alt-bg">
        <div className="portal-section-header">
          <span className="section-eyebrow">CATEGORIES</span>
          <h2>{isRtl ? 'تصنيفات المطبوعات المتاحة' : 'Printing Categories'}</h2>
        </div>

        <div className="portal-grid-4">
          {printCategories.map((c) => (
            <div key={c.id} className="portal-card-box">
              <div className="card-top-icon">
                <Printer size={28} />
                <span className="card-tag">{c.badge}</span>
              </div>
              <h3>{c.title_ar}</h3>
              <p>{c.desc_ar}</p>
              <Link to="/printing-products" className="card-link-btn">
                <span>{isRtl ? 'طلب الآن' : 'Order Now'}</span>
                {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Custom Printing Requests */}
      <section id="custom-section" className="portal-section">
        <div className="portal-section-header">
          <span className="section-eyebrow">CUSTOM PRINTING</span>
          <h2>{isRtl ? 'طلب طباعة بمواصفات مخصصة' : 'Custom Printing Request'}</h2>
          <p>{isRtl ? 'هل لديك مقاسات أو خامات خاصة؟ اطلب طباعة مخصصة وسننفذها لك بالتفصيل.' : 'Have specific dimensions or materials? Request custom specs.'}</p>
        </div>

        <div className="portal-banner-feature">
          <div className="feature-info">
            <span className="feature-tag">✨ تنفيذ خاص</span>
            <h3>ارفع ملفك أو تصميمك وسنتكفل بالباقي</h3>
            <p>نقبل ملفات PDF عالية الدقة، PSD، وAI لجميع الأحجام والمقاسات التخصصية.</p>
            <Link to="/printing-products" className="btn-portal-primary print-btn" style={{ display: 'inline-flex', marginTop: '16px' }}>
              <span>ارفع ملفك واطلب الآن</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Track Order Section */}
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
