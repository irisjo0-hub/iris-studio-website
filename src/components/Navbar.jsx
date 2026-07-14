import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSiteSettings } from '../context/SiteSettingsContext';
import irisLogo from '../assets/iris_logo.png';
import '../styles/navbar.css';

const navItems = [
  { path: '/', label: 'الرئيسية' },
  { path: '/booking', label: 'جلسات التصوير' },
  { path: '/graduation-books', label: 'دفاتر التخرج' },
  { path: '/graduation-book-order', label: 'طلب دفتر تخرج' },
  { path: '/printing-products', label: 'المطبوعات' },
  { path: '/work', label: 'أعمالنا' },
  { path: '/packages', label: 'البكجات والعروض' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      style={isHome ? { display: 'none', opacity: 0 } : {}}
      initial={isHome ? {} : { y: -80, opacity: 0 }}
      animate={isHome ? {} : { y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="navbar-container">
        <div className="nav-scroll-wrapper">
          <nav className="nav-links">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={isHome ? {} : { opacity: 0, y: -10 }}
                animate={isHome ? {} : { opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </NavLink>
              </motion.div>
            ))}
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
