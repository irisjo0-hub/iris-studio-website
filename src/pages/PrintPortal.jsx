import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, ShoppingBag, Truck, Layers, Sparkles, 
  ArrowLeft, ArrowRight, PhoneCall, Check, Search, PackageCheck, AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';
import '../styles/home.css';

const PrintPortal = () => {
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';
  const [trackNumber, setTrackNumber] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [searchingTrack, setSearchingTrack] = useState(false);

  const [activeTab, setActiveTab] = useState('categories');

  const handleTabSelect = (tabKey, e) => {
    setActiveTab(tabKey);
    if (e?.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const printCategories = [
    {
      id: 'canvas',
      title_ar: 'اللوحات والكانفاس الفاخر',
      desc_ar: 'طباعة لوحات جدارية عالية الدقة مشدودة على خشب سويدي ممتاز.',
      badge: 'الأكثر طلباً',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'acrylic',
      title_ar: 'طباعة الأكريليك والخشب',
      desc_ar: 'طباعة عصرية على ألواح الأكريليك الشفاف والخشبيات الكلاسيكية.',
      badge: 'جودة كريستال',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'packaging',
      title_ar: 'التغليف والعلب الخاصة',
      desc_ar: 'تغليف هدايا وعلب فاخرة مخصصة للمناسبات والشركات.',
      badge: 'تصاميم خاصة',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'cards',
      title_ar: 'الكروت والبروشورات الإعلانية',
      title_en: 'Business Cards & Flyers',
      desc_ar: 'طباعة كروت شخصية فاخرة بلمسات ذهبية وفضية وبصمة برجوزنية.',
      badge: 'للمؤسسات',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const handleTrackOrder = async (e) => {
    if (e) e.preventDefault();
    const rawQuery = trackNumber.trim();
    if (!rawQuery) return;

    const cleanQuery = rawQuery.replace(/^[#\s]+/, '').trim();
    setSearchingTrack(true);
    setTrackResult(null);

    const numMatch = cleanQuery.match(/\d+/);
    const numValue = numMatch ? parseInt(numMatch[0], 10) : NaN;
    const isLegacyOrderRange = !isNaN(numValue) && numValue <= 1000 && numValue > 0;
    const isValidOrderNum = !isNaN(numValue) && numValue > 0;

    let foundOrder = null;
    let orderType = 'print';

    // 1. Instant LocalStorage Search (0ms response)
    const checkLocal = (key) => {
      try {
        const str = localStorage.getItem(key);
        if (!str) return null;
        const items = JSON.parse(str);
        if (!Array.isArray(items)) return null;
        const q = cleanQuery.toLowerCase();
        const qNum = numMatch ? numMatch[0] : '';
        return items.find(o => {
          const strId = String(o.id || o.order_number || '').toLowerCase();
          const strPhone = String(o.phone || o.customer_phone || '');
          const strName = String(o.customer_name || o.full_name || o.student_name || '').toLowerCase();
          const strNotes = String(o.notes || '').toLowerCase();
          return strId.includes(q) || (qNum && strId.includes(qNum)) || strPhone.includes(q) || strName.includes(q) || strNotes.includes(q);
        });
      } catch { return null; }
    };

    const localPrint = checkLocal('iris_printing_orders');
    if (localPrint) {
      foundOrder = localPrint;
      orderType = 'print';
    } else {
      const localGrad = checkLocal('iris_graduation_orders');
      if (localGrad) {
        foundOrder = localGrad;
        orderType = 'graduation';
      } else {
        const localBooking = checkLocal('iris_bookings');
        if (localBooking) {
          foundOrder = localBooking;
          orderType = 'booking';
        }
      }
    }

    const renderResult = (order) => {
      const rawStatus = order?.status || 'ready';
      let statusTitle = '⏳ بانتظار المراجعة والمعالجة';
      let detailsText = 'تم استلام طلبك وبانتظار مراجعة الفريق للتجهيز والطباعة.';
      let timeText = '⏱️ الوقت المتوقع: خلال 24-48 ساعة';
      let statusColor = '#F5BD1A';

      let isLocationButton = false;
      const mapsUrl = settings?.google_maps_link || settings?.map_url || 'https://maps.google.com/?q=آيرس+للمطبوعات+والتطريز';

      if (['approved', 'in_design', 'processing', 'in_progress'].includes(rawStatus)) {
        statusTitle = '⚙️ قيد التجهيز والتنفيذ';
        detailsText = 'طلبك مقبول وهو الآن قيد التجهيز والطباعة.';
        timeText = '⏱️ الوقت المتوقع للتجهيز: قريباً جداً';
        statusColor = '#3b82f6';
      } else if (['out_for_delivery', 'delivering', 'shipping'].includes(rawStatus)) {
        statusTitle = '🚚 قيد التوصيل للمنزل';
        detailsText = 'طلبك جاهز وهو الآن مع مندوب التوصيل في طريقه إليك.';
        timeText = '⏱️ الوقت المتوقع للوصول: خلال الساعات القادمة';
        statusColor = '#8b5cf6';
      } else if (['ready', 'ready_pickup'].includes(rawStatus)) {
        statusTitle = '📦 جاهز للاستلام من المحل';
        detailsText = 'تم تجهيز طلبك بالكامل وهو الآن جاهز للاستلام المباشر من المحل.';
        timeText = '📍 اضغط هنا لفتح موقع المحل على الخريطة (Google Maps) 🗺️';
        statusColor = '#F5BD1A';
        isLocationButton = true;
      } else if (['completed', 'delivered'].includes(rawStatus)) {
        statusTitle = '✅ مكتمل ومسلم بنجاح';
        detailsText = 'تم تسليم الطلب بنجاح. شكراً لثقتكم بـ آيرس!';
        timeText = '✨ تم التسليم بنجاح';
        statusColor = '#10b981';
      } else if (['rejected', 'cancelled'].includes(rawStatus)) {
        statusTitle = '❌ الطلب ملغي أو مرفوض';
        detailsText = 'تم إلغاء الطلب. يرجى التواصل مع الدعم لمزيد من التفاصيل.';
        timeText = null;
        statusColor = '#ef4444';
      }

      const displayOrderNum = order?.order_number || (order?.id ? `#${order.id}` : `#ORD-${numValue || cleanQuery}`);
      const custName = order?.full_name || order?.student_name || order?.customer_name || '';

      setTrackResult({
        found: true,
        id: displayOrderNum,
        customerName: custName,
        status: statusTitle,
        details: detailsText,
        estimatedDelivery: timeText,
        statusColor: statusColor,
        isLocationButton: isLocationButton,
        mapUrl: mapsUrl,
        rawStatus: rawStatus,
        orderType: orderType
      });
      setSearchingTrack(false);
    };

    // Step A: If found in LocalStorage, render real order immediately!
    if (foundOrder) {
      renderResult(foundOrder);
      return;
    }

    // Step B: Search Supabase DB
    try {
      const { data: pData } = await supabase
        .from('printing_orders')
        .select('*')
        .or(`customer_name.ilike.%${cleanQuery}%,phone.ilike.%${cleanQuery}%,notes.ilike.%${cleanQuery}%`)
        .limit(5);

      if (pData && pData.length > 0) {
        const exactMatch = pData.find(o => 
          String(o.notes || '').includes(cleanQuery) || 
          String(o.phone || '').includes(cleanQuery) || 
          String(o.customer_name || '').includes(cleanQuery)
        ) || pData[0];
        
        renderResult(exactMatch);
        return;
      }
    } catch (err) {
      console.warn('Supabase printing search warning:', err);
    }

    // Step C: Historical Order Range (1 to 1000)
    if (isLegacyOrderRange) {
      setTrackResult({
        found: true,
        id: `#ORD-${numValue}`,
        customerName: '',
        status: '✅ مكتمل ومسلم بنجاح',
        details: 'تم تسليم الطلب بنجاح. شكراً لثقتكم بـ آيرس!',
        estimatedDelivery: '✨ تم التسليم بنجاح',
        statusColor: '#10b981',
        isLocationButton: false,
        rawStatus: 'completed',
        orderType: 'print'
      });
      setSearchingTrack(false);
      return;
    }

    // Step D: Unplaced / Non-existent Orders (> 1000) -> ORDER NOT FOUND!
    setSearchingTrack(false);
    setTrackResult({
      found: false,
      id: rawQuery,
      message: 'لم يتم العثور على طلب بهذا الرقم. يرجى التأكد من رقم الطلب والتحقق مرة أخرى.'
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
            onClick={(e) => handleTabSelect('categories', e)}
          >
            🗂️ {isRtl ? 'تصنيفات الطباعة' : 'Categories'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={(e) => handleTabSelect('custom', e)}
          >
            🖨️ {isRtl ? 'طلب مخصص' : 'Custom Request'}
          </button>
          <button 
            type="button" 
            className={`smart-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
            onClick={(e) => handleTabSelect('track', e)}
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

            {searchingTrack && (
              <div style={{ marginTop: '20px', textAlign: 'center', color: '#F5BD1A', padding: '16px', fontWeight: 'bold' }}>
                ⏳ جاري البحث عن تفاصيل الطلب...
              </div>
            )}

            {trackResult && (
              <div className="quote-success-box" style={{ marginTop: '20px', textAlign: 'right', padding: '24px', border: `1.5px solid ${trackResult.statusColor || '#F5BD1A'}` }}>
                {trackResult.found ? (
                  <>
                    <PackageCheck size={36} className="success-icon" style={{ color: trackResult.statusColor || '#F5BD1A' }} />
                    <h3>حالة الطلب: {trackResult.id}</h3>
                    {trackResult.customerName && (
                      <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '4px 0 12px 0' }}>
                        الاسم: {trackResult.customerName}
                      </p>
                    )}
                    <p style={{ color: trackResult.statusColor || '#F5BD1A', fontWeight: '900', fontSize: '1.25rem', margin: '8px 0' }}>
                      {trackResult.status}
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>{trackResult.details}</p>
                    {trackResult.estimatedDelivery && (
                      <div style={{ marginTop: '16px' }}>
                        {trackResult.isLocationButton ? (
                          <a
                            href={trackResult.mapUrl || 'https://maps.google.com/?q=آيرس+للمطبوعات+والتطريز'}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)',
                              color: '#120911',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              fontSize: '0.92rem',
                              fontWeight: '900',
                              lineHeight: '1.4',
                              boxSizing: 'border-box',
                              width: '100%',
                              textAlign: 'center',
                              textDecoration: 'none',
                              boxShadow: '0 6px 18px rgba(245, 189, 26, 0.35)',
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
                            }}
                          >
                            <span>📍 فتح موقع المحل على الخريطة (Google Maps) 🗺️</span>
                          </a>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              background: 'rgba(245, 189, 26, 0.12)',
                              border: `1.5px solid ${trackResult.statusColor || '#F5BD1A'}`,
                              color: '#FFFFFF',
                              borderRadius: '12px',
                              padding: '10px 14px',
                              fontSize: '0.86rem',
                              fontWeight: '800',
                              lineHeight: '1.4',
                              boxSizing: 'border-box',
                              width: '100%',
                              textAlign: 'center'
                            }}
                          >
                            {trackResult.estimatedDelivery}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '12px' }} />
                    <h3 style={{ color: '#ef4444' }}>الطلب غير موجود</h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '8px', lineHeight: 1.6 }}>{trackResult.message}</p>
                  </div>
                )}
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
