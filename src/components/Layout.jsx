import React, { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { PremiumCursorGlow } from './motion';
import '../styles/global.css';

/**
 * Layout component for public (customer) pages.
 * Renders the main navigation bar, page content with animated transitions, and footer.
 */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 40,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1], // premium ease-out
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    filter: 'blur(6px)',
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const Layout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Automatically scroll to top on every page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div dir="rtl" lang="ar" className="customer-layout">
      <PremiumCursorGlow />
      <Navbar />
      {isHome ? (
        <main className="content-wrapper">
          <Outlet />
        </main>
      ) : (
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="content-wrapper subpage-layout-content"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      )}
      <Footer />
    </div>
  );
};

export default Layout;
