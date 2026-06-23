import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const links = [
    { to: '/admin/dashboard',         label: 'لوحة التحكم' },
    { to: '/admin/bookings',          label: 'الحجوزات' },
    { to: '/admin/schedule',          label: 'جدول المواعيد' },
    { to: '/admin/graduation-orders', label: 'طلبات دفاتر التخرج' },
    { to: '/admin/work',              label: 'الأعمال' },
    { to: '/admin/packages',          label: 'البكجات' },
    { to: '/admin/templates',         label: 'القوالب' },
    { to: '/admin/extras',            label: 'إضافات الحجز' },
    { to: '/admin/book-extras',       label: 'إضافات الدفاتر' },
  ];

  return (
    <div className="admin-layout" dir="rtl">
      {/* Top Header */}
      <header className="admin-header">
        <span className="header-title">IRIS Admin Dashboard</span>
        <NavLink to="/" className="header-back-link">
          رجوع للموقع
        </NavLink>
      </header>

      {/* Content Wrapper */}
      <div className="admin-content-wrapper">
        {/* Fixed Right Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <span className="brand-logo">IRIS</span>
            <span className="brand-subtitle">STUDIO</span>
          </div>

          <nav className="sidebar-nav">
            <ul>
              {links.map((lnk) => (
                <li key={lnk.to}>
                  <NavLink
                    to={lnk.to}
                    className={({ isActive }) =>
                      isActive ? 'sidebar-link active' : 'sidebar-link'
                    }
                  >
                    {lnk.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button className="logout-button" onClick={handleLogout}>
            تسجيل الخروج
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
