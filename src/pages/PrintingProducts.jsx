import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase, uploadFile } from '../lib/supabase';
import '../styles/graduation.css'; // Leverage shared premium styling variables

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
          .eq('is_hidden', false);
        if (error) throw error;
        if (data) setProducts(data);
      } catch (e) {
        console.error('Failed to load printing products:', e);
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
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '16px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛍️</div>
            <h3 style={{ fontWeight: 'bold', color: '#333' }}>لا تتوفر منتجات حالياً في هذا القسم.</h3>
            <p style={{ color: '#777' }}>يرجى زيارتنا لاحقاً.</p>
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
                <div key={prod.id} className="grad-pkg-card" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {firstImg ? (
                    <img src={firstImg} alt={prod.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '2rem' }}>🖼️</div>
                  )}

                  <div className="grad-pkg-body" style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifycontent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--g-purple, #6F246F)', margin: '0 0 8px' }}>
                        {prod.name}
                      </h3>
                      <div style={{ fontSize: '1.4rem', color: 'var(--g-green, #0F5A46)', fontWeight: '900', marginBottom: '10px' }}>
                        {prod.price} JOD
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: '1.6', marginBottom: '16px' }}>{prod.description}</p>
                      
                      {prod.custom_notes && (
                        <div style={{ fontSize: '0.82rem', background: '#fcf8e3', color: '#8a6d3b', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px', borderRight: '3px solid #f0ad4e' }}>
                          💡 {prod.custom_notes}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="grad-pkg-btn"
                      onClick={() => openOrderModal(prod)}
                      style={{ marginTop: 'auto', background: 'var(--g-purple, #6F246F)' }}
                    >
                      طلب المنتج الآن
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Backdrop / Dialog */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
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
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeOrderModal}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#aaa'
              }}
            >
              ✕
            </button>

            {orderPlaced ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '4rem' }}>✅</span>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--g-green, #0F5A46)', margin: '16px 0 8px' }}>تم تقديم طلبك بنجاح!</h3>
                <p style={{ color: '#555', marginBottom: '24px' }}>سيتواصل معك فريق استديو آيرس عبر الواتساب لمراجعة طلبك وإتمام التوصيل أو الاستلام.</p>
                <button
                  onClick={closeOrderModal}
                  className="grad-pkg-btn"
                  style={{ background: 'var(--g-purple, #6F246F)', width: 'auto', padding: '10px 32px' }}
                >
                  حسناً
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--g-purple, #6F246F)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #eee' }}>
                  طلب منتج: {selectedProduct.name}
                </h3>

                <div className="grad-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="grad-field">
                    <label className="grad-label">الاسم بالكامل *</label>
                    <input
                      type="text"
                      className="grad-input"
                      required
                      placeholder="أدخل اسمك بالكامل للتسليم"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="grad-field">
                    <label className="grad-label">رقم الهاتف / واتساب *</label>
                    <input
                      type="tel"
                      className="grad-input"
                      required
                      placeholder="07xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Delivery Selection */}
                  <div style={{ marginTop: '10px' }}>
                    <label className="grad-label" style={{ marginBottom: '8px', display: 'block' }}>طريقة الاستلام والتوصيل</label>
                    <div className="delivery-cards-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div
                        className={`delivery-card ${!deliverySelected ? 'selected' : ''}`}
                        onClick={() => setDeliverySelected(false)}
                        style={{
                          background: '#fff',
                          border: !deliverySelected ? '2px solid var(--g-purple, #6E267B)' : '1px solid #ccc',
                          borderRadius: '8px',
                          padding: '10px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '1.2rem' }}>🏬</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>الاستلام من الاستوديو</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>مجاناً</div>
                      </div>
                      <div
                        className={`delivery-card ${deliverySelected ? 'selected' : ''}`}
                        onClick={() => setDeliverySelected(true)}
                        style={{
                          background: '#fff',
                          border: deliverySelected ? '2px solid var(--g-purple, #6E267B)' : '1px solid #ccc',
                          borderRadius: '8px',
                          padding: '10px',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '1.2rem' }}>🚚</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>توصيل للمنزل</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>+2 JOD</div>
                      </div>
                    </div>

                    {deliverySelected && (
                      <div className="delivery-info-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fcfcfc', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <div className="grad-field">
                          <label className="grad-label">عنوان التوصيل بالتفصيل *</label>
                          <textarea
                            className="grad-textarea"
                            style={{ minHeight: '60px' }}
                            required
                            placeholder="المحافظة، المنطقة، اسم الشارع، وأي معالم قريبة..."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                          />
                        </div>
                        <div className="grad-field">
                          <label className="grad-label">رقم هاتف بديل (اختياري)</label>
                          <input
                            type="tel"
                            className="grad-input"
                            placeholder="رقم للتواصل عند التوصيل..."
                            value={alternativePhone}
                            onChange={(e) => setAlternativePhone(e.target.value)}
                          />
                        </div>
                        <div className="grad-field">
                          <label className="grad-label">موقع خرائط جوجل (اختياري)</label>
                          <input
                            type="text"
                            className="grad-input"
                            placeholder="رابط موقعك على خرائط جوجل..."
                            value={googleMapsLink}
                            onChange={(e) => setGoogleMapsLink(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedProduct.color_selection_enabled && selectedProduct.available_colors && selectedProduct.available_colors.length > 0 && (
                    <div className="grad-field">
                      <label className="grad-label">اختر اللون</label>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {selectedProduct.available_colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '20px',
                              border: selectedColor === color ? 'none' : '1px solid #ccc',
                              background: selectedColor === color ? 'var(--g-green, #0F5A46)' : '#fff',
                              color: selectedColor === color ? '#fff' : '#333',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.85rem'
                            }}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grad-field">
                    <label className="grad-label">الكمية المطلوبة</label>
                    <div className="qty-control" style={{ display: 'flex', alignItems: 'center', width: 'fit-content', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                      <button type="button" className="qty-btn" onClick={() => handleSetQuantity(quantity - 1)} style={{ padding: '6px 14px', background: '#eee', border: 'none', cursor: 'pointer' }}>−</button>
                      <span style={{ padding: '6px 20px', fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                      <button type="button" className="qty-btn" onClick={() => handleSetQuantity(quantity + 1)} style={{ padding: '6px 14px', background: '#eee', border: 'none', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>

                  <div className="grad-field">
                    <label className="grad-label">صور وتصاميم للطباعة (اختياري)</label>
                    <div
                      className="grad-upload-zone"
                      style={{ padding: '14px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px', cursor: 'pointer' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span>📎 انقر هنا لرفع الصور المخصصة للطباعة</span>
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
                            <img src={src} alt="uploaded-preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
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
                                width: '16px',
                                height: '16px',
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
                    <label className="grad-label">ملاحظات وتعليمات الطباعة</label>
                    <textarea
                      className="grad-textarea"
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
                    className="grad-pkg-btn"
                    disabled={submittingOrder}
                    style={{ background: 'var(--g-green, #0F5A46)', flex: 1 }}
                  >
                    {submittingOrder ? '⏳ جاري تقديم الطلب...' : 'إرسال الطلب الآن'}
                  </button>
                  <button
                    type="button"
                    onClick={closeOrderModal}
                    className="grad-pkg-btn"
                    style={{ background: '#f5f5f5', color: '#333', flex: 1 }}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default PrintingProducts;
