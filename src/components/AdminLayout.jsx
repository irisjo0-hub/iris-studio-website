import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  CalendarDays, 
  GraduationCap, 
  Printer, 
  Camera, 
  Package, 
  Gift, 
  Images, 
  Layers, 
  PlusCircle, 
  Settings, 
  LogOut,
  Menu,
  X,
  Eye,
  Crown
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { supabase } from '../lib/supabase';
import irisLogo from '../assets/iris_logo.png';
import '../styles/admin.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/admin/login');
  };

  // Close sidebar on route change (for mobile usability)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const menuGroups = [
    {
      title: 'التقارير الرئيسية',
      links: [
        { to: '/admin/dashboard',         label: 'لوحة الإحصائيات', icon: LayoutDashboard },
      ]
    },
    {
      title: '🎥 قطاع الميديا (MEDIA)',
      links: [
        { to: '/admin/work',              label: 'معرض أعمال الميديا', icon: Camera },
        { to: '/admin/packages',          label: 'بكجات الإعلانات والميديا', icon: Package },
        { to: '/admin/offers',            label: 'العروض والعروض الخاصة', icon: Gift },
      ]
    },
    {
      title: '📸 قطاع الاستوديو والتخرج (STUDIO)',
      links: [
        { to: '/admin/bookings',          label: 'حجوزات الجلسات', icon: CalendarCheck },
        { to: '/admin/schedule',          label: 'جدول مواعيد الاستوديو', icon: CalendarDays },
        { to: '/admin/graduation-orders', label: 'طلبات دفاتر التخرج', icon: GraduationCap },
        { to: '/admin/templates',         label: 'قوالب الأغلفة', icon: Images },
        { to: '/admin/extras',            label: 'إضافات جلسات التصوير', icon: Layers },
        { to: '/admin/book-extras',       label: 'إضافات دفاتر التخرج', icon: PlusCircle },
      ]
    },
    {
      title: '🖨️ قطاع المطبوعات (PRINT)',
      links: [
        { to: '/admin/printing-products', label: 'منتجات متجر الطباعة', icon: Printer },
        { to: '/admin/printing-orders',   label: 'طلبات المطبوعات والتوصيل', icon: Printer },
      ]
    },
    {
      title: 'إعدادات المنصة',
      links: [
        { to: '/admin/settings',          label: 'إعدادات الموقع الشاملة', icon: Settings },
      ]
    }
  ];

  return (
    <div className="admin-layout" dir="rtl">
      {/* Top Glassmorphic Header */}
      <header className="admin-header">
        <div className="header-right-info">
          {/* Mobile Hamburger Menu Button */}
          <button 
            type="button" 
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Center logo */}
        <div className="header-center-logo">
          <img src={settings.logo_url || irisLogo} alt="IRIS Studio" className="admin-header-logo-img" />
        </div>

        <div className="header-left-info">
          <div className="header-admin-badge-box">
            <Crown size={14} className="badge-crown-icon" />
            <span className="header-badge header-badge-text">لوحة التحكم</span>
          </div>
        </div>
      </header>

      {/* Content Wrapper */}
      <div className="admin-content-wrapper">
        {/* Backdrop Overlay for Mobile Screen */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              className="admin-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Fixed Right Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-brand">
            <span className="brand-subtitle">ADMIN PANEL</span>
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-group">
              <span className="group-title">المنصة العامة</span>
              <ul>
                <li>
                  <NavLink to="/" className="sidebar-link preview-site-item">
                    <Eye className="link-icon" size={17} strokeWidth={2} />
                    <span className="link-label">معاينة الموقع الرئيسي</span>
                  </NavLink>
                </li>
              </ul>
            </div>

            {menuGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="sidebar-group">
                <span className="group-title">{group.title}</span>
                <ul>
                  {group.links.map((lnk) => {
                    const IconComponent = lnk.icon;
                    return (
                      <li key={lnk.to}>
                        <NavLink
                          to={lnk.to}
                          className={({ isActive }) =>
                            isActive ? 'sidebar-link active' : 'sidebar-link'
                          }
                        >
                          <IconComponent className="link-icon" size={17} strokeWidth={2} />
                          <span className="link-label">{lnk.label}</span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={16} style={{ marginLeft: '8px' }} />
            <span>تسجيل الخروج</span>
          </button>
        </aside>

        {/* Main Content Area with Smooth Page Transition */}
        <main className="admin-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: '100%', height: '100%' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
