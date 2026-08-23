import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Grid, List } from 'lucide-react';
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

const ProductStoreCard = ({ prod, onOrder, viewMode = 'grid' }) => {
  let imagesList = [];
  if (Array.isArray(prod.image_urls)) {
    imagesList = prod.image_urls.filter(Boolean);
  } else if (typeof prod.image_urls === 'string') {
    try {
      const parsed = JSON.parse(prod.image_urls);
      if (Array.isArray(parsed)) imagesList = parsed.filter(Boolean);
      else if (prod.image_urls) imagesList = [prod.image_urls];
    } catch {
      if (prod.image_urls) imagesList = [prod.image_urls];
    }
  }

  const [activeIdx, setActiveIdx] = useState(0);
  const currentImg = imagesList[activeIdx] || imagesList[0] || '';

  // LIST VIEW LAYOUT (تصميم القائمة الأفقي: الصورة ع اليمين، الاسم والوصف بالوسط، السعر وتحته زر الطلب ع اليسار)
  if (viewMode === 'list') {
    return (
      <div className="grad-pkg-card-list" style={{ width: '100%', boxSizing: 'border-box', background: 'linear-gradient(145deg, rgba(42, 18, 38, 0.92) 0%, rgba(18, 9, 17, 0.96) 100%)', border: '1.5px solid rgba(245, 189, 26, 0.3)', borderRadius: '16px', overflow: 'hidden', display: 'flex', gap: '12px', padding: '12px', alignItems: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.4)', flexWrap: 'wrap' }}>
        {/* 1. RIGHT SIDE: Product Image */}
        <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
          {currentImg ? (
            <img src={currentImg} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '1.4rem' }}>🖼️</div>
          )}

          {imagesList.length > 1 && (
            <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0, 0, 0, 0.85)', color: '#FFFFFF', padding: '2px 6px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: '800' }}>
              📸 {imagesList.length}
            </span>
          )}
        </div>

        {/* 2. MIDDLE: Name, Category, Description */}
        <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#FFFFFF', margin: 0, lineHeight: '1.3' }}>
            {prod.name}
          </h3>

          {prod.category && (
            <span style={{ display: 'inline-block', color: '#F5BD1A', fontSize: '0.74rem', fontWeight: '800' }}>
              🏷️ {prod.category}
            </span>
          )}

          {prod.description && (
            <p style={{ fontSize: '0.8rem', color: 'rgba(236, 235, 231, 0.75)', margin: '2px 0 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {prod.description}
            </p>
          )}

          {prod.custom_notes && (
            <span style={{ fontSize: '0.72rem', color: 'rgba(245, 189, 26, 0.85)' }}>
              💡 {prod.custom_notes}
            </span>
          )}
        </div>

        {/* 3. LEFT SIDE: Price + Order Button underneath */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '8px', flexShrink: 0, minWidth: '110px' }}>
          <div style={{ fontSize: '1.25rem', color: '#F5BD1A', fontWeight: '900' }}>
            {prod.price} JOD
          </div>

          <button
            type="button"
            className="grad-pkg-btn"
            onClick={() => onOrder(prod)}
            style={{ background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)', color: '#120911', fontWeight: '900', border: 'none', borderRadius: '50px', padding: '7px 14px', fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(245, 189, 26, 0.25)' }}
          >
            طلب المنتج 🛒
          </button>
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT (منتجين جنب بعض - Compact 2-column grid card)
  return (
    <div className="grad-pkg-card" style={{ background: 'linear-gradient(145deg, rgba(42, 18, 38, 0.92) 0%, rgba(18, 9, 17, 0.96) 100%)', border: '1.5px solid rgba(245, 189, 26, 0.3)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}>
      {/* Image Display */}
      <div style={{ position: 'relative', width: '100%', background: '#000' }}>
        {currentImg ? (
          <img src={currentImg} alt={prod.name} style={{ width: '100%', height: '145px', objectFit: 'cover', display: 'block', transition: 'all 0.3s ease' }} />
        ) : (
          <div style={{ width: '100%', height: '145px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '1.8rem' }}>🖼️</div>
        )}

        {/* Category Tag Badge */}
        {prod.category && (
          <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(18, 9, 17, 0.88)', backdropFilter: 'blur(6px)', color: '#F5BD1A', border: '1px solid rgba(245, 189, 26, 0.4)', padding: '2px 8px', borderRadius: '50px', fontSize: '0.68rem', fontWeight: '900' }}>
            🏷️ {prod.category}
          </span>
        )}

        {/* Multi-Image Indicator Counter Badge */}
        {imagesList.length > 1 && (
          <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)', color: '#FFFFFF', padding: '2px 6px', borderRadius: '50px', fontSize: '0.68rem', fontWeight: '800' }}>
            📸 {activeIdx + 1}/{imagesList.length}
          </span>
        )}
      </div>

      {/* Multi-Image Interactive Thumbnails Swatch Bar */}
      {imagesList.length > 1 && (
        <div style={{ display: 'flex', gap: '4px', padding: '4px 8px', background: 'rgba(18, 9, 17, 0.95)', borderBottom: '1px solid rgba(245, 189, 26, 0.15)', overflowX: 'auto' }}>
          {imagesList.map((imgUrl, i) => (
            <img
              key={i}
              src={imgUrl}
              alt={`thumb-${i}`}
              onClick={() => setActiveIdx(i)}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '4px',
                objectFit: 'cover',
                cursor: 'pointer',
                border: activeIdx === i ? '2px solid #F5BD1A' : '1px solid rgba(255,255,255,0.2)',
                opacity: activeIdx === i ? 1 : 0.65,
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            />
          ))}
        </div>
      )}

      {/* Compact Card Content */}
      <div className="grad-pkg-body" style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '0.96rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 4px', lineHeight: '1.3' }}>
            {prod.name}
          </h3>
          <div style={{ fontSize: '1.15rem', color: '#F5BD1A', fontWeight: '900', marginBottom: '6px' }}>
            {prod.price} JOD
          </div>
          {prod.description && (
            <p style={{ fontSize: '0.78rem', color: 'rgba(236, 235, 231, 0.75)', lineHeight: '1.4', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {prod.description}
            </p>
          )}
        </div>

        <button
          type="button"
          className="grad-pkg-btn"
          onClick={() => onOrder(prod)}
          style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)', color: '#120911', fontWeight: '900', border: 'none', borderRadius: '50px', padding: '8px 12px', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(245, 189, 26, 0.25)' }}
        >
          طلب المنتج 🛒
        </button>
      </div>
    </div>
  );
};

const PrintingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // Product for ordering modal
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (2 per row) | 'list' (horizontal cards)

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

  const categoriesList = ['الكل', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="grad-page" dir="rtl" style={{ minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section className="grad-hero" style={{ paddingBottom: '30px' }}>
        <div className="grad-hero-badge">🖨️ آيرس — المطبوعات والتطريز</div>
        <h1>منتجات الطباعة والتصميم المخصصة</h1>
        <p>استكشف منتجات المطبوعات والهدايا ووشاحات التخرج، وارفع تصميمك الخاص لنقوم بطباعته لك.</p>
      </section>

      {/* Category Pills & Search Filter Control Bar */}
      <section className="portal-section" style={{ paddingTop: '0', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '1150px', margin: '0 auto' }}>
          
          {/* Search Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(24, 12, 23, 0.95)', border: '1.5px solid rgba(245, 189, 26, 0.3)', borderRadius: '50px', padding: '8px 20px', boxShadow: '0 6px 20px rgba(0,0,0,0.4)' }}>
            <span style={{ fontSize: '1.1rem', color: '#F5BD1A' }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم المنتج، وشاح، بوستر..."
              style={{ background: 'none', border: 'none', color: '#FFFFFF', outline: 'none', width: '100%', fontSize: '0.92rem', fontWeight: '700' }}
            />
            <span style={{ fontSize: '0.8rem', color: '#F5BD1A', fontWeight: '800', background: 'rgba(245, 189, 26, 0.12)', padding: '4px 12px', borderRadius: '50px', whiteSpace: 'nowrap' }}>
              {filteredProducts.length} منتج
            </span>
          </div>

          {/* Category Bar + View Mode Switcher Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Category Pills Bar */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', flex: 1, minWidth: '240px' }}>
              {categoriesList.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '50px',
                      border: isActive ? '2px solid #F5BD1A' : '1px solid rgba(255, 255, 255, 0.18)',
                      background: isActive ? 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)' : 'rgba(42, 18, 38, 0.85)',
                      color: isActive ? '#120911' : '#FFFFFF',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.25s ease',
                      boxShadow: isActive ? '0 4px 14px rgba(245, 189, 26, 0.3)' : 'none'
                    }}
                  >
                    {cat === 'الكل' ? '🛒 الجميع' : cat}
                  </button>
                );
              })}
            </div>

            {/* Layout Mode Toggle (Icon Only) */}
            <div style={{ display: 'inline-flex', gap: '2px', background: 'rgba(18, 9, 17, 0.95)', padding: '3px', borderRadius: '50px', border: '1.5px solid rgba(245, 189, 26, 0.35)', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="عرض شبكي (منتجين جنب بعض)"
                style={{
                  padding: '7px 14px',
                  borderRadius: '50px',
                  border: 'none',
                  background: viewMode === 'grid' ? 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)' : 'transparent',
                  color: viewMode === 'grid' ? '#120911' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <Grid size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="عرض قائمة أفقي"
                style={{
                  padding: '7px 14px',
                  borderRadius: '50px',
                  border: 'none',
                  background: viewMode === 'list' ? 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)' : 'transparent',
                  color: viewMode === 'list' ? '#120911' : '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <List size={18} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Grid / List of products */}
      <section className="grad-section" style={{ paddingTop: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#F5BD1A' }}>⏳ جاري تحميل الكتالوج...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(18, 9, 17, 0.95)', border: '1px solid rgba(245, 189, 26, 0.3)', borderRadius: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛍️</div>
            <h3 style={{ fontWeight: 'bold', color: '#FFFFFF' }}>لا تتوفر منتجات مطابقة لهذا البحث/التصنيف حالياً.</h3>
            <p style={{ color: '#F5BD1A' }}>جرب التصفح ضمن تصنيف آخر أو طلب طباعة مخصصة.</p>
          </div>
        ) : (
          <div className="grad-packages-grid" style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(165px, 1fr))' : '1fr', gap: viewMode === 'grid' ? '14px' : '16px' }}>
            {filteredProducts.map((prod) => (
              <ProductStoreCard key={prod.id} prod={prod} onOrder={openOrderModal} viewMode={viewMode} />
            ))}
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
