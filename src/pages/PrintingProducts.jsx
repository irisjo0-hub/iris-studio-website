import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase, uploadFile } from '../lib/supabase';
import '../styles/graduation.css'; // Leverage shared premium styling variables

const getColorStyle = (colorName, isSelected) => {
  const name = String(colorName || '').trim().toLowerCase();

  let bgGradient = 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)';
  let textColor = '#120911';
  let borderColor = '#F5BD1A';
  let dotColor = '#F5BD1A';

  if (name.includes('أحمر') || name.includes('red') || name.includes('عنابي') || name.includes('نبيذي') || name.includes('خمري')) {
    bgGradient = 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)';
    textColor = '#FFFFFF';
    borderColor = '#FF6B6B';
    dotColor = '#E74C3C';
  } else if (name.includes('أسود') || name.includes('black') || name.includes('فاخر')) {
    bgGradient = 'linear-gradient(135deg, #2B1828 0%, #000000 100%)';
    textColor = '#FFFFFF';
    borderColor = '#F5BD1A';
    dotColor = '#000000';
  } else if (name.includes('أبيض') || name.includes('white')) {
    bgGradient = 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)';
    textColor = '#120911';
    borderColor = '#FFFFFF';
    dotColor = '#FFFFFF';
  } else if (name.includes('كحلي') || name.includes('أزرق') || name.includes('blue') || name.includes('navy')) {
    bgGradient = 'linear-gradient(135deg, #1B3A4B 0%, #061A23 100%)';
    textColor = '#FFFFFF';
    borderColor = '#4EA8DE';
    dotColor = '#4EA8DE';
  } else if (name.includes('أخضر') || name.includes('green') || name.includes('زيتي')) {
    bgGradient = 'linear-gradient(135deg, #2ECC71 0%, #1E824C 100%)';
    textColor = '#FFFFFF';
    borderColor = '#2ECC71';
    dotColor = '#2ECC71';
  } else if (name.includes('أصفر') || name.includes('ذهب') || name.includes('gold') || name.includes('yellow')) {
    bgGradient = 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)';
    textColor = '#120911';
    borderColor = '#F5BD1A';
    dotColor = '#F5BD1A';
  } else if (name.includes('وردي') || name.includes('زهري') || name.includes('pink')) {
    bgGradient = 'linear-gradient(135deg, #FF75A0 0%, #D63447 100%)';
    textColor = '#FFFFFF';
    borderColor = '#FF75A0';
    dotColor = '#FF75A0';
  } else if (name.includes('رمادي') || name.includes('فضي') || name.includes('grey') || name.includes('silver')) {
    bgGradient = 'linear-gradient(135deg, #7F8C8D 0%, #34495E 100%)';
    textColor = '#FFFFFF';
    borderColor = '#BDC3C7';
    dotColor = '#7F8C8D';
  }

  if (isSelected) {
    return {
      style: {
        padding: '8px 18px',
        borderRadius: '50px',
        border: `2px solid ${borderColor}`,
        background: bgGradient,
        color: textColor,
        cursor: 'pointer',
        fontWeight: '900',
        fontSize: '0.9rem',
        transition: 'all 0.25s ease',
        boxShadow: `0 6px 20px rgba(0,0,0,0.6), 0 0 12px ${borderColor}80`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        transform: 'scale(1.04)'
      },
      dotColor
    };
  }

  return {
    style: {
      padding: '8px 18px',
      borderRadius: '50px',
      border: `1.5px solid ${borderColor}60`,
      background: 'rgba(255, 255, 255, 0.07)',
      color: '#FFFFFF',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '0.88rem',
      transition: 'all 0.25s ease',
      boxShadow: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    dotColor
  };
};

const DEFAULT_PRODUCTS = [
  {
    id: 'default-1',
    name: 'وشاح تخرج مطرز فاخر 2026',
    price: 15,
    category: 'أوشحة وطواقي',
    description: 'وشاح تخرج ستان فاخر مع تطريز اسم الطالب وسنة التخرج بأرقام وخيوط قصب ذهبية متينة.',
    available_colors: ['أسود', 'كحلي', 'عنابي', 'أبيض'],
    color_selection_enabled: true,
    custom_notes: 'يرجى كتابة الاسم المراد تطريزه والسنة في ملاحظات الطلب.',
    image_urls: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'],
    is_hidden: false
  },
  {
    id: 'default-2',
    name: 'بوستر أكريليك شفاف عالي الدقة A3',
    price: 22,
    category: 'بوسترات',
    description: 'طباعة حرارية مباشرة على لوح أكريليك شفاف فاخر مقاس A3 مع قواعد تثبيت معدنية.',
    available_colors: [],
    color_selection_enabled: false,
    custom_notes: 'قم برفع صورتك بدقة عالية لضمان أفضل جودة طباعة.',
    image_urls: ['https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'],
    is_hidden: false
  },
  {
    id: 'default-3',
    name: 'كوب سيراميك مطبوع مخصص',
    price: 6,
    category: 'هدايا ومطبوعات',
    description: 'كوب سيراميك فاخر مقاوم لغسالات الصحون مع طباعة حرارية ملونة لصورتك أو تصميمك.',
    available_colors: ['أبيض', 'أسود حراري'],
    color_selection_enabled: true,
    custom_notes: 'يرجى ارفاق التصميم المطلوب طباعته على الكوب.',
    image_urls: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'],
    is_hidden: false
  },
  {
    id: 'default-4',
    name: 'لوحة كانفاس مشدودة على خشب سويدي',
    price: 35,
    category: 'بوسترات',
    description: 'قماش كانفاس إيطالي فاخر مطبوع بألوان زيتية زاهية ومشدود يدويًا على إطار خشب سويدي.',
    available_colors: [],
    color_selection_enabled: false,
    custom_notes: 'تأتي جاهزة للتعليق الفوري على الحائط.',
    image_urls: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'],
    is_hidden: false
  }
];

const PrintingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // Product for ordering modal

  // Order Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  
  // Delivery details
  const [deliverySelected, setDeliverySelected] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  
  // Custom design uploads
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const fileInputRef = useRef();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('printing_products')
          .select('*')
          .eq('is_hidden', false)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          const local = localStorage.getItem('iris_printing_products');
          if (local) {
            const parsed = JSON.parse(local).filter(p => !p.is_hidden);
            if (parsed.length > 0) {
              setProducts(parsed);
              return;
            }
          }
          setProducts(DEFAULT_PRODUCTS);
        }
      } catch (e) {
        console.error('Failed to load printing products:', e);
        const local = localStorage.getItem('iris_printing_products');
        if (local) {
          const parsed = JSON.parse(local).filter(p => !p.is_hidden);
          if (parsed.length > 0) {
            setProducts(parsed);
            return;
          }
        }
        setProducts(DEFAULT_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const openOrderModal = (prod) => {
    setSelectedProduct(prod);
    setCustomerName('');
    setPhone('');
    setNotes('');
    setQuantity(1);
    setSelectedColor(prod.available_colors && prod.available_colors.length > 0 ? prod.available_colors[0] : '');
    setDeliverySelected(false);
    setDeliveryAddress('');
    setAlternativePhone('');
    setGoogleMapsLink('');
    setImagesPreviews([]);
    setImagesFiles([]);
    setOrderPlaced(false);
  };

  const closeOrderModal = () => {
    setSelectedProduct(null);
  };

  // Image Upload handler
  const handleUploadImages = (e) => {
    const files = Array.from(e.target.files);
    const previews = [];
    const newFiles = [];

    files.forEach(file => {
      newFiles.push(file);
      previews.push(URL.createObjectURL(file));
    });

    setImagesPreviews([...imagesPreviews, ...previews]);
    setImagesFiles([...imagesFiles, ...newFiles]);
  };

  const removeImage = (idx) => {
    setImagesPreviews(imagesPreviews.filter((_, i) => i !== idx));
    setImagesFiles(imagesFiles.filter((_, i) => i !== idx));
  };

  const handleSetQuantity = (val) => {
    setQuantity(Math.max(1, val));
  };

  // Submit printing order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('الرجاء إدخال اسمك بالكامل');
      return;
    }
    if (!phone.trim()) {
      alert('الرجاء إدخال رقم هاتف للتواصل');
      return;
    }
    if (deliverySelected && !deliveryAddress.trim()) {
      alert('الرجاء إدخال عنوان التوصيل بالتفصيل');
      return;
    }

    setSubmittingOrder(true);
    try {
      // Upload design images to storage
      const uploadedUrls = [];
      for (let idx = 0; idx < imagesFiles.length; idx++) {
        const file = imagesFiles[idx];
        const path = `orders-${Date.now()}-${idx}-${file.name}`;
        const url = await uploadFile('graduation-orders', path, file);
        uploadedUrls.push(url);
      }

      let finalNotes = notes.trim();
      if (deliverySelected) {
        finalNotes = `[طلب توصيل]
العنوان: ${deliveryAddress}
هاتف بديل: ${alternativePhone || 'لا يوجد'}
خرائط قوقل: ${googleMapsLink || 'لا يوجد'}

${notes}`;
      } else {
        finalNotes = `[استلام من الاستوديو]
${notes}`;
      }

      const { error } = await supabase
        .from('printing_orders')
        .insert({
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          customer_name: customerName.trim(),
          phone: phone.trim(),
          notes: finalNotes,
          image_urls: uploadedUrls,
          quantity: quantity,
          selected_color: selectedColor,
          status: 'pending'
        });

      if (error) throw error;
      setOrderPlaced(true);
    } catch (err) {
      alert('حدث خطأ أثناء تقديم الطلب: ' + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <main className="grad-page" dir="rtl" style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero */}
      <section className="grad-hero">
        <div className="grad-hero-badge">🎁 IRIS Studio</div>
        <h1>منتجات الطباعة والتصميم المخصصة</h1>
        <p>استكشف منتجات المطبوعات والهدايا ووشاحات التخرج، وارفع تصميمك الخاص لنقوم بطباعته لك.</p>
      </section>

      {/* Grid of products */}
      <section className="grad-section">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem' }}>⏳ جاري تحميل المنتجات...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(18, 9, 17, 0.95)', border: '1px solid rgba(245, 189, 26, 0.3)', borderRadius: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛍️</div>
            <h3 style={{ fontWeight: 'bold', color: '#FFFFFF' }}>جاري تجهيز منتجات إضافية لهذا القسم...</h3>
            <p style={{ color: '#F5BD1A' }}>استكشف المنتجات المميزة المتاحة أعلاه أو طلب طباعة مخصصة.</p>
          </div>
        ) : (
          <div className="grad-packages-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
            {products.map((prod) => {
              let firstImg = '';
              if (Array.isArray(prod.image_urls) && prod.image_urls.length > 0) {
                firstImg = prod.image_urls[0];
              } else if (typeof prod.image_urls === 'string') {
                try {
                  const parsed = JSON.parse(prod.image_urls);
                  if (parsed.length > 0) firstImg = parsed[0];
                } catch {
                  firstImg = prod.image_urls;
                }
              }

              return (
                <div key={prod.id} className="grad-pkg-card" style={{ background: 'linear-gradient(145deg, rgba(42, 18, 38, 0.92) 0%, rgba(18, 9, 17, 0.96) 100%)', border: '1.5px solid rgba(245, 189, 26, 0.3)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
                  {firstImg ? (
                    <img src={firstImg} alt={prod.name} style={{ width: '100%', height: '210px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '210px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '2rem' }}>🖼️</div>
                  )}

                  <div className="grad-pkg-body" style={{ padding: '22px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 8px' }}>
                        {prod.name}
                      </h3>
                      <div style={{ fontSize: '1.4rem', color: '#F5BD1A', fontWeight: '900', marginBottom: '10px' }}>
                        {prod.price} JOD
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(236, 235, 231, 0.8)', lineHeight: '1.6', marginBottom: '16px' }}>{prod.description}</p>
                      
                      {prod.custom_notes && (
                        <div style={{ fontSize: '0.82rem', background: 'rgba(245, 189, 26, 0.1)', color: '#F5BD1A', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid rgba(245, 189, 26, 0.3)' }}>
                          💡 {prod.custom_notes}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="grad-pkg-btn"
                      onClick={() => openOrderModal(prod)}
                      style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)', color: '#120911', fontWeight: '800', border: 'none', borderRadius: '50px', padding: '12px 20px', cursor: 'pointer' }}
                    >
                      طلب المنتج والطباعة 🛒
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Backdrop / Dialog */}
      {selectedProduct && (() => {
        const colorsList = Array.isArray(selectedProduct.available_colors)
          ? selectedProduct.available_colors.flatMap(c => typeof c === 'string' ? c.split(/[,،/\n]+/) : c).map(c => String(c).trim()).filter(Boolean)
          : (typeof selectedProduct.available_colors === 'string' 
              ? selectedProduct.available_colors.split(/[,،/\n]+/).map(c => c.trim()).filter(Boolean) 
              : []);

        return (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '16px'
            }}
            onClick={closeOrderModal}
          >
            <div
              style={{
                background: 'rgba(24, 12, 23, 0.98)',
                border: '1.5px solid #F5BD1A',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '28px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                position: 'relative',
                color: '#FFFFFF'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={closeOrderModal}
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>

              {orderPlaced ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <span style={{ fontSize: '4rem' }}>✅</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#F5BD1A', margin: '16px 0 8px', fontWeight: '900' }}>تم تقديم طلبك بنجاح!</h3>
                  <p style={{ color: 'rgba(236,235,231,0.8)', marginBottom: '24px' }}>سيتواصل معك فريق استديو آيرس عبر الواتساب لمراجعة طلبك وإتمام التوصيل أو الاستلام.</p>
                  <button
                    type="button"
                    onClick={closeOrderModal}
                    className="btn-portal-primary print-btn"
                    style={{ width: 'auto', padding: '10px 32px' }}
                  >
                    حسناً
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder}>
                  <h3 style={{ fontSize: '1.3rem', color: '#F5BD1A', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(245,189,26,0.2)', fontWeight: '900' }}>
                    طلب منتج: {selectedProduct.name}
                  </h3>

                  <div className="grad-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="grad-field">
                      <label className="as-label">الاسم بالكامل *</label>
                      <input
                        type="text"
                        className="admin-input"
                        required
                        placeholder="أدخل اسمك بالكامل للتسليم"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>

                    <div className="grad-field">
                      <label className="as-label">رقم الهاتف / واتساب *</label>
                      <input
                        type="tel"
                        className="admin-input"
                        required
                        placeholder="07xxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        dir="ltr"
                      />
                    </div>

                    {/* Delivery Selection */}
                    <div style={{ marginTop: '6px' }}>
                      <label className="as-label" style={{ marginBottom: '8px', display: 'block' }}>طريقة الاستلام والتوصيل</label>
                      <div className="delivery-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        <div
                          className={`delivery-card ${!deliverySelected ? 'selected' : ''}`}
                          onClick={() => setDeliverySelected(false)}
                          style={{
                            background: !deliverySelected ? 'rgba(245, 189, 26, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: !deliverySelected ? '2px solid #F5BD1A' : '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '1.3rem' }}>🏬</div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.88rem', color: '#FFFFFF' }}>الاستلام من الاستوديو</div>
                          <div style={{ fontSize: '0.78rem', color: '#F5BD1A' }}>مجاناً</div>
                        </div>
                        <div
                          className={`delivery-card ${deliverySelected ? 'selected' : ''}`}
                          onClick={() => setDeliverySelected(true)}
                          style={{
                            background: deliverySelected ? 'rgba(245, 189, 26, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: deliverySelected ? '2px solid #F5BD1A' : '1px solid rgba(255, 255, 255, 0.15)',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '1.3rem' }}>🚚</div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.88rem', color: '#FFFFFF' }}>توصيل للمنزل</div>
                          <div style={{ fontSize: '0.78rem', color: '#F5BD1A' }}>+2 JOD</div>
                        </div>
                      </div>

                      {deliverySelected && (
                        <div className="delivery-info-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(18, 9, 17, 0.8)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(245, 189, 26, 0.2)' }}>
                          <div className="grad-field">
                            <label className="as-label">عنوان التوصيل بالتفصيل *</label>
                            <textarea
                              className="admin-input"
                              style={{ minHeight: '60px' }}
                              required
                              placeholder="المحافظة، المنطقة، اسم الشارع، وأي معالم قريبة..."
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                            />
                          </div>
                          <div className="grad-field">
                            <label className="as-label">رقم هاتف بديل (اختياري)</label>
                            <input
                              type="tel"
                              className="admin-input"
                              placeholder="رقم للتواصل عند التوصيل..."
                              value={alternativePhone}
                              onChange={(e) => setAlternativePhone(e.target.value)}
                              dir="ltr"
                            />
                          </div>
                          <div className="grad-field">
                            <label className="as-label">موقع خرائط جوجل (اختياري)</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="رابط موقعك على خرائط جوجل..."
                              value={googleMapsLink}
                              onChange={(e) => setGoogleMapsLink(e.target.value)}
                              dir="ltr"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {colorsList.length > 0 && (
                      <div className="grad-field">
                        <label className="as-label">اختر اللون المطلوب *</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {colorsList.map((color) => {
                            const isSelected = selectedColor === color;
                            const colorObj = getColorStyle(color, isSelected);

                            return (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                style={colorObj.style}
                              >
                                <span 
                                  style={{ 
                                    width: '10px', 
                                    height: '10px', 
                                    borderRadius: '50%', 
                                    background: colorObj.dotColor, 
                                    border: '1px solid rgba(255,255,255,0.6)', 
                                    flexShrink: 0,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)' 
                                  }} 
                                />
                                <span>{color}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grad-field">
                      <label className="as-label">الكمية المطلوبة</label>
                      <div className="qty-control" style={{ display: 'flex', alignItems: 'center', width: 'fit-content', border: '1px solid rgba(245, 189, 26, 0.4)', borderRadius: '50px', overflow: 'hidden', background: 'rgba(18, 9, 17, 0.9)' }}>
                        <button type="button" className="qty-btn" onClick={() => handleSetQuantity(quantity - 1)} style={{ padding: '8px 16px', background: 'rgba(245, 189, 26, 0.2)', color: '#F5BD1A', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>−</button>
                        <span style={{ padding: '8px 24px', fontWeight: '900', color: '#FFFFFF', minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                        <button type="button" className="qty-btn" onClick={() => handleSetQuantity(quantity + 1)} style={{ padding: '8px 16px', background: 'rgba(245, 189, 26, 0.2)', color: '#F5BD1A', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>+</button>
                      </div>
                    </div>

                    <div className="grad-field">
                      <label className="as-label">صور وتصاميم للطباعة (اختياري)</label>
                      <div
                        className="grad-upload-zone"
                        style={{ padding: '16px', textAlign: 'center', border: '1px dashed #F5BD1A', borderRadius: '12px', cursor: 'pointer', background: 'rgba(245, 189, 26, 0.05)' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <span style={{ color: '#F5BD1A', fontWeight: 'bold' }}>📎 انقر هنا لرفع الصور المخصصة للطباعة</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleUploadImages}
                          style={{ display: 'none' }}
                        />
                      </div>

                      {imagesPreviews.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                          {imagesPreviews.map((src, i) => (
                            <div key={i} style={{ position: 'relative', width: '60px', height: '60px' }}>
                              <img src={src} alt="uploaded-preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(245, 189, 26, 0.4)' }} />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  right: '-4px',
                                  background: 'red',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  fontSize: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grad-field">
                      <label className="as-label">ملاحظات وتعليمات الطباعة والتطريز</label>
                      <textarea
                        className="admin-input"
                        style={{ minHeight: '80px' }}
                        placeholder="مثال: يرجى كتابة اسم الطالب: (أحمد) على الوشاح وتطريزه باللون الذهبي..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="btn-portal-primary print-btn"
                      style={{ flex: 1, padding: '12px' }}
                    >
                      {submittingOrder ? '⏳ جاري تقديم الطلب...' : 'إرسال طلب الطباعة والتأكيد 🚀'}
                    </button>
                    <button
                      type="button"
                      onClick={closeOrderModal}
                      className="btn-portal-secondary"
                      style={{ flex: 1, padding: '12px' }}
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}
    </main>
  );
};

export default PrintingProducts;
