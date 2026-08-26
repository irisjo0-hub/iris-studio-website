import React from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import irisLogo from '../assets/iris_logo.png';
import { MessageSquare, MapPin, Phone, Mail } from 'lucide-react';
import '../styles/footer.css';

export const Footer = () => {
  const { settings, lang } = useSiteSettings();
  const isRtl = lang === 'ar';

  const footerLinks = [
    { path: '/studio', label_ar: 'الاستوديو والتصوير', label_en: 'Studio Photography' },
    { path: '/media', label_ar: 'إنتاج الميديا والأعمال', label_en: 'Media Production' },
    { path: '/print', label_ar: 'المطبوعات الفاخرة', label_en: 'Luxury Printing' },
    { path: '/graduation-books', label_ar: 'دفاتر التخرج', label_en: 'Graduation Books' },
    { path: '/packages', label_ar: 'البكجات والعروض', label_en: 'Packages & Offers' },
  ];

  return (
    <footer id="iris-footer-root" className={`footer dir-${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Premium Gradient Divider */}
      <div className="footer-gradient-divider" />
      
      {/* 3 Creative Pillars Glassmorphic Badge Bar */}
      <div className="footer-pillars-bar container">
        <span className="pillar-item">{isRtl ? '01. ميديا' : '01. MEDIA'}</span>
        <span className="pillar-bullet">•</span>
        <span className="pillar-item">{isRtl ? '02. استوديو' : '02. STUDIO'}</span>
        <span className="pillar-bullet">•</span>
        <span className="pillar-item">{isRtl ? '03. مطبوعات' : '03. PRINT'}</span>
      </div>

      <div className="footer-content container">
        {/* Slogan & Eyebrow Pill */}
        <div className="footer-brand">
          <p className="footer-tagline">
            {isRtl
              ? (settings.slogan_line_1_ar || settings.slogan_line_1 || "من زهرة نادرة") + " " + (settings.slogan_line_2_ar || settings.slogan_line_2 || "إلى علامة تجارية لا تُنسى")
              : (settings.slogan_line_1_en || "From a Rare Flower") + " " + (settings.slogan_line_2_en || "to an Unforgettable Brand")}
          </p>
          <div className="footer-eyebrow-pill">
            <span>WE BREAK THE BOX</span>
            <span className="dot" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-links-section">
          <h4 className="footer-heading">{isRtl ? 'روابط سريعة' : 'Quick Navigation'}</h4>
          <nav className="footer-nav">
            {footerLinks.map((item) => (
              <Link key={item.path} to={item.path} className="footer-link">
                <span className="link-hover-dot" />
                <span>{isRtl ? item.label_ar : item.label_en}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Contact Information */}
        <div className="footer-contact-section">
          <h4 className="footer-heading">{isRtl ? 'تواصل معنا' : 'Contact & Location'}</h4>
          
          {/* Management WhatsApp Link (Clean Button text without raw number) */}
          <a 
            href="https://wa.me/962798627259" 
            target="_blank" 
            rel="noreferrer" 
            className="footer-contact-link" 
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className="contact-icon-whatsapp">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>{isRtl ? 'واتساب الإدارة' : 'Management WhatsApp'}</span>
          </a>

          {/* Prominent Maps Location Button */}
          <a 
            href={settings.location_map_url || 'https://maps.google.com/?q=Irbid+Jordan'} 
            target="_blank" 
            rel="noreferrer" 
            className="footer-location-btn" 
          >
            <MapPin size={18} className="location-btn-icon" />
            <span>{settings.studio_address || (isRtl ? 'إربد – إشارة المحافظة' : 'Irbid – Governorate Signal')}</span>
          </a>

          {/* Social Icons Row (Instagram, Facebook, and Direct IRIS WhatsApp) */}
          <div className="footer-socials">
            {/* Direct IRIS WhatsApp Button */}
            <a 
              href={`https://wa.me/${settings.whatsapp_number || '962797303260'}`} 
              target="_blank" 
              rel="noreferrer" 
              className="footer-social-icon icon-whatsapp" 
              aria-label="IRIS WhatsApp"
              title={isRtl ? 'واتساب آيرس المباشر' : 'IRIS Direct WhatsApp'}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>

            {/* Instagram */}
            {settings.instagram_link && (
              <a 
                href={settings.instagram_link} 
                target="_blank" 
                rel="noreferrer" 
                className="footer-social-icon" 
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
            )}

            {/* Facebook */}
            {settings.facebook_link && (
              <a 
                href={settings.facebook_link} 
                target="_blank" 
                rel="noreferrer" 
                className="footer-social-icon" 
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright Stage — Ultra-Luxury Studio Seal & Glassmorphic Capsule */}
      <div className="footer-bottom container">
        {/* Ambient Gold Halo Field */}
        <div className="footer-bottom-glow" />

        {/* Studio Crest Seal */}
        <div className="footer-studio-seal">
          <img
            src={settings.hero_logo_url || settings.logo_url || irisLogo}
            alt="IRIS"
            className="footer-seal-logo"
          />
        </div>

        {/* Sleek Golden Accent Line */}
        <div className="footer-bottom-accent-line" />

        {/* Glassmorphic Copyright Capsule */}
        <div className="footer-copyright-capsule">
          <span className="copyright-brand">IRIS Agency</span>
          <span className="copyright-sep">•</span>
          <span className="copyright-year">&copy; {new Date().getFullYear()}</span>
          <span className="copyright-sep">•</span>
          <span className="copyright-text">{isRtl ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;