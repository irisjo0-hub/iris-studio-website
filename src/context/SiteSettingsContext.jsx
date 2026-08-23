import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import heroMediaImg from '../assets/hero.png';

const SiteSettingsContext = createContext(null);

export const DEFAULT_HERO_MOTION_IMAGES = [
  { id: 'h-1', image: heroMediaImg, alt_ar: 'إنتاج ميديا سينمائي', alt_en: 'Cinematic Media Production', url_optional: '/work' },
  { id: 'h-2', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1000&q=80', alt_ar: 'تصوير بورتريـه استوديو', alt_en: 'Studio Portrait Photography', url_optional: '/booking' },
  { id: 'h-3', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80', alt_ar: 'تغطية الفعاليات والمؤتمرات', alt_en: 'Event Coverage', url_optional: '/work' },
  { id: 'h-4', image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80', alt_ar: 'كتب تخرج فاخرة', alt_en: 'Luxury Graduation Books', url_optional: '/graduation-books' },
  { id: 'h-5', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80', alt_ar: 'جلسات تصوير شخصية', alt_en: 'Portrait Sessions', url_optional: '/booking' },
  { id: 'h-6', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80', alt_ar: 'إنتاج إعلاني إبداعي', alt_en: 'Creative Production', url_optional: '/work' },
  { id: 'h-7', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80', alt_ar: 'تصوير خارجي احترافي', alt_en: 'Outdoor Photography', url_optional: '/booking' },
  { id: 'h-8', image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1000&q=80', alt_ar: 'مطبوعات وتغليف البراند', alt_en: 'Brand Print & Packaging', url_optional: '/printing-products' }
];

export const DEFAULT_SETTINGS = {
  whatsapp_number: "962797303260",
  facebook_link: "https://facebook.com/iris.jo0",
  instagram_link: "https://instagram.com/iris.jo0",
  slogan_line_1_ar: "من زهرة نادرة",
  slogan_line_1_en: "From a Rare Flower",
  slogan_line_2_ar: "إلى علامة تجارية لا تُنسى",
  slogan_line_2_en: "to an Unforgettable Brand",
  slogan_line_1: "من زهرة نادرة",
  slogan_line_2: "إلى علامة تجارية لا تُنسى",
  supporting_text_ar: "منظومة إبداعية متكاملة تجمع بين إنتاج الميديا، تصوير الاستوديو، والمطبوعات الفاخرة تحت سقف واحد.",
  supporting_text_en: "An integrated creative ecosystem unifying Media Production, Studio Photography, and Luxury Print under one roof.",
  supporting_text: "منظومة إبداعية متكاملة تجمع بين إنتاج الميديا، تصوير الاستوديو، والمطبوعات الفاخرة تحت سقف واحد.",
  hero_primary_cta_ar: "احجز جلستك الآن",
  hero_primary_cta_en: "Book Your Session Now",
  studio_address_ar: "إربد – إشارة المحافظة",
  studio_address_en: "Irbid – Al Mahafaza Signal",
  studio_address: "إربد – إشارة المحافظة",
  location_map_url: "https://maps.app.goo.gl/VhqQbnM86PTucjTv5",
  office_hours_ar: "السبت - الخميس: 10:00 ص - 8:00 م",
  office_hours_en: "Sat - Thu: 10:00 AM - 8:00 PM",
  office_hours: "السبت - الخميس: 10:00 ص - 8:00 م",
  logo_url: "",
  hero_logo_url: "",
  hero_desktop_video_url: "",
  hero_mobile_video_url: "",
  hero_division_media_image: "",
  hero_division_studio_image: "",
  hero_division_print_image: "",
  hero_motion_media_image: "",
  hero_motion_studio_image: "",
  hero_motion_print_image: "",
  hero_motion_images: DEFAULT_HERO_MOTION_IMAGES,
  hero_image_display_count: 8,
  division_media_image: "",
  division_studio_image: "",
  division_print_image: "",
  division_media_title_ar: "ميديا",
  division_media_title_en: "MEDIA",
  division_media_subtitle_ar: "صناعة المحتوى والحملات الإبداعية",
  division_media_subtitle_en: "Content Creation & Creative Campaigns",
  division_studio_title_ar: "استوديو",
  division_studio_title_en: "STUDIO",
  division_studio_subtitle_ar: "التصوير الاحترافي ورواية القصة البصرية",
  division_studio_subtitle_en: "Professional Photography & Visual Storytelling",
  division_print_title_ar: "مطبوعات",
  division_print_title_en: "PRINT",
  division_print_subtitle_ar: "المطبوعات الفاخرة والتغليف الراقي",
  division_print_subtitle_en: "Luxury Print & Premium Packaging",
  division_media_url: "/work",
  division_studio_url: "/booking",
  division_print_url: "/printing-products",
  preloader_text: "آيـرس • اسـتـوديـو إبـداعـي"
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Persistent Language State ('ar' or 'en')
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('iris_language');
    return saved === 'en' ? 'en' : 'ar';
  });

  const setLanguage = (newLang) => {
    const targetLang = newLang === 'en' ? 'en' : 'ar';
    setLangState(targetLang);
    localStorage.setItem('iris_language', targetLang);
    document.documentElement.lang = targetLang;
    document.documentElement.dir = targetLang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLanguage = () => {
    setLanguage(lang === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const dbSettings = {};
        data.forEach(item => {
          dbSettings[item.key] = item.value;
        });

        const merged = {
          ...DEFAULT_SETTINGS,
          ...dbSettings
        };
        setSettings(merged);
        localStorage.setItem('cached_site_settings', JSON.stringify(merged));
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.warn("Could not load settings from database. Using default fallback settings.", err.message);
      const cached = localStorage.getItem('cached_site_settings');
      if (cached) {
        try {
          setSettings(JSON.parse(cached));
        } catch {
          setSettings(DEFAULT_SETTINGS);
        }
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSettingsLocally = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('cached_site_settings', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const cached = localStorage.getItem('cached_site_settings');
    if (cached) {
      try {
        setSettings(JSON.parse(cached));
      } catch {}
    }
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        lang,
        setLanguage,
        toggleLanguage,
        refreshSettings: fetchSettings,
        updateSettingsLocally
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};
