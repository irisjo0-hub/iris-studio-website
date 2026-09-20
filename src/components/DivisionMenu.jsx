import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Clapperboard, Camera, Printer, MessageCircle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteSettings } from '../context/SiteSettingsContext';
import irisLogo from '../assets/iris_logo.png';
import '../styles/division-menu.css';

const DivisionMenu = () => {
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const location = useLocation();
  const isRtl = lang === 'ar';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const items = [
    { to: '/', label: isRtl ? 'الرئيسية' : 'Home', Icon: Home },
    { to: '/media', label: isRtl ? 'ميديا' : 'Media', Icon: Clapperboard },
    { to: '/studio', label: isRtl ? 'الاستوديو' : 'Studio', Icon: Camera },
    { to: '/print', label: isRtl ? 'المطبوعات' : 'Print', Icon: Printer },
  ];

  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <>
      <button type="button" className="division-menu-trigger" onClick={() => setOpen(true)} aria-label={isRtl ? 'فتح القائمة' : 'Open menu'}>
        <Menu size={20} strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && createPortal(
          <motion.div
            className="division-menu-overlay"
            dir={isRtl ? 'rtl' : 'ltr'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="division-menu-top">
              <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" />
              <button type="button" className="division-menu-close" onClick={() => setOpen(false)} aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'}>
                <X size={22} />
              </button>
            </div>

            <nav className="division-menu-list">
              {items.map(({ to, label, Icon }, index) => (
                <motion.div key={to} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .055 }}>
                  <Link to={to} className={`division-menu-item${isActive(to) ? ' active' : ''}`} onClick={() => setOpen(false)}>
                    <span className="division-menu-number">0{index + 1}</span>
                    <span className="division-menu-icon"><Icon size={18} strokeWidth={1.7} /></span>
                    <span className="division-menu-label">{label}</span>
                  </Link>
                </motion.div>
              ))}

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .22 }}>
                <a href="#iris-footer-root" className="division-menu-item contact" onClick={() => {
                  setOpen(false);
                  requestAnimationFrame(() => document.getElementById('iris-footer-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                }}>
                  <span className="division-menu-number">05</span>
                  <span className="division-menu-icon"><MessageCircle size={18} strokeWidth={1.7} /></span>
                  <span className="division-menu-label">{isRtl ? 'تواصل معنا' : 'Contact Us'}</span>
                </a>
              </motion.div>
            </nav>

            <div className="division-menu-bottom">
              <button type="button" className="division-menu-lang" onClick={toggleLanguage}>
                <Globe size={15} />
                <span>{isRtl ? 'EN English' : 'ع العربية'}</span>
              </button>
              <span className="division-menu-signature"><i /> WE BREAK THE BOX</span>
            </div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </>
  );
};

export default DivisionMenu;
