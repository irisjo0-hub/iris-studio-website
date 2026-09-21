import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Clapperboard, Camera, Printer, MessageCircle, Globe } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import irisLogo from '../assets/iris_logo.png';
import '../styles/iris-dark-hero.css';

const DivisionMenu = () => {
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const isRtl = lang === 'ar';
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : previousOverflow;

    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const items = [
    { to: '/', label: isRtl ? 'الرئيسية' : 'Home', Icon: Home },
    { to: '/media', label: isRtl ? 'ميديا' : 'Media', Icon: Clapperboard },
    { to: '/studio', label: isRtl ? 'الاستوديو' : 'Studio', Icon: Camera },
    { to: '/print', label: isRtl ? 'المطبوعات' : 'Print', Icon: Printer },
  ];

  const isActive = (to) =>
    to === '/'
      ? location.pathname === '/'
      : location.pathname === to || location.pathname.startsWith(to + '/');

  const openMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(true);
  };

  const stopMenuEvent = (event) => {
    event.stopPropagation();
  };

  const closeMenu = () => setOpen(false);

  const goToFooter = () => {
    const footerEl = document.getElementById('iris-footer-root');
    if (!footerEl) return false;
    window.history.replaceState(null, '', '#iris-footer-root');
    footerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  };

  const handleContact = (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeMenu();

    if (location.pathname === '/') {
      requestAnimationFrame(goToFooter);
      return;
    }

    navigate('/');
    let attempts = 0;
    const waitForHomeFooter = () => {
      if (goToFooter() || attempts++ > 30) return;
      requestAnimationFrame(waitForHomeFooter);
    };
    requestAnimationFrame(waitForHomeFooter);
  };

  return (
    <>
      <button
        type="button"
        className="hero-v2-hamburger-btn division-unified-menu-trigger"
        data-iris-menu-trigger="true"
        onPointerDown={openMenu}
        onClick={openMenu}
        onTouchStart={stopMenuEvent}
        onTouchEnd={openMenu}
        aria-label={isRtl ? 'فتح القائمة' : 'Open menu'}
        aria-expanded={open}
        aria-controls="iris-division-menu"
      >
        <Menu size={20} strokeWidth={1.8} />
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          id="iris-division-menu"
          className="division-menu-overlay"
          dir={isRtl ? 'rtl' : 'ltr'}
          role="dialog"
          aria-modal="true"
          aria-label={isRtl ? 'قائمة آيرس' : 'IRIS navigation'}
          onPointerDown={stopMenuEvent}
          onClick={stopMenuEvent}
          onTouchStart={stopMenuEvent}
          onTouchMove={stopMenuEvent}
          onTouchEnd={stopMenuEvent}
        >
          <div className="division-menu-top">
            <img src={settings.hero_logo_url || settings.logo_url || irisLogo} alt="IRIS" />
            <button
              type="button"
              className="division-menu-close"
              onClick={closeMenu}
              aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'}
            >
              <X size={22} />
            </button>
          </div>

          <nav className="division-menu-list">
            {items.map(({ to, label, Icon }, index) => (
              <Link
                key={to}
                to={to}
                className={`division-menu-item${isActive(to) ? ' active' : ''}`}
                onClick={closeMenu}
              >
                <span className="division-menu-number">0{index + 1}</span>
                <span className="division-menu-icon">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <span className="division-menu-label">{label}</span>
              </Link>
            ))}

            <a
              href="/#iris-footer-root"
              className="division-menu-item contact"
              onClick={handleContact}
            >
              <span className="division-menu-number">05</span>
              <span className="division-menu-icon">
                <MessageCircle size={18} strokeWidth={1.7} />
              </span>
              <span className="division-menu-label">
                {isRtl ? 'تواصل معنا' : 'Contact Us'}
              </span>
            </a>
          </nav>

          <div className="division-menu-bottom">
            <div className="division-menu-actions">
              <button
                type="button"
                className="division-menu-lang"
                onClick={toggleLanguage}
              >
                <Globe size={15} />
                <span>{isRtl ? 'EN English' : 'ع العربية'}</span>
              </button>
            </div>
            <span className="division-menu-signature">
              <i /> WE BREAK THE BOX
            </span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default DivisionMenu;

// Vercel production sync trigger: keep Git integration deployment aligned with main.
