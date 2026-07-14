import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import irisLogo from '../assets/iris_logo.png';
import { MessageSquare, MapPin } from 'lucide-react';
import '../styles/footer.css';

const footerLinks = [
  { path: '/booking', label: 'جلسات التصوير' },
  { path: '/graduation-books', label: 'دفاتر التخرج' },
  { path: '/printing-products', label: 'المطبوعات' },
  { path: '/work', label: 'أعمالنا' },
  { path: '/packages', label: 'البكجات والعروض' },
];

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="footer" dir="rtl">
      {/* Gradient divider */}
      <div className="footer-gradient-divider" />
      
      <div className="footer-content container">
        {/* Logo + Brand */}
        <div className="footer-brand">
          <Link to="/">
            <img src={settings.logo_url || irisLogo} alt="IRIS Studio" className="footer-logo" />
          </Link>
          <p className="footer-tagline">
            {settings.slogan_line_1} {settings.slogan_line_2}
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links-section">
          <h4 className="footer-heading">روابط سريعة</h4>
          <nav className="footer-nav">
            {footerLinks.map((item) => (
              <Link key={item.path} to={item.path} className="footer-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact + Social */}
        <div className="footer-contact-section">
          <h4 className="footer-heading">تواصل معنا</h4>
          <a 
            href={`https://wa.me/${settings.whatsapp_number}`} 
            target="_blank" 
            rel="noreferrer" 
            className="footer-contact-link" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <MessageSquare size={16} />
            <span>واتساب</span>
          </a>
          <a 
            href={settings.location_map_url} 
            target="_blank" 
            rel="noreferrer" 
            className="footer-contact-link" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <MapPin size={16} />
            <span>{settings.studio_address}</span>
          </a>
          <div className="footer-socials">
            <a 
              href={settings.instagram_link} 
              target="_blank" 
              rel="noreferrer" 
              className="footer-social-icon" 
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a 
              href={settings.facebook_link} 
              target="_blank" 
              rel="noreferrer" 
              className="footer-social-icon" 
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p className="copyright">
          &copy; {new Date().getFullYear()} IRIS Studio. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;