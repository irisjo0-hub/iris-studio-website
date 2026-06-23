import React, { useEffect, useState } from 'react';
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
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const approved = bookings.filter((b) => b.status === 'approved').length;
  const totalGraduation = graduationOrders.length;

  const stats = [
    { label: 'إجمالي الحجوزات', value: totalBookings, className: 'card-purple' },
    { label: 'بانتظار المراجعة', value: pending, className: 'card-gold' },
    { label: 'الحجوزات المؤكدة', value: approved, className: 'card-green' },
    { label: 'طلبات دفاتر التخرج', value: totalGraduation, className: 'card-purple' },
  ];

  return (
    <AdminLayout>
      <section className="admin-dashboard">
        <h2 className="section-title">ملخص الإدارة</h2>
        <p className="section-subtitle">إحصائيات عامة ومؤشرات الأداء للموقع.</p>
        
        <div className="cards-grid">
          {stats.map((s, idx) => (
            <div key={idx} className={`card ${s.className}`}>
              <h3>{s.label}</h3>
              <p className="stat-value">{s.value}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
