import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [graduationOrders, setGraduationOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: bData } = await supabase
          .from('bookings')
          .select('status');
        if (bData) setBookings(bData);
      } catch (e) {
        console.error('Failed to fetch bookings', e);
      }

      try {
        const { data: gData } = await supabase
          .from('graduation_orders')
          .select('id');
        if (gData) setGraduationOrders(gData);
      } catch (e) {
        console.error('Failed to fetch graduation_orders', e);
      }
    };
    fetchData();
  }, []);

  const totalBookings = bookings.length;
  const pending = bookings.filter((b) => (b.status || 'pending') === 'pending').length;
  const approved = bookings.filter((b) => b.status === 'approved').length;
  const totalGraduation = graduationOrders.length;

  const stats = [
    { label: 'إجمالي الحجوزات', value: totalBookings, className: 'card-purple', icon: '📅', link: '/admin/bookings' },
    { label: 'بانتظار المراجعة', value: pending, className: 'card-gold', icon: '⏳', link: '/admin/bookings' },
    { label: 'الحجوزات المؤكدة', value: approved, className: 'card-green', icon: '✅', link: '/admin/bookings' },
    { label: 'دفاتر التخرج', value: totalGraduation, className: 'card-magenta', icon: '🎓', link: '/admin/graduation-orders' },
  ];

  return (
    <AdminLayout>
      <section className="admin-dashboard">
        <h2 className="section-title">ملخص الإدارة الإحصائي</h2>
        <p className="section-subtitle">نظرة سريعة ومؤشرات الأداء لجميع حركات الموقع.</p>
        
        <div className="cards-grid">
          {stats.map((s, idx) => (
            <Link key={idx} to={s.link} className={`card ${s.className} dashboard-stat-card`}>
              <div className="stat-card-header">
                <span className="stat-icon">{s.icon}</span>
                <h3>{s.label}</h3>
              </div>
              <p className="stat-value">{s.value}</p>
            </Link>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
