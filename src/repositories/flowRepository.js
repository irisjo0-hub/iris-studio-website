/* src/repositories/flowRepository.js
 * Repository for IRIS Flow items and visitor feedback.
 * Supabase is the source of truth; localStorage is only a cache/fallback.
 */

import heroMediaImg from '../assets/hero.png';
import { supabase } from '../lib/supabase';

const FLOW_STORAGE_KEY = 'iris_flow_items';
const FEEDBACK_STORAGE_KEY = 'iris_flow_feedback';

export const INITIAL_FLOW_ITEMS = [
  {
    id: 'flow-01', enabled: true, sort_order: 1, slug: 'media', category_key: 'MEDIA',
    category_label_ar: 'ميديا', category_label_en: 'MEDIA', image: heroMediaImg,
    alt_ar: 'إنتاج ميديا سينمائي', alt_en: 'Cinematic Media Production',
    headline_ar: 'نصنع قصصًا بصريـة تترك أثرًا سينمائيًا لا يُنسى', headline_en: 'Crafting Visual Stories with Unforgettable Impact',
    secondary_text_ar: 'إنتاج الفيديوهات الإعلانية والوثائقية بأحدث التقنيات السينمائية.', secondary_text_en: 'High-end commercial & documentary video production.',
    overlay_style: 'editorial', overlay_position: 'bottom-left', cta_label_ar: 'اطلب عرضًا لمشروعك', cta_label_en: 'Request Project Proposal', cta_url: '/work', cta_icon_type: 'project', feedback_enabled: true, focal_x: 50, focal_y: 50
  },
  {
    id: 'flow-02', enabled: true, sort_order: 2, slug: 'product-photography', category_key: 'PRODUCT_PHOTOGRAPHY',
    category_label_ar: 'تصوير المنتجات', category_label_en: 'PRODUCT PHOTOGRAPHY', image: heroMediaImg,
    alt_ar: 'تصوير منتجات احترافي', alt_en: 'Professional Product Photography',
    headline_ar: 'إبراز تفاصيل منتجك بأعلى معايير الإضاءة والدقة', headline_en: 'Showcasing Product Details with Studio Lighting Mastery',
    secondary_text_ar: 'تصوير إعلاني وتجاري يرفع من قيمة العلامة التجارية.', secondary_text_en: 'Commercial imagery elevating brand perception.',
    overlay_style: 'hotspot', overlay_position: 'center-left', cta_label_ar: 'احجز تصوير منتجك', cta_label_en: 'Book Product Session', cta_url: '/product-photography', cta_icon_type: 'camera', feedback_enabled: true, focal_x: 50, focal_y: 50
  },
  {
    id: 'flow-03', enabled: true, sort_order: 3, slug: 'studio', category_key: 'STUDIO',
    category_label_ar: 'الاستديو', category_label_en: 'STUDIO', image: heroMediaImg,
    alt_ar: 'تصوير استوديو بورتريـه', alt_en: 'Studio Portrait Photography',
    headline_ar: 'تجربة تصوير استوديو مخصصة تخلد أجمل لحظاتك', headline_en: 'Tailored Studio Portrait Experience Preserving Moments',
    secondary_text_ar: 'إضاءة احترافية وخلفيات متعددة تناسب كل الشخصيات.', secondary_text_en: 'Master lighting and background atmospheres.',
    overlay_style: 'glass', overlay_position: 'bottom-left', cta_label_ar: 'احجز جلستك', cta_label_en: 'Book Studio Session', cta_url: '/booking', cta_icon_type: 'calendar', feedback_enabled: true, focal_x: 50, focal_y: 50
  },
  {
    id: 'flow-04', enabled: true, sort_order: 4, slug: 'outdoor-photography', category_key: 'OUTDOOR_PHOTOGRAPHY',
    category_label_ar: 'التصوير الخارجي', category_label_en: 'OUTDOOR PHOTOGRAPHY', image: heroMediaImg,
    alt_ar: 'جلسات تصوير خارجية', alt_en: 'Outdoor Photography Sessions',
    headline_ar: 'لقطات مفعمة بالحياة في أروع المواقع الطبيعية والمعمارية', headline_en: 'Vibrant Sessions in Breathtaking Natural Locations',
    secondary_text_ar: 'توثيق خارجي بين أحضان الطبيعة والمعالم الهندسية.', secondary_text_en: 'Outdoor storytelling blending architecture & nature.',
    overlay_style: 'minimal', overlay_position: 'bottom-left', cta_label_ar: 'احجز جلستك', cta_label_en: 'Book Outdoor Session', cta_url: '/outdoor-photography', cta_icon_type: 'camera', feedback_enabled: true, focal_x: 50, focal_y: 50
  },
  {
    id: 'flow-05', enabled: true, sort_order: 5, slug: 'events', category_key: 'EVENTS',
    category_label_ar: 'الحفلات والمناسبات', category_label_en: 'EVENTS & OCCASIONS', image: heroMediaImg,
    alt_ar: 'توثيق الحفلات والمناسبات', alt_en: 'Event & Celebration Photography',
    headline_ar: 'تغطية شـاملة لمناسباتكم الفاخرة بأحدث الكاميرات', headline_en: 'Comprehensive Coverage for Extraordinary Events',
    secondary_text_ar: 'فريق متخصص لتغطية الفعاليات والمؤتمرات الكبرى.', secondary_text_en: 'Specialized media crew for high-profile galas.',
    overlay_style: 'editorial', overlay_position: 'bottom-left', cta_label_ar: 'احجز تصوير مناسبتك', cta_label_en: 'Book Event Coverage', cta_url: '/events', cta_icon_type: 'calendar', feedback_enabled: true, focal_x: 50, focal_y: 50
  },
  {
    id: 'flow-06', enabled: true, sort_order: 6, slug: 'graduation-book', category_key: 'GRADUATION_BOOK',
    category_label_ar: 'دفتر التخرج', category_label_en: 'GRADUATION BOOK', image: heroMediaImg,
    alt_ar: 'دفاتر تخرج فاخرة', alt_en: 'Luxury Graduation Albums',
    headline_ar: 'دفاتر تخرج مصممة بعناية فائقة لتلائم محطات نجاحكم', headline_en: 'Custom Crafted Graduation Keepsakes for Milestones',
    secondary_text_ar: 'طباعة حرارية وتجليد اسفنجي فاخر يدوم طويلاً.', secondary_text_en: 'Thermal printing & padded leatherette binding.',
    overlay_style: 'paper', overlay_position: 'bottom-left', cta_label_ar: 'اطلب دفتر تخرجك', cta_label_en: 'Order Graduation Book', cta_url: '/graduation-books', cta_icon_type: 'order', feedback_enabled: true, focal_x: 50, focal_y: 50
  },
  {
    id: 'flow-07', enabled: true, sort_order: 7, slug: 'graduation-package', category_key: 'GRADUATION_PACKAGE',
    category_label_ar: 'بكج مطبوعات التخرج', category_label_en: 'GRADUATION PACKAGE', image: heroMediaImg,
    alt_ar: 'بكجات التخرج المتكاملة', alt_en: 'Complete Graduation Packages',
    headline_ar: 'باقة متكاملة تجمع الصور والدفتر والمطبوعات الهندسية', headline_en: 'Complete Bundle of Portraits, Album & Custom Print',
    secondary_text_ar: 'تشمل جميع مستلزمات الخريج في بكج واحد راقٍ.', secondary_text_en: 'All graduate print essentials in one luxury package.',
    overlay_style: 'paper', overlay_position: 'bottom-left', cta_label_ar: 'اطلب بكج التخرج', cta_label_en: 'Order Graduation Package', cta_url: '/graduation-package', cta_icon_type: 'order', feedback_enabled: true, focal_x: 50, focal_y: 50
  },
  {
    id: 'flow-08', enabled: true, sort_order: 8, slug: 'print', category_key: 'PRINT',
    category_label_ar: 'مطبوعات', category_label_en: 'PRINT', image: heroMediaImg,
    alt_ar: 'مطبوعات وتغليف إبداعي', alt_en: 'Luxury Print & Packaging',
    headline_ar: 'تقنيات طباعة متقدمة تجعل أفكارك ملموسة بأرقـى جودة', headline_en: 'Advanced Printing bringing Ideas into Tactile Quality',
    secondary_text_ar: 'علب فاخرة، كروت، وتغليف بهوية آيرس الفريدة.', secondary_text_en: 'Bespoke packaging & collateral with IRIS signature.',
    overlay_style: 'editorial', overlay_position: 'bottom-left', cta_label_ar: 'اطلب مطبوعاتك', cta_label_en: 'Order Custom Print', cta_url: '/printing-products', cta_icon_type: 'print', feedback_enabled: true, focal_x: 50, focal_y: 50
  }
];

function normalizeFlowItem(item = {}) {
  const copy = { ...item };
  const isVideo = (value) => typeof value === 'string' && /\.(webm|mp4|mov|mkv|m4v|avi)($|\?)/i.test(value);
  if (isVideo(copy.image)) {
    if (!copy.media_url) copy.media_url = copy.image;
    copy.image = heroMediaImg;
  }
  if (!copy.image) copy.image = heroMediaImg;
  return copy;
}

export const getFlowItems = () => {
  try {
    const raw = localStorage.getItem(FLOW_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeFlowItem);
    }
  } catch (err) {
    console.error('Failed to parse flow items:', err);
  }
  return INITIAL_FLOW_ITEMS.map(normalizeFlowItem);
};

export const getFlowItemsAsync = async () => {
  try {
    const { data, error } = await supabase
      .from('flow_items')
      .select('id, data, sort_order')
      .order('sort_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const items = data
        .map((row) => {
          try {
            const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
            return normalizeFlowItem({ ...parsed, id: parsed.id || row.id, sort_order: parsed.sort_order ?? row.sort_order });
          } catch (err) {
            console.warn(`Skipping malformed flow item ${row.id}:`, err);
            return null;
          }
        })
        .filter(Boolean);

      if (items.length > 0) {
        localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(items));
        return items;
      }
    }
  } catch (err) {
    console.warn('Could not fetch flow items from Supabase:', err);
  }
  return getFlowItems();
};

export const saveFlowItems = async (items) => {
  const sanitizedItems = items.map((item) => ({
    ...item,
    image: item.image?.startsWith('blob:') ? '' : item.image,
    media_url: item.media_url?.startsWith('blob:') ? '' : item.media_url
  }));

  try { localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(sanitizedItems)); } catch (err) {
    console.error('Failed to save flow items to localStorage:', err);
  }

  try {
    const rows = sanitizedItems.map((item, index) => ({
      id: item.id || `flow-${index + 1}`,
      data: item,
      sort_order: item.sort_order || index + 1,
      updated_at: new Date().toISOString()
    }));
    let hasError = false;
    for (const row of rows) {
      const { error } = await supabase.from('flow_items').upsert(row, { onConflict: 'id' });
      if (error) {
        console.error('Error upserting flow item to Supabase:', error);
        hasError = true;
      }
    }
    return !hasError;
  } catch (err) {
    console.warn('Cloud sync to Supabase flow_items failed:', err);
    return false;
  }
};

export const INITIAL_FEEDBACK = [];

const normalizeFeedback = (item = {}) => ({
  id: item.id,
  flow_item_id: item.flow_item_id,
  name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : 'زائر',
  message: typeof item.message === 'string' ? item.message.trim() : '',
  status: item.status || 'pending',
  created_at: item.created_at || new Date().toISOString()
});

const cacheFeedback = (items) => {
  try { localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items)); } catch (err) {
    console.warn('Could not cache feedback:', err);
  }
};

export const getFlowFeedback = () => {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeFeedback) : [];
  } catch (err) {
    console.error('Failed to parse feedback:', err);
    return [];
  }
};

export const getApprovedFeedbackForFlow = (flowItemId) =>
  getFlowFeedback().filter((f) => f.flow_item_id === flowItemId && f.status === 'approved');

export const getAllApprovedFeedback = () =>
  getFlowFeedback().filter((f) => f.status === 'approved');

export const getAllApprovedFeedbackAsync = async () => {
  try {
    const { data, error } = await supabase.rpc('get_public_flow_feedback');
    if (!error && Array.isArray(data)) {
      const approved = data.map((item) => normalizeFeedback({ ...item, status: 'approved' }));
      cacheFeedback(approved);
      return approved;
    }
  } catch (err) {
    console.warn('Could not fetch visitor feedback from Supabase:', err);
  }
  return getAllApprovedFeedback();
};

export const submitFlowFeedback = async (flowItemId, message, name = '') => {
  const cleanMessage = String(message || '').trim();
  const cleanName = String(name || '').trim() || 'زائر';
  if (!flowItemId || cleanMessage.length < 3 || cleanMessage.length > 1000 || cleanName.length > 80) {
    throw new Error('Invalid feedback data.');
  }

  const { data, error } = await supabase
    .from('flow_feedback')
    .insert({
      flow_item_id: flowItemId,
      name: cleanName.slice(0, 80),
      message: cleanMessage,
      status: 'pending'
    })
    .select('id, flow_item_id, name, message, status, created_at')
    .single();

  if (error) throw error;
  return normalizeFeedback(data);
};

export const updateFeedbackStatus = async (feedbackId, newStatus) => {
  if (!['pending', 'approved', 'rejected'].includes(newStatus)) {
    throw new Error('Invalid feedback status.');
  }

  const { data, error } = await supabase
    .from('flow_feedback')
    .update({
      status: newStatus,
      approved_at: newStatus === 'approved' ? new Date().toISOString() : null
    })
    .eq('id', feedbackId)
    .select('id, flow_item_id, name, message, status, created_at')
    .single();

  if (error) throw error;
  return normalizeFeedback(data);
};
