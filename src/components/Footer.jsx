import React from 'react';
import '../styles/footer.css';
import irisLogo from '../assets/iris_logo.png';

const Footer = ({ admin = false }) => (
  <footer className="footer">
    <div className="footer-content container">
      <div className="footer-logo">
        <img src={irisLogo} alt="IRIS Studio" className="logo" />
      </div>

      <div className="footer-info">
        <p className="contact">
          إربد – إشارة المحافظة – مجمع الخضر – الطابق الأول فوق ميد لاب
        </p>

        <a
          href="https://wa.me/962797303260?text=مرحباً، أود الاستفسار عن خدمات استديو آيرس"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          <span className="whatsapp-icon">💬</span>
          تواصل معنا عبر واتساب
          <span className="phone-number">0797303260</span>
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;