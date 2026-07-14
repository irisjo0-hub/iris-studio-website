import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Compass } from 'lucide-react';
import '../styles/notfound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-page" dir="rtl">
      <div className="notfound-container">
        <motion.div
          className="notfound-icon-wrapper"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Compass className="notfound-icon" size={80} />
          <div className="notfound-404">404</div>
        </motion.div>

        <motion.div
          className="notfound-text-content"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h1 className="notfound-title">الصفحة غير موجودة</h1>
          <p className="notfound-desc">
            عذراً، يبدو أن الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
          <p className="notfound-desc-en" lang="en">
            Oops! The page you are looking for does not exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          className="notfound-actions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <button className="notfound-btn primary" onClick={() => navigate('/')}>
            <Home size={18} />
            <span>العودة للرئيسية / Return Home</span>
          </button>
          
          <button className="notfound-btn secondary" onClick={() => navigate('/packages')}>
            <ShoppingBag size={18} />
            <span>تصفح الباقات / Browse Packages</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
