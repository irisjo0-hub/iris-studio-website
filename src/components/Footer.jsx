import React from 'react';
import '../styles/footer.css';

const Footer = () => (
  <footer className="footer" dir="rtl">
    <div className="footer-content container">
      <p className="copyright" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-purple)' }}>
        &copy; {new Date().getFullYear()} IRIS Studio. جميع الحقوق محفوظة.
      </p>
    </div>
  </footer>
);

export default Footer;