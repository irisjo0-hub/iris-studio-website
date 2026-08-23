import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import irisLogo from '../assets/iris_logo.png';
import '../styles/navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const isRtl = lang === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (isHome) {
    return null;
  }

  const BackArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <motion.header
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-container">
        {/* Brand Home Link */}
        <Link to="/" className="nav-logo-link" aria-label="IRIS Studio Home">
          <img src={settings.logo_url || irisLogo} alt="IRIS" className="logo" />
        </Link>

        {/* Actions: Minimal Language Switcher + Back Button */}
        <div className="nav-actions-group">
          <button
            type="button"
            className="navbar-lang-toggle-btn"
            onClick={toggleLanguage}
            aria-label={isRtl ? 'Switch to English' : 'التحويل إلى العربية'}
            title={isRtl ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe size={16} />
            <span className="lang-code-text">{isRtl ? 'EN' : 'ع'}</span>
          </button>

          <button
            type="button"
            className="navbar-back-btn"
            onClick={handleBack}
            aria-label={isRtl ? 'رجوع' : 'Back'}
            title={isRtl ? 'رجوع' : 'Back'}
          >
            <BackArrowIcon size={18} />
            <span className="back-btn-label">{isRtl ? 'رجوع' : 'Back'}</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
