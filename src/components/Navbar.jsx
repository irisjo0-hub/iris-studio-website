import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/navbar.css';
import irisLogo from '../assets/iris_logo.png';

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
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="logo-container">
          <NavLink to="/">
            <img src={irisLogo} alt="IRIS Studio" className="logo" />
          </NavLink>
        </div>

        <div className="nav-scroll-wrapper">
          <nav className="nav-links">
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;

