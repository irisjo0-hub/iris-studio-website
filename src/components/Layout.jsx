import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/global.css';

/**
 * Layout component for public (customer) pages.
 * Renders the main navigation bar, page content, and footer.
 */
const Layout = ({ children }) => (
  <div dir="rtl" lang="ar" className="customer-layout">
    <Navbar />
    <main className="content-wrapper">{children}</main>
    <Footer />
  </div>
);

export default Layout;
