import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Grid, List, ShoppingCart, Plus, Minus, Trash2, X, CheckCircle, ArrowRight, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase, uploadFile } from '../lib/supabase';
import { getNextOrderNumber } from '../lib/orderUtils';
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

const ProductStoreCard = ({ prod, onOrder, onAddToCart, viewMode = 'grid' }) => {
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

  // LIST VIEW LAYOUT (أفقي مدمج: الصورة ع اليمين، الاسم والوصف بالوسط، السعر وأزرار السلة/الطلب ع أقصى اليسار)
  if (viewMode === 'list') {
    return (
      <div className="grad-pkg-card-list" style={{ width: '100%', boxSizing: 'border-box', background: 'linear-gradient(145deg, rgba(42, 18, 38, 0.92) 0%, rgba(18, 9, 17, 0.96) 100%)', border: '1.5px solid rgba(245, 189, 26, 0.3)', borderRadius: '16px', overflow: 'hidden', display: 'flex', gap: '10px', padding: '10px 12px', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 6px 20px rgba(0,0,0,0.4)' }}>
        {/* 1. RIGHT SIDE: Product Image */}
        <div style={{ position: 'relative', width: '85px', height: '85px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
          {currentImg ? (
            <img src={currentImg} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '1.2rem' }}>🖼️</div>
          )}

          {imagesList.length > 1 && (
            <span style={{ position: 'absolute', bottom: '3px', right: '3px', background: 'rgba(0, 0, 0, 0.85)', color: '#FFFFFF', padding: '1px 5px', borderRadius: '50px', fontSize: '0.62rem', fontWeight: '800' }}>
              📸 {imagesList.length}
            </span>
          )}
        </div>

        {/* 2. MIDDLE: Name, Category, Description */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: '900', color: '#FFFFFF', margin: 0, lineHeight: '1.25' }}>
            {prod.name}
          </h3>

          {prod.category && (
            <span style={{ display: 'inline-block', color: '#F5BD1A', fontSize: '0.7rem', fontWeight: '800' }}>
              🏷️ {prod.category}
            </span>
          )}

          {prod.description && (
            <p style={{ fontSize: '0.76rem', color: 'rgba(236, 235, 231, 0.75)', margin: '1px 0 0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {prod.description}
            </p>
          )}
        </div>

        {/* 3. FAR LEFT SIDE: Price + Add to Cart & Direct Order Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', flexShrink: 0 }}>
          <div style={{ fontSize: '1.1rem', color: '#F5BD1A', fontWeight: '900', lineHeight: '1' }}>
            {prod.price} JOD
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(prod);
              }}
              title="إضافة للسلة"
              style={{
                height: '34px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontWeight: '800',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '10px',
                padding: '0 10px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <span>+ السلة 🛒</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOrder(prod);
              }}
              title="طلب مباشر مخصص"
              style={{
                height: '34px',
                background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)',
                color: '#120911',
                fontWeight: '900',
                border: 'none',
                borderRadius: '10px',
                padding: '0 10px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(245, 189, 26, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>طلب ⚡</span>
            </button>
          </div>
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
      <div className="grad-pkg-body" style={{ padding: '10px 12px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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

        {/* Buttons Grid Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: 'auto', paddingTop: '6px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(prod);
            }}
            style={{
              height: '36px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              fontWeight: '800',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '10px',
              padding: '0 4px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            <span>+ السلة 🛒</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOrder(prod);
            }}
            style={{
              height: '36px',
              background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)',
              color: '#120A11',
              fontWeight: '900',
              border: 'none',
              borderRadius: '10px',
              padding: '0 4px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(245, 189, 26, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>طلب ⚡</span>
          </button>
        </div>
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

  // Shopping Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('iris_print_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartCheckoutOpen, setIsCartCheckoutOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('iris_print_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Cart Functions
  const handleAddToCart = (prod, chosenColor = '', qty = 1, itemNotes = '', itemPreviews = []) => {
    let firstImg = '';
    if (itemPreviews && itemPreviews.length > 0) {
      firstImg = itemPreviews[0];
    } else if (Array.isArray(prod.image_urls) && prod.image_urls.length > 0) {
      firstImg = prod.image_urls[0];
    } else if (typeof prod.image_urls === 'string') {
      try {
        const parsed = JSON.parse(prod.image_urls);
        if (Array.isArray(parsed) && parsed.length > 0) firstImg = parsed[0];
        else firstImg = prod.image_urls;
      } catch {
        firstImg = prod.image_urls;
      }
    }

    const color = chosenColor || (Array.isArray(prod.available_colors) && prod.available_colors.length > 0 ? prod.available_colors[0] : '');

    setCart(prev => {
      const idx = prev.findIndex(item => item.id === prod.id && item.selectedColor === color);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + qty,
          itemNotes: itemNotes || updated[idx].itemNotes
        };
        return updated;
      } else {
        return [...prev, {
          cartItemId: `${prod.id}-${color || 'def'}-${Date.now()}`,
          id: prod.id,
          name: prod.name,
          price: Number(prod.price) || 0,
          image: firstImg,
          category: prod.category || '',
          selectedColor: color,
          quantity: qty,
          itemNotes: itemNotes
        }];
      }
    });

    showToast(`✅ تم إضافة "${prod.name}" إلى السلة!`);
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cliq'); // 'cliq' | 'cod'

  // Custom design uploads
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedInvoiceData, setPlacedInvoiceData] = useState(null);
  const [showDirectOrderFields, setShowDirectOrderFields] = useState(false);

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
    setPlacedInvoiceData(null);
    setOrderPlaced(false);
    setShowDirectOrderFields(false);
    setPaymentMethod('cliq');
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
      let itemsSummary = '';

      if (selectedProduct.id === 'cart_checkout') {
        const itemsStr = cart.map((item, i) => `${i + 1}. ${item.name} (عدد ${item.quantity}) ${item.selectedColor ? `[لون: ${item.selectedColor}]` : ''}`).join(' | ');
        finalNotes = `[طلب سلة شريحة متعددة (${totalCartCount} منتجات)]\nعناصر السلة: ${itemsStr}\n${finalNotes}`;
        itemsSummary = cart.map((item, i) => `${i + 1}️⃣ *${item.name}* (عدد ${item.quantity}) ${item.selectedColor ? `- اللون: ${item.selectedColor}` : ''} - (السعر: ${item.price * item.quantity} JOD)`).join('\n');
      } else {
        itemsSummary = `1️⃣ *${selectedProduct.name}* (عدد ${quantity}) ${selectedColor ? `- اللون: ${selectedColor}` : ''} - (السعر: ${(Number(selectedProduct.price) || 0) * quantity} JOD)`;
      }

      if (deliverySelected) {
        finalNotes = `[طلب توصيل]\nالعنوان: ${deliveryAddress}\nهاتف بديل: ${alternativePhone || 'لا يوجد'}\nخرائط قوقل: ${googleMapsLink || 'لا يوجد'}\n\n${finalNotes}`;
      } else {
        finalNotes = `[استلام من الاستوديو]\n${finalNotes}`;
      }

      const payLabel = paymentMethod === 'cliq' ? '[دفع عبر CliQ 📱]' : '[الدفع عند الاستلام 💵]';
      finalNotes = `${payLabel}\n${finalNotes}`;

      let calculatedProductName = selectedProduct.name;
      if (selectedProduct.id === 'cart_checkout' && cart && cart.length > 0) {
        calculatedProductName = cart.map(item => `${item.name}${item.selectedColor ? ` [${item.selectedColor}]` : ''} (×${item.quantity})`).join(' + ');
      }

      const cartItemsStructured = selectedProduct.id === 'cart_checkout' && cart
        ? cart.map((item, idx) => ({
            id: `item-${idx}`,
            name: item.name,
            selectedColor: item.selectedColor || '',
            quantity: item.quantity,
            price: item.price,
            image: item.image || ''
          }))
        : [{
            id: 'item-single',
            name: selectedProduct.name,
            selectedColor: selectedColor || '',
            quantity: quantity,
            price: Number(selectedProduct.price) || 0,
            image: ''
          }];

      const generatedOrderNum = getNextOrderNumber('ORD');
      const newOrderObj = {
        id: generatedOrderNum,
        order_number: generatedOrderNum,
        product_id: selectedProduct.id,
        product_name: calculatedProductName,
        cart_items: cartItemsStructured,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        notes: finalNotes,
        image_urls: uploadedUrls,
        quantity: selectedProduct.id === 'cart_checkout' ? totalCartCount : quantity,
        selected_color: selectedColor || (selectedProduct.id === 'cart_checkout' ? 'سلة متعددة' : ''),
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // 1. Try Supabase insert
      try {
        await supabase
          .from('printing_orders')
          .insert({
            product_id: newOrderObj.product_id,
            product_name: newOrderObj.product_name,
            customer_name: newOrderObj.customer_name,
            phone: newOrderObj.phone,
            notes: newOrderObj.notes,
            image_urls: newOrderObj.image_urls,
            quantity: newOrderObj.quantity,
            selected_color: newOrderObj.selected_color,
            status: newOrderObj.status
          });
      } catch (dbErr) {
        console.warn('Supabase printing_orders table log warning:', dbErr);
      }

      // 2. Always sync to localStorage fallback for Admin Dashboard
      try {
        const existingLocal = localStorage.getItem('iris_printing_orders');
        const parsedLocal = existingLocal ? JSON.parse(existingLocal) : [];
        localStorage.setItem('iris_printing_orders', JSON.stringify([newOrderObj, ...parsedLocal]));
      } catch (lErr) {
        console.error(lErr);
      }

      const finalPrice = selectedProduct.id === 'cart_checkout' 
        ? totalCartPrice + (deliverySelected ? 2 : 0) 
        : (Number(selectedProduct.price) || 0) * quantity + (deliverySelected ? 2 : 0);

      const invoiceData = {
        invoiceNo: generatedOrderNum,
        date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        customerName: customerName.trim(),
        phone: phone.trim(),
        deliverySelected,
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod,
        paymentStatus: paymentMethod === 'cliq' ? '📱 تم الدفع عبر CliQ' : '💵 الدفع نقداً عند الاستلام',
        cardMasked: '',
        items: selectedProduct.id === 'cart_checkout' ? [...cart] : [{
          cartItemId: selectedProduct.id,
          name: selectedProduct.name,
          selectedColor: selectedColor,
          quantity: quantity,
          price: Number(selectedProduct.price) || 0
        }],
        totalPrice: finalPrice,
        uploadedImagesCount: uploadedUrls.length,
        notes: notes.trim()
      };

      setPlacedInvoiceData(invoiceData);
      if (selectedProduct.id === 'cart_checkout') clearCart();
      setOrderPlaced(true);
    } catch (err) {
      alert('حدث خطأ أثناء تقديم الطلب: ' + err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const [savingImage, setSavingImage] = useState(false);

  const handleSaveInvoiceImage = async () => {
    if (!placedInvoiceData) return;
    setSavingImage(true);

    try {
      // 1. Create high-resolution HD Canvas (2x scale for 1280x1040 HD export)
      const canvas = document.createElement('canvas');
      const width = 640;
      const height = 575;
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);

      // 2. Dark Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#261124');
      bgGrad.addColorStop(1, '#120911');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Gold Outer Card Border
      ctx.beginPath();
      ctx.strokeStyle = '#F5BD1A';
      ctx.lineWidth = 2.5;
      ctx.roundRect(14, 14, width - 28, height - 28, 16);
      ctx.stroke();

      // 4. Header: Centered Brand Title & Subtitle
      ctx.direction = 'rtl';
      ctx.textAlign = 'center';

      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillStyle = '#F5BD1A';
      ctx.fillText('آيرس — المطبوعات والتطريز 🖨️', width / 2, 48);

      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('فاتورة طلب إلكترونية مؤكدة', width / 2, 68);

      // Order Badge Box (Centered Box)
      ctx.beginPath();
      ctx.fillStyle = 'rgba(245, 189, 26, 0.12)';
      ctx.strokeStyle = '#F5BD1A';
      ctx.lineWidth = 1.5;
      ctx.roundRect((width - 240) / 2, 80, 240, 54, 12);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.fillStyle = '#F5BD1A';
      ctx.fillText('رقم الأوردر (Order Number)', width / 2, 98);

      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`#${placedInvoiceData.invoiceNo}`, width / 2, 122);

      // 5. Divider Line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(245, 189, 26, 0.3)';
      ctx.lineWidth = 1;
      ctx.moveTo(32, 146);
      ctx.lineTo(width - 32, 146);
      ctx.stroke();

      // 6. Customer Details Box
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(245, 189, 26, 0.25)';
      ctx.lineWidth = 1;
      ctx.roundRect(32, 158, width - 64, 140, 12);
      ctx.fill();
      ctx.stroke();

      ctx.direction = 'rtl';
      ctx.textAlign = 'right';

      const details = [
        { label: '👤 اسم الزبون:', val: placedInvoiceData.customerName || 'عميل آيرس', y: 184 },
        { label: '📞 رقم التواصل:', val: placedInvoiceData.phone || 'غير مدخل', y: 212 },
        { label: '🚚 طريقة التسليم:', val: placedInvoiceData.deliverySelected ? `توصيل (${placedInvoiceData.deliveryAddress})` : 'استلام من المحل', y: 240 },
        { label: '💳 وسيلة الدفع:', val: placedInvoiceData.paymentStatus || 'نقداً', y: 268 }
      ];

      details.forEach((d) => {
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.fillStyle = '#F5BD1A';
        ctx.fillText(d.label, width - 50, d.y);

        ctx.font = '13px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(d.val, width - 165, d.y);
      });

      // 7. Products List
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillStyle = '#F5BD1A';
      ctx.fillText('🛍️ المنتجات المطلوبة:', width - 32, 322);

      let currentY = 348;
      placedInvoiceData.items.forEach((item) => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(18, 9, 17, 0.95)';
        ctx.strokeStyle = 'rgba(245, 189, 26, 0.2)';
        ctx.lineWidth = 1;
        ctx.roundRect(32, currentY - 18, width - 64, 36, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        const colorTxt = item.selectedColor ? ` [اللون: ${item.selectedColor}]` : '';
        ctx.fillText(`${item.name}${colorTxt} (×${item.quantity})`, width - 50, currentY + 4);

        ctx.textAlign = 'left';
        ctx.font = 'bold 14px Arial, sans-serif';
        ctx.fillStyle = '#F5BD1A';
        ctx.fillText(`${item.price * item.quantity} JOD`, 50, currentY + 4);
        ctx.textAlign = 'right';

        currentY += 44;
      });

      // 8. Total Summary Banner
      const totalY = Math.max(currentY + 6, 455);
      const totalGrad = ctx.createLinearGradient(32, totalY, width - 32, totalY);
      totalGrad.addColorStop(0, '#F5BD1A');
      totalGrad.addColorStop(1, '#D49D0E');

      ctx.beginPath();
      ctx.fillStyle = totalGrad;
      ctx.roundRect(32, totalY, width - 64, 46, 12);
      ctx.fill();

      ctx.font = 'bold 16px Arial, sans-serif';
      ctx.fillStyle = '#120911';
      ctx.fillText('المجموع الكلي النهائي:', width - 52, totalY + 28);

      ctx.textAlign = 'left';
      ctx.font = 'bold 19px Arial, sans-serif';
      ctx.fillText(`${placedInvoiceData.totalPrice} JOD`, 52, totalY + 29);

      // Download PNG
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `فاتورة_أوردر_${placedInvoiceData.invoiceNo}.png`;
      link.click();

      setToast('📸 تم حفظ صورة الفاتورة في المعرض بنجاح!');
      setTimeout(() => setToast(''), 4000);
    } catch (err) {
      console.error(err);
      alert('تعذر حفظ الصورة: ' + err.message);
    } finally {
      setSavingImage(false);
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
      <section className="grad-hero no-print" style={{ paddingBottom: '30px' }}>
        <div className="grad-hero-badge">🖨️ آيرس — المطبوعات والتطريز</div>
        <h1>منتجات الطباعة والتصميم المخصصة</h1>
        <p>استكشف منتجات المطبوعات والهدايا ووشاحات التخرج، وارفع تصميمك الخاص لنقوم بطباعته لك.</p>
      </section>

      {/* Category Pills & Search Filter Control Bar */}
      <section className="portal-section no-print" style={{ paddingTop: '0', paddingBottom: '20px' }}>
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
      <section className="grad-section no-print" style={{ paddingTop: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#F5BD1A' }}>⏳ جاري تحميل الكتالوج...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: 'rgba(18, 9, 17, 0.95)', border: '1px solid rgba(245, 189, 26, 0.3)', borderRadius: '20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛍️</div>
            <h3 style={{ fontWeight: 'bold', color: '#FFFFFF' }}>لا تتوفر منتجات مطابقة لهذا البحث/التصنيف حالياً.</h3>
            <p style={{ color: '#F5BD1A' }}>جرب التصفح ضمن تصنيف آخر أو طلب طباعة مخصصة.</p>
          </div>
        ) : (
          <div className={`grad-packages-grid ${viewMode === 'list' ? 'list-mode' : ''}`} style={{ display: viewMode === 'list' ? 'flex' : 'grid', flexDirection: viewMode === 'list' ? 'column' : undefined, gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(165px, 1fr))' : undefined, gap: viewMode === 'grid' ? '14px' : '16px', width: '100%' }}>
            {filteredProducts.map((prod) => (
              <ProductStoreCard key={prod.id} prod={prod} onOrder={openOrderModal} onAddToCart={handleAddToCart} viewMode={viewMode} />
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
                className="no-print"
                onClick={closeOrderModal}
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
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
                  justifyContent: 'center',
                  zIndex: 99
                }}
              >
                ✕
              </button>

              {orderPlaced && placedInvoiceData ? (
                <div className="invoice-print-area" style={{ color: '#FFFFFF', padding: '6px 0 0', width: '100%', boxSizing: 'border-box' }}>
                  
                  {/* Top Centered Header & Standalone Order Number Banner */}
                  <div style={{ textAlign: 'center', borderBottom: '1.5px dashed rgba(245, 189, 26, 0.4)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#F5BD1A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span>🖨️</span>
                      <span>آيرس — المطبوعات والتطريز</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px', fontWeight: '600' }}>
                      فاتورة طلب إلكترونية مؤكدة
                    </div>

                    {/* Clean Centered Standalone Order Number Banner */}
                    <div style={{ marginTop: '10px', background: 'rgba(245, 189, 26, 0.12)', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid rgba(245, 189, 26, 0.4)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#F5BD1A', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        رقم الأوردر (Order Number)
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#FFFFFF', letterSpacing: '1px', lineHeight: '1.15', margin: '2px 0' }}>
                        #{placedInvoiceData.invoiceNo}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.75)' }}>
                        التاريخ: {placedInvoiceData.date}
                      </div>
                    </div>
                  </div>

                  {/* Compact Customer & Delivery Info Grid */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '10px 12px', marginBottom: '12px', border: '1px solid rgba(245, 189, 26, 0.25)', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div>👤 <strong>الزبون:</strong> <span style={{ color: '#FFFFFF', fontWeight: '800' }}>{placedInvoiceData.customerName}</span></div>
                      <div>📞 <strong>التواصل:</strong> <span dir="ltr" style={{ color: '#FFFFFF', fontWeight: '800' }}>{placedInvoiceData.phone}</span></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '5px' }}>
                      <div>🚚 <strong>التسليم:</strong> <span style={{ color: '#FFFFFF' }}>{placedInvoiceData.deliverySelected ? `توصيل (${placedInvoiceData.deliveryAddress})` : 'استلام من المحل'}</span></div>
                      <div>💳 <strong>الدفع:</strong> <span style={{ color: '#F5BD1A', fontWeight: '800' }}>{placedInvoiceData.paymentStatus}</span></div>
                    </div>

                    {placedInvoiceData.uploadedImagesCount > 0 && (
                      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '5px', fontSize: '0.78rem', color: '#F5BD1A' }}>
                        🖼️ <strong>مرفقات:</strong> تم رفع {placedInvoiceData.uploadedImagesCount} صور مخصصة
                      </div>
                    )}
                  </div>

                  {/* Products Table (Compact) */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.82rem', color: '#F5BD1A', marginBottom: '6px', fontWeight: '900' }}>
                      🛍️ المنتجات المطلوبة ({placedInvoiceData.items.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '130px', overflowY: 'auto' }}>
                      {placedInvoiceData.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18, 9, 17, 0.95)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(245, 189, 26, 0.2)', fontSize: '0.82rem' }}>
                          <div>
                            <span style={{ fontWeight: '800', color: '#FFFFFF' }}>{item.name}</span>
                            {item.selectedColor && <span style={{ fontSize: '0.74rem', color: '#F5BD1A', marginRight: '6px' }}>[{item.selectedColor}]</span>}
                            <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.6)', marginRight: '6px' }}>×{item.quantity}</span>
                          </div>
                          <span style={{ fontWeight: '900', color: '#F5BD1A', fontSize: '0.92rem' }}>
                            {item.price * item.quantity} JOD
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Summary Box */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(65, 22, 60, 0.9) 0%, rgba(32, 12, 30, 0.95) 100%)', border: '1.5px solid rgba(245, 189, 26, 0.45)', borderRadius: '12px', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '900', fontSize: '0.96rem', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)', marginBottom: '12px' }}>
                    <span style={{ color: '#FFFFFF' }}>المجموع الكلي النهائي:</span>
                    <span style={{ fontSize: '1.25rem', color: '#F5BD1A', textShadow: '0 2px 8px rgba(245, 189, 26, 0.3)' }}>{placedInvoiceData.totalPrice} JOD</span>
                  </div>

                  {/* Action Buttons Row (Side by side full width) */}
                  <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        flex: 1,
                        height: '44px',
                        background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)',
                        color: '#120911',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 6px 18px rgba(245, 189, 26, 0.35)',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <span>طباعة الفاتورة 🖨️</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveInvoiceImage}
                      disabled={savingImage}
                      title="حفظ الفاتورة كصورة في معرض الصور بالجهاز"
                      style={{
                        flex: 1,
                        height: '44px',
                        background: 'linear-gradient(135deg, rgba(245, 189, 26, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        color: '#F5BD1A',
                        border: '1.5px solid rgba(245, 189, 26, 0.5)',
                        borderRadius: '12px',
                        fontWeight: '900',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <Download size={15} color="#F5BD1A" />
                      <span>{savingImage ? '⏳ جاري الحفظ...' : 'حفظ بالمعرض 📸'}</span>
                    </button>
                  </div>

                  <div className="no-print" style={{ fontSize: '0.72rem', color: '#F5BD1A', textAlign: 'center', marginTop: '8px', opacity: 0.85 }}>
                    💡 احفظ رقم الأوردر (#{placedInvoiceData.invoiceNo}) لمتابعة وتتبع طلبك في قسم "تتبع الطلب".
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#F5BD1A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🛍️</span>
                    <span>{selectedProduct.id === 'cart_checkout' ? 'إتمام طلب سلة التسوق' : `طلب منتج: ${selectedProduct.name}`}</span>
                  </h3>

                  {/* Cart Items Summary List inside Checkout Modal */}
                  {selectedProduct.id === 'cart_checkout' && (
                    <div style={{ background: 'rgba(18, 9, 17, 0.95)', border: '1px solid rgba(245, 189, 26, 0.3)', borderRadius: '14px', padding: '12px 14px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#F5BD1A', marginBottom: '8px' }}>المنتجات في السلة ({totalCartCount}):</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                        {cart.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#E0E0E0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span>{item.name} (×{item.quantity}) {item.selectedColor ? `[${item.selectedColor}]` : ''}</span>
                            <span style={{ color: '#F5BD1A', fontWeight: '800' }}>{item.price * item.quantity} JOD</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '0.92rem', color: '#F5BD1A' }}>
                        <span>المجموع الكلي:</span>
                        <span>{totalCartPrice} JOD</span>
                      </div>
                    </div>
                  )}

                  <div className="grad-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Single Product Customization Fields */}
                    {selectedProduct.id !== 'cart_checkout' && (
                      <>
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
                            style={{ minHeight: '70px' }}
                            placeholder="مثال: يرجى كتابة اسم الطالب: (أحمد) على الوشاح وتطريزه باللون الذهبي..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {/* Customer & Delivery Details Fields (Only shown during Cart Checkout OR when customer explicitly requests Direct Order) */}
                    {(selectedProduct.id === 'cart_checkout' || showDirectOrderFields) && (
                      <div style={{ borderTop: selectedProduct.id !== 'cart_checkout' ? '1px dashed rgba(245, 189, 26, 0.3)' : 'none', paddingTop: selectedProduct.id !== 'cart_checkout' ? '14px' : '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                        <div>
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

                        {/* Payment Method Selection */}
                        <div style={{ marginTop: '6px', borderTop: '1px dashed rgba(245, 189, 26, 0.3)', paddingTop: '14px' }}>
                          <label className="as-label" style={{ marginBottom: '10px', display: 'block', fontWeight: 'bold', color: '#F5BD1A' }}>اختر طريقة الدفع *</label>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                            {/* CliQ Option */}
                            <div
                              onClick={() => setPaymentMethod('cliq')}
                              style={{
                                background: paymentMethod === 'cliq' ? 'rgba(245, 189, 26, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                border: paymentMethod === 'cliq' ? '2px solid #F5BD1A' : '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '12px',
                                padding: '12px 8px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                boxShadow: paymentMethod === 'cliq' ? '0 4px 15px rgba(245, 189, 26, 0.25)' : 'none'
                              }}
                            >
                              <div style={{ fontSize: '1.4rem' }}>📱</div>
                              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#FFFFFF', marginTop: '4px' }}>تحويل CliQ</div>
                              <div style={{ fontSize: '0.74rem', color: '#F5BD1A' }}>محافظ إلكترونية</div>
                            </div>

                            {/* COD Option */}
                            <div
                              onClick={() => setPaymentMethod('cod')}
                              style={{
                                background: paymentMethod === 'cod' ? 'rgba(245, 189, 26, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                border: paymentMethod === 'cod' ? '2px solid #F5BD1A' : '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: '12px',
                                padding: '12px 8px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                boxShadow: paymentMethod === 'cod' ? '0 4px 15px rgba(245, 189, 26, 0.25)' : 'none'
                              }}
                            >
                              <div style={{ fontSize: '1.4rem' }}>💵</div>
                              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#FFFFFF', marginTop: '4px' }}>عند الاستلام</div>
                              <div style={{ fontSize: '0.74rem', color: '#F5BD1A' }}>دفع نقدي</div>
                            </div>
                          </div>

                          {/* CliQ Details Form */}
                          {paymentMethod === 'cliq' && (
                            <div style={{ background: 'rgba(245, 189, 26, 0.08)', border: '1px solid rgba(245, 189, 26, 0.3)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
                              <div style={{ fontWeight: 'bold', color: '#F5BD1A', fontSize: '0.9rem' }}>📱 تفاصيل التحويل عبر CliQ</div>
                              <div style={{ fontSize: '0.84rem', color: '#FFFFFF', margin: '8px 0', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                الاسم المستعار (Alias): <strong style={{ color: '#F5BD1A', fontSize: '0.98rem' }}>IRISSTUDIO</strong>
                                <br />
                                أو رقم الهاتف: <strong style={{ color: '#F5BD1A' }}>0797303260</strong>
                              </div>
                              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>يرجى التحويل بقيمة المبلغ وحفظ رقم المرجع أو الصورة لتأكيد الطلب.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                    {selectedProduct.id !== 'cart_checkout' && !showDirectOrderFields && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddToCart(selectedProduct, selectedColor, quantity, notes, imagesPreviews);
                            closeOrderModal();
                            setIsCartOpen(true);
                          }}
                          style={{
                            width: '100%',
                            height: '48px',
                            background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)',
                            color: '#120911',
                            fontWeight: '900',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '0.96rem',
                            cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(245, 189, 26, 0.35)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>إضافة هذا المنتج إلى السلة 🛒</span>
                        </button>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setShowDirectOrderFields(true)}
                            style={{
                              flex: 2,
                              height: '46px',
                              background: 'rgba(245, 189, 26, 0.15)',
                              color: '#F5BD1A',
                              fontWeight: '900',
                              border: '1.5px solid rgba(245, 189, 26, 0.4)',
                              borderRadius: '12px',
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <span>أو طلب مباشر فوراً ⚡</span>
                          </button>

                          <button
                            type="button"
                            onClick={closeOrderModal}
                            style={{
                              flex: 1,
                              height: '46px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: '#FFFFFF',
                              fontWeight: '800',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '12px',
                              fontSize: '0.88rem',
                              cursor: 'pointer'
                            }}
                          >
                            إغلاق
                          </button>
                        </div>
                      </div>
                    )}

                    {(selectedProduct.id === 'cart_checkout' || showDirectOrderFields) && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="submit"
                          disabled={submittingOrder}
                          style={{
                            flex: 2,
                            height: '48px',
                            background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)',
                            color: '#120A11',
                            fontWeight: '900',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '0.92rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 6px 20px rgba(245, 189, 26, 0.35)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {submittingOrder 
                            ? '⏳ جاري إرسال الطلب...' 
                            : (selectedProduct.id === 'cart_checkout' ? 'تأكيد الطلب وإصدار الفاتورة 🚀' : 'إرسال طلب مباشر ⚡')
                          }
                        </button>

                        <button
                          type="button"
                          onClick={closeOrderModal}
                          style={{
                            flex: 1,
                            height: '48px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#FFFFFF',
                            fontWeight: '800',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          إلغاء
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)', color: '#120911', fontWeight: '900', padding: '12px 24px', borderRadius: '50px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
          {toast}
        </div>
      )}

      {/* Floating Cart Trigger Button */}
      {totalCartCount > 0 && (
        <div
          onClick={() => setIsCartOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)',
            color: '#120911',
            fontWeight: '900',
            padding: '12px 20px',
            borderRadius: '50px',
            boxShadow: '0 8px 30px rgba(245, 189, 26, 0.45)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '2px solid #FFFFFF',
            transition: 'all 0.25s ease'
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={22} />
            <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: '#120911', color: '#F5BD1A', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.75rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {totalCartCount}
            </span>
          </div>
          <span style={{ fontSize: '0.95rem' }}>سلة التسوق ({totalCartCount})</span>
          <span style={{ background: 'rgba(18, 9, 17, 0.2)', padding: '3px 10px', borderRadius: '50px', fontSize: '0.88rem' }}>
            {totalCartPrice} JOD
          </span>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setIsCartOpen(false)}>
          <div style={{ width: '100%', maxWidth: '440px', background: 'linear-gradient(180deg, rgba(32, 14, 30, 0.98) 0%, rgba(18, 9, 17, 0.99) 100%)', height: '100%', borderRight: '1.5px solid rgba(245, 189, 26, 0.35)', display: 'flex', flexDirection: 'column', padding: '24px', boxShadow: '-10px 0 40px rgba(0,0,0,0.8)', boxSizing: 'border-box' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(245, 189, 26, 0.2)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={24} color="#F5BD1A" />
                <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>سلة التسوق ({totalCartCount})</h2>
              </div>
              <button type="button" onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* Cart Items List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.6)' }}>
                  <ShoppingCart size={48} color="#F5BD1A" style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <h3 style={{ color: '#FFFFFF', fontWeight: '800' }}>سلة التسوق فارغة حالياً</h3>
                  <p style={{ fontSize: '0.88rem' }}>تصفح منتجاتنا وأضف ما يعجبك إلى السلة!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245, 189, 26, 0.2)', borderRadius: '14px', padding: '12px', alignItems: 'center' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ color: '#FFFFFF', margin: '0 0 4px', fontSize: '0.92rem', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </h4>
                      {item.selectedColor && (
                        <span style={{ fontSize: '0.72rem', color: '#F5BD1A', background: 'rgba(245, 189, 26, 0.12)', padding: '2px 8px', borderRadius: '50px', display: 'inline-block', marginBottom: '4px' }}>
                          اللون: {item.selectedColor}
                        </span>
                      )}
                      <div style={{ color: '#F5BD1A', fontWeight: '900', fontSize: '0.9rem' }}>
                        {item.price * item.quantity} JOD
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '50px', padding: '3px 8px', border: '1px solid rgba(255,255,255,0.15)' }}>
                      <button type="button" onClick={() => updateCartQty(item.cartItemId, -1)} style={{ background: 'none', border: 'none', color: '#F5BD1A', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ color: '#FFFFFF', fontWeight: '900', fontSize: '0.85rem', minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button type="button" onClick={() => updateCartQty(item.cartItemId, 1)} style={{ background: 'none', border: 'none', color: '#F5BD1A', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button type="button" onClick={() => removeFromCart(item.cartItemId)} style={{ background: 'rgba(231, 76, 60, 0.15)', border: 'none', color: '#E74C3C', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {cart.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(245, 189, 26, 0.2)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: '700' }}>المجموع الكلي:</span>
                  <span style={{ color: '#F5BD1A', fontSize: '1.4rem', fontWeight: '900' }}>{totalCartPrice} JOD</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setSelectedProduct({ id: 'cart_checkout', name: `سلة التسوق (${totalCartCount} منتجات)`, price: totalCartPrice });
                  }}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #F5BD1A 0%, #D49D0E 100%)', color: '#120911', fontWeight: '900', border: 'none', borderRadius: '50px', padding: '14px', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(245, 189, 26, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <span>إتمام طلب السلة ({totalCartCount} منتجات) 🚀</span>
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  style={{ background: 'none', border: 'none', color: 'rgba(231, 76, 60, 0.8)', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  تفريغ السلة بالكامل 🗑️
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
};

export default PrintingProducts;
