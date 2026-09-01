/* src/repositories/flowRepository.js
 * Repository for IRIS Flow items and Flow Feedback moderation system.
 * Backed by LocalStorage / IndexedDB with default 8 initial service items.
 */

import heroMediaImg from '../assets/hero.png';

const FLOW_STORAGE_KEY = 'iris_flow_items';
const FEEDBACK_STORAGE_KEY = 'iris_flow_feedback';

export const INITIAL_FLOW_ITEMS = [
  {
    id: 'flow-01',
    enabled: true,
    sort_order: 1,
    slug: 'media',
    category_key: 'MEDIA',
    category_label_ar: 'ميديا',
    category_label_en: 'MEDIA',
    image: heroMediaImg,
    alt_ar: 'إنتاج ميديا سينمائي',
    alt_en: 'Cinematic Media Production',
    headline_ar: 'نصنع قصصًا بصريـة تترك أثرًا سينمائيًا لا يُنسى',
    headline_en: 'Crafting Visual Stories with Unforgettable Impact',
    secondary_text_ar: 'إنتاج الفيديوهات الإعلانية والوثائقية بأحدث التقنيات السينمائية.',
    secondary_text_en: 'High-end commercial & documentary video production.',
    overlay_style: 'editorial',
    overlay_position: 'bottom-left',
    cta_label_ar: 'اطلب عرضًا لمشروعك',
    cta_label_en: 'Request Project Proposal',
    cta_url: '/work',
    cta_icon_type: 'project',
    feedback_enabled: true,
    focal_x: 50,
    focal_y: 50
  },
  {
    id: 'flow-02',
    enabled: true,
    sort_order: 2,
    slug: 'product-photography',
    category_key: 'PRODUCT_PHOTOGRAPHY',
    category_label_ar: 'تصوير المنتجات',
    category_label_en: 'PRODUCT PHOTOGRAPHY',
    image: heroMediaImg,
    alt_ar: 'تصوير منتجات احترافي',
    alt_en: 'Professional Product Photography',
    headline_ar: 'إبراز تفاصيل منتجك بأعلى معايير الإضاءة والدقة',
    headline_en: 'Showcasing Product Details with Studio Lighting Mastery',
    secondary_text_ar: 'تصوير إعلاني وتجاري يرفع من قيمة العلامة التجارية.',
    secondary_text_en: 'Commercial imagery elevating brand perception.',
    overlay_style: 'hotspot',
    overlay_position: 'center-left',
    cta_label_ar: 'احجز تصوير منتجك',
    cta_label_en: 'Book Product Session',
    cta_url: '/product-photography',
    cta_icon_type: 'camera',
    feedback_enabled: true,
    focal_x: 50,
    focal_y: 50
  },
  {
    id: 'flow-03',
    enabled: true,
    sort_order: 3,
    slug: 'studio',
    category_key: 'STUDIO',
    category_label_ar: 'الاستديو',
    category_label_en: 'STUDIO',
    image: heroMediaImg,
    alt_ar: 'تصوير استوديو بورتريـه',
    alt_en: 'Studio Portrait Photography',
    headline_ar: 'تجربة تصوير استوديو مخصصة تخلد أجمل لحظاتك',
    headline_en: 'Tailored Studio Portrait Experience Preserving Moments',
    secondary_text_ar: 'إضاءة احترافية وخلفيات متعددة تناسب كل الشخصيات.',
    secondary_text_en: 'Master lighting and background atmospheres.',
    overlay_style: 'glass',
    overlay_position: 'bottom-left',
    cta_label_ar: 'احجز جلستك',
    cta_label_en: 'Book Studio Session',
    cta_url: '/booking',
    cta_icon_type: 'calendar',
    feedback_enabled: true,
    focal_x: 50,
    focal_y: 50
  },
  {
    id: 'flow-04',
    enabled: true,
    sort_order: 4,
    slug: 'outdoor-photography',
    category_key: 'OUTDOOR_PHOTOGRAPHY',
    category_label_ar: 'التصوير الخارجي',
    category_label_en: 'OUTDOOR PHOTOGRAPHY',
    image: heroMediaImg,
    alt_ar: 'جلسات تصوير خارجية',
    alt_en: 'Outdoor Photography Sessions',
    headline_ar: 'لقطات مفعمة بالحياة في أروع المواقع الطبيعية والمعمارية',
    headline_en: 'Vibrant Sessions in Breathtaking Natural Locations',
    secondary_text_ar: 'توثيق خارجي بين أحضان الطبيعة والمعالم الهندسية.',
    secondary_text_en: 'Outdoor storytelling blending architecture & nature.',
    overlay_style: 'minimal',
    overlay_position: 'bottom-left',
    cta_label_ar: 'احجز جلستك',
    cta_label_en: 'Book Outdoor Session',
    cta_url: '/outdoor-photography',
    cta_icon_type: 'camera',
    feedback_enabled: true,
    focal_x: 50,
    focal_y: 50
  },
  {
    id: 'flow-05',
    enabled: true,
    sort_order: 5,
    slug: 'events',
    category_key: 'EVENTS',
    category_label_ar: 'الحفلات والمناسبات',
    category_label_en: 'EVENTS & OCCASIONS',
    image: heroMediaImg,
    alt_ar: 'توثيق الحفلات والمناسبات',
    alt_en: 'Event & Celebration Photography',
    headline_ar: 'تغطية شـاملة لمناسباتكم الفاخرة بأحدث الكاميرات',
    headline_en: 'Comprehensive Coverage for Extraordinary Events',
    secondary_text_ar: 'فريق متخصص لتغطية الفعاليات والمؤتمرات الكبرى.',
    secondary_text_en: 'Specialized media crew for high-profile galas.',
    overlay_style: 'editorial',
    overlay_position: 'bottom-left',
    cta_label_ar: 'احجز تصوير مناسبتك',
    cta_label_en: 'Book Event Coverage',
    cta_url: '/events',
    cta_icon_type: 'calendar',
    feedback_enabled: true,
    focal_x: 50,
    focal_y: 50
  },
  {
    id: 'flow-06',
    enabled: true,
    sort_order: 6,
    slug: 'graduation-book',
    category_key: 'GRADUATION_BOOK',
    category_label_ar: 'دفتر التخرج',
    category_label_en: 'GRADUATION BOOK',
    image: heroMediaImg,
    alt_ar: 'دفاتر تخرج فاخرة',
    alt_en: 'Luxury Graduation Albums',
    headline_ar: 'دفاتر تخرج مصممة بعناية فائقة لتلائم محطات نجاحكم',
    headline_en: 'Custom Crafted Graduation Keepsakes for Milestones',
    secondary_text_ar: 'طباعة حرارية وتجليد اسفنجي فاخر يدوم طويلاً.',
    secondary_text_en: 'Thermal printing & padded leatherette binding.',
    overlay_style: 'paper',
    overlay_position: 'bottom-left',
    cta_label_ar: 'اطلب دفتر تخرجك',
    cta_label_en: 'Order Graduation Book',
    cta_url: '/graduation-books',
    cta_icon_type: 'order',
    feedback_enabled: true,
    focal_x: 50,
    focal_y: 50
  },
  {
    id: 'flow-07',
    enabled: true,
    sort_order: 7,
    slug: 'graduation-package',
    category_key: 'GRADUATION_PACKAGE',
    category_label_ar: 'بكج مطبوعات التخرج',
    category_label_en: 'GRADUATION PACKAGE',
    image: heroMediaImg,
    alt_ar: 'بكجات التخرج المتكاملة',
    alt_en: 'Complete Graduation Packages',
    headline_ar: 'باقة متكاملة تجمع الصور والدفتر والمطبوعات الهندسية',
    headline_en: 'Complete Bundle of Portraits, Album & Custom Print',
    secondary_text_ar: 'تشمل جميع مستلزمات الخريج في بكج واحد راقٍ.',
    secondary_text_en: 'All graduate print essentials in one luxury package.',
    overlay_style: 'paper',
    overlay_position: 'bottom-left',
    cta_label_ar: 'اطلب بكج التخرج',
    cta_label_en: 'Order Graduation Package',
    cta_url: '/graduation-package',
    cta_icon_type: 'order',
    feedback_enabled: true,
    focal_x: 50,
    focal_y: 50
  },
  {
    id: 'flow-08',
    enabled: true,
    sort_order: 8,
    slug: 'print',
    category_key: 'PRINT',
    category_label_ar: 'مطبوعات',
    category_label_en: 'PRINT',
    image: heroMediaImg,
    alt_ar: 'مطبوعات وتغليف إبداعي',
    alt_en: 'Luxury Print & Packaging',
    headline_ar: 'تقنيات طباعة متقدمة تجعل أفكارك ملموسة بأرقـى جودة',
    headline_en: 'Advanced Printing bringing Ideas into Tactile Quality',
    secondary_text_ar: 'علب فاخرة، كروت، وتغليف بهوية آيرس الفريدة.',
    secondary_text_en: 'Bespoke packaging & collateral with IRIS signature.',
    overlay_style: 'editorial',
    overlay_position: 'bottom-left',
    cta_label_ar: 'اطلب مطبوعاتك',
    cta_label_en: 'Order Custom Print',
    cta_url: '/printing-products',
    cta_icon_type: 'print',
    feedback_enabled: true,
    focal_x: 50,
    focal_y: 50
  }
];

import { supabase } from '../lib/supabase';

export const getFlowItems = () => {
  try {
    const raw = localStorage.getItem(FLOW_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Failed to parse flow items:", err);
  }
  return INITIAL_FLOW_ITEMS;
};

export const getFlowItemsAsync = async () => {
  try {
    const { data, error } = await supabase
      .from('flow_items')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      const items = data.map(row => typeof row.data === 'string' ? JSON.parse(row.data) : row.data);
      localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(items));
      return items;
    }
  } catch (err) {
    console.warn("Could not fetch flow items from Supabase:", err);
  }
  return getFlowItems();
};

export const saveFlowItems = async (items) => {
  // Sanitize items so temporary blob: URLs are never written to database
  const sanitizedItems = items.map(item => {
    const copy = { ...item };
    if (copy.image && copy.image.startsWith('blob:')) {
      copy.image = copy.media_url && !copy.media_url.startsWith('blob:') ? copy.media_url : '';
    }
    if (copy.media_url && copy.media_url.startsWith('blob:')) {
      copy.media_url = copy.image && !copy.image.startsWith('blob:') ? copy.image : '';
    }
    return copy;
  });

  try {
    localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(sanitizedItems));
  } catch (err) {
    console.error("Failed to save flow items to localStorage:", err);
  }

  try {
    const rows = sanitizedItems.map((item, index) => ({
      id: item.id || `flow-${index + 1}`,
      data: item,
      sort_order: item.sort_order || index + 1,
      updated_at: new Date().toISOString()
    }));
    for (const row of rows) {
      const { error } = await supabase.from('flow_items').upsert(row, { onConflict: 'id' });
      if (error) {
        console.error("Error upserting flow item to Supabase:", error);
      }
    }
    return true;
  } catch (err) {
    console.warn("Cloud sync to Supabase flow_items failed:", err);
    return false;
  }
};

// Feedback Repository Methods
export const INITIAL_FEEDBACK = [
  {
    id: 'fb-01',
    flow_item_id: 'flow-01',
    name: 'أحمد التميمي',
    message: 'خدمة ميديا احترافية جداً وتصوير سينمائي فاق التوقعات!',
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'fb-02',
    flow_item_id: 'flow-03',
    name: 'سارة خالد',
    message: 'تجربة الاستوديو كانت رائعة والإضاءة جداً ممتازة.',
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'fb-03',
    flow_item_id: 'flow-07',
    name: 'عمر المجالي',
    message: 'بكج التخرج مميز جداً والجودة عالية ودقة المطبوعات ممتازة.',
    status: 'approved',
    created_at: new Date().toISOString()
  }
];

export const getFlowFeedback = () => {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error("Failed to parse feedback:", err);
  }
  return INITIAL_FEEDBACK;
};

export const getApprovedFeedbackForFlow = (flowItemId) => {
  const all = getFlowFeedback();
  return all.filter((f) => f.flow_item_id === flowItemId && f.status === 'approved');
};

export const getAllApprovedFeedback = () => {
  const all = getFlowFeedback();
  return all.filter((f) => f.status === 'approved');
};

export const submitFlowFeedback = (flowItemId, message, name = '') => {
  const all = getFlowFeedback();
  const newItem = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    flow_item_id: flowItemId,
    name: name.trim() || (localStorage.getItem('user_lang') === 'en' ? 'Visitor' : 'زائر'),
    message: message.trim(),
    status: 'pending',
    created_at: new Date().toISOString()
  };
  all.unshift(newItem);
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(all));
  return newItem;
};

export const updateFeedbackStatus = (feedbackId, newStatus) => {
  const all = getFlowFeedback();
  const updated = all.map((f) => (f.id === feedbackId ? { ...f, status: newStatus } : f));
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
