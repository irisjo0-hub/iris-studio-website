import React, { useState } from 'react';
import '../styles/navbar.css';
import irisLogo from '../assets/iris_logo.png';

const navItems = [
  { path: '/', label: 'الرئيسية' },
  { path: '/work', label: 'أعمالنا' },
  { path: '/packages', label: 'البكجات والعروض' },
  { path: '/graduation-books', label: 'دفاتر التخرج' },
  { path: '/graduation-order', label: 'طلب دفتر تخرج' },
  { path: '/booking', label: 'احجز جلستك' },
];

const Navbar = ({ admin = false }) => {
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!open);
  return (
    <header className="navbar">
      <div className="logo-container">
        <img src={irisLogo} alt="IRIS Studio" className="logo" />
      </div>
      <nav className={`nav-links ${open ? 'open' : ''}`}>
        {navItems.map((item) => (
          <a key={item.path} href={item.path} className="nav-item" onClick={() => setOpen(false)}>
            {item.label}
          </a>
        ))}
      </nav>
      <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
    </header>
  );
};

export default Navbar;
