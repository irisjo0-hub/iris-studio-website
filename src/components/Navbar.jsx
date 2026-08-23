import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import irisLogo from '../assets/iris_logo.png';
import '../styles/navbar.css';

const navItems = [
  { path: '/', label_ar: 'الرئيسية', label_en: 'Home' },
  { path: '/booking', label_ar: 'جلسات التصوير', label_en: 'Studio Sessions' },
  { path: '/graduation-books', label_ar: 'دفاتر التخرج', label_en: 'Graduation Books' },
  { path: '/graduation-book-order', label_ar: 'طلب دفتر تخرج', label_en: 'Order Book' },
  { path: '/printing-products', label_ar: 'المطبوعات الفاخرة', label_en: 'Print Shop' },
  { path: '/work', label_ar: 'معرض الأعمال', label_en: 'Our Portfolio' },
  { path: '/packages', label_ar: 'البكجات والعروض', label_en: 'Packages & Offers' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { settings, lang, toggleLanguage } = useSiteSettings();
  const isRtl = lang === 'ar';

  // Context-aware Navigation Binds for Media, Studio & Print divisions
  let activeNavItems = [
    { path: '/', label_ar: 'الرئيسية', label_en: 'Home' },
    { path: '/booking', label_ar: 'جلسات التصوير', label_en: 'Studio Sessions' },
    { path: '/graduation-books', label_ar: 'دفاتر التخرج', label_en: 'Graduation Books' },
    { path: '/graduation-book-order', label_ar: 'طلب دفتر تخرج', label_en: 'Order Book' },
    { path: '/printing-products', label_ar: 'المطبوعات الفاخرة', label_en: 'Print Shop' },
    { path: '/work', label_ar: 'معرض الأعمال', label_en: 'Our Portfolio' },
    { path: '/packages', label_ar: 'البكجات والعروض', label_en: 'Packages & Offers' },
  ];

  if (location.pathname.startsWith('/media')) {
    activeNavItems = [
      { path: '/', label_ar: 'الرئيسية', label_en: 'Home' },
      { path: '/media', label_ar: 'بوابة الميديا', label_en: 'Media Hub' },
      { path: '/work', label_ar: 'معرض الأعمال والمشاريع', label_en: 'Projects Portfolio' },
      { path: '/media#quote-section', label_ar: 'طلب عرض سعر', label_en: 'Request Quote' },
      { path: '/media#contact-section', label_ar: 'التواصل الفوري', label_en: 'Contact Us' },
    ];
  } else if (location.pathname.startsWith('/print') || location.pathname === '/printing-products') {
    activeNavItems = [
      { path: '/', label_ar: 'الرئيسية', label_en: 'Home' },
      { path: '/print', label_ar: 'بوابة المطبوعات', label_en: 'Print Hub' },
      { path: '/printing-products', label_ar: 'متجر المنتجات', label_en: 'Print Shop' },
      { path: '/print#custom-section', label_ar: 'طباعة مخصصة', label_en: 'Custom Print' },
      { path: '/print#track-section', label_ar: 'تتبع الطلب', label_en: 'Track Order' },
    ];
  } else if (location.pathname.startsWith('/studio') || location.pathname === '/booking' || location.pathname === '/graduation-books') {
    activeNavItems = [
      { path: '/', label_ar: 'الرئيسية', label_en: 'Home' },
      { path: '/studio', label_ar: 'بوابة الاستوديو', label_en: 'Studio Hub' },
      { path: '/booking', label_ar: 'جلسات التصوير', label_en: 'Sessions' },
      { path: '/graduation-books', label_ar: 'دفاتر التخرج', label_en: 'Graduation Books' },
      { path: '/graduation-book-order', label_ar: 'طلب دفتر تخرج', label_en: 'Order Book' },
      { path: '/templates', label_ar: 'قوالب الأغلفة', label_en: 'Templates' },
      { path: '/work', label_ar: 'معرض الأعمال', label_en: 'Portfolio' },
    ];
  }

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

        {/* Scrollable Nav Links */}
        <div className="nav-scroll-wrapper">
          <nav className="nav-links">
            {activeNavItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  {isRtl ? item.label_ar : item.label_en}
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </div>

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
