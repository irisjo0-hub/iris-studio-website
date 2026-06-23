import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';

import Home                from '../pages/Home';
import Work                from '../pages/Work';
import Packages            from '../pages/Packages';
import GraduationBooks     from '../pages/GraduationBooks';
import GraduationBookOrder from '../pages/GraduationBookOrder';
import TemplatesGallery    from '../pages/TemplatesGallery';
import Booking             from '../pages/Booking';

import Admin                   from '../pages/Admin';
import AdminLogin              from '../pages/AdminLogin';
import AdminDashboard          from '../pages/AdminDashboard';
import AdminBookings           from '../pages/AdminBookings';
import AdminSchedule           from '../pages/AdminSchedule';
import AdminGraduationOrders   from '../pages/AdminGraduationOrders';
import AdminWork               from '../pages/AdminWork';
import AdminPackages           from '../pages/AdminPackages';
import AdminTemplates          from '../pages/AdminTemplates';
import AdminExtras             from '../pages/AdminExtras';
import AdminBookExtras         from '../pages/AdminBookExtras';

const AppRouter = () => (
  <Routes>
    {/* Customer routes (RTL) */}
    <Route path="/"                     element={<Layout><Home /></Layout>} />
    <Route path="/work"                 element={<Layout><Work /></Layout>} />
    <Route path="/packages"             element={<Layout><Packages /></Layout>} />
    <Route path="/graduation-books"     element={<Layout><GraduationBooks /></Layout>} />
    <Route path="/graduation-order"     element={<Layout><GraduationBookOrder /></Layout>} />
    <Route path="/graduation-book-order" element={<Layout><GraduationBookOrder /></Layout>} />
    <Route path="/templates"            element={<Layout><TemplatesGallery /></Layout>} />
    <Route path="/booking"              element={<Layout><Booking /></Layout>} />

    {/* Admin routes */}
    <Route path="/admin"                        element={<Admin />} />
    <Route path="/admin/login"                  element={<AdminLogin />} />
    <Route path="/admin/dashboard"              element={<AdminDashboard />} />
    <Route path="/admin/bookings"               element={<AdminBookings />} />
    <Route path="/admin/schedule"               element={<AdminSchedule />} />
    <Route path="/admin/graduation-orders"      element={<AdminGraduationOrders />} />
    <Route path="/admin/work"                   element={<AdminWork />} />
    <Route path="/admin/packages"               element={<AdminPackages />} />
    <Route path="/admin/templates"              element={<AdminTemplates />} />
    <Route path="/admin/extras"                 element={<AdminExtras />} />
    <Route path="/admin/book-extras"            element={<AdminBookExtras />} />
  </Routes>
);

export default AppRouter;
