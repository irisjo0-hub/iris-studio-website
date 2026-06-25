import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/navbar.css';
import irisLogo from '../assets/iris_logo.png';

const navItems = [
  { path: '/', label: 'الرئيسية' },
  { path: '/booking', label: 'جلسات التصوير' },
  { path: '/graduation-books', label: 'دفاتر التخرج' },
  { path: '/printing-products', label: 'المطبوعات' },
  { path: '/work', label: 'أعمالنا' },
  { path: '/packages', label: 'البكجات والعروض' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="logo-container">
          <NavLink to="/" onClick={() => setIsOpen(false)}>
            <img src={irisLogo} alt="IRIS Studio" className="logo" />
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      <div className={`nav-drawer ${isOpen ? 'open' : ''}`}>
        <nav className="drawer-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Overlay to close when clicking outside */}
      {isOpen && <div className="drawer-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Navbar;

