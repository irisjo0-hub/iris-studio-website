import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SiteSettingsContext = createContext(null);

export const DEFAULT_SETTINGS = {
  whatsapp_number: "962797303260",
  facebook_link: "https://facebook.com/iris.jo0",
  instagram_link: "https://instagram.com/iris.jo0",
  slogan_line_1: "من زهرة نادرة",
  slogan_line_2: "إلى علامة تجارية لا تُنسى",
  supporting_text: "من السوسنة السوداء الأردنية تبدأ رحلتنا، ومن التفاصيل نصنع تجربة لا تُنسى.",
  studio_address: "إربد – إشارة المحافظة",
  location_map_url: "https://maps.app.goo.gl/VhqQbnM86PTucjTv5",
  office_hours: "السبت - الخميس: 10:00 ص - 8:00 م",
  logo_url: "",
  hero_desktop_video_url: "",
  hero_mobile_video_url: "",
  preloader_text: "آيـرس • اسـتـوديـو إبـداعـي"
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

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
    // Check local storage cache on initial mount before async load finishes
    const cached = localStorage.getItem('cached_site_settings');
    if (cached) {
      try {
        setSettings(JSON.parse(cached));
      } catch {}
    }
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateSettingsLocally }}>
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
