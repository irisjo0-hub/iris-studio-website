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
  X
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import irisLogo from '../assets/iris_logo.png';
import '../styles/admin.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  // Close sidebar on route change (for mobile usability)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const menuGroups = [
    {
      title: 'التقارير والمبيعات',
      links: [
        { to: '/admin/dashboard',         label: 'لوحة التحكم', icon: LayoutDashboard },
        { to: '/admin/bookings',          label: 'الحجوزات', icon: CalendarCheck },
        { to: '/admin/schedule',          label: 'جدول المواعيد', icon: CalendarDays },
        { to: '/admin/graduation-orders', label: 'طلبات دفاتر التخرج', icon: GraduationCap },
        { to: '/admin/printing-orders',    label: 'طلبات المطبوعات', icon: Printer },
      ]
    },
    {
      title: 'إدارة المحتوى والخدمات',
      links: [
        { to: '/admin/work',              label: 'معرض الأعمال', icon: Camera },
        { to: '/admin/packages',          label: 'البكجات والأسعار', icon: Package },
        { to: '/admin/offers',            label: 'العروض الترويجية', icon: Gift },
        { to: '/admin/printing-products', label: 'منتجات الطباعة', icon: Printer },
        { to: '/admin/templates',         label: 'قوالب الدفاتر', icon: Images },
        { to: '/admin/extras',            label: 'إضافات الجلسات', icon: Layers },
        { to: '/admin/book-extras',       label: 'إضافات الدفاتر', icon: PlusCircle },
      ]
    },
    {
      title: 'إعدادات المنصة',
      links: [
        { to: '/admin/settings',          label: 'إعدادات الموقع', icon: Settings },
      ]
    }
  ];

  return (
    <div className="admin-layout" dir="rtl">
      {/* Top Header */}
      <header className="admin-header">
        <div className="header-brand-info">
          {/* Mobile Hamburguer Menu Button */}
          <button 
            type="button" 
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <span className="header-title">IRIS STUDIO</span>
          <span className="header-badge">لوحة الإدارة</span>
        </div>
        
        <NavLink to="/" className="header-back-link">
          معاينة الموقع
        </NavLink>
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
            <img src={settings.logo_url || irisLogo} alt="IRIS Studio" className="admin-brand-logo-img" />
            <span className="brand-subtitle">STUDIO ADMIN</span>
          </div>

          <nav className="sidebar-nav">
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
