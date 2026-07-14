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
import PrintingProducts    from '../pages/PrintingProducts';

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
import AdminOffers             from '../pages/AdminOffers';
import AdminProducts           from '../pages/AdminProducts';
import AdminPrintingOrders     from '../pages/AdminPrintingOrders';
import AdminSettings           from '../pages/AdminSettings';

const AppRouter = () => (
  <Routes>
    {/* Customer routes (RTL) wrapped in layout route to enable transition animations */}
    <Route element={<Layout />}>
      <Route path="/"                      element={<Home />} />
      <Route path="/work"                  element={<Work />} />
      <Route path="/packages"              element={<Packages />} />
      <Route path="/graduation-books"      element={<GraduationBooks />} />
      <Route path="/graduation-order"      element={<GraduationBookOrder />} />
      <Route path="/graduation-book-order" element={<GraduationBookOrder />} />
      <Route path="/templates"             element={<TemplatesGallery />} />
      <Route path="/booking"               element={<Booking />} />
      <Route path="/printing-products"     element={<PrintingProducts />} />
    </Route>

    {/* Admin routes */}
    <Route path="/admin"                        element={<Admin />} />
    <Route path="/admin/login"                  element={<AdminLogin />} />
    <Route path="/admin/dashboard"              element={<AdminDashboard />} />
    <Route path="/admin/bookings"               element={<AdminBookings />} />
    <Route path="/admin/schedule"               element={<AdminSchedule />} />
    <Route path="/admin/graduation-orders"      element={<AdminGraduationOrders />} />
    <Route path="/admin/printing-orders"        element={<AdminPrintingOrders />} />
    <Route path="/admin/work"                   element={<AdminWork />} />
    <Route path="/admin/packages"               element={<AdminPackages />} />
    <Route path="/admin/offers"                 element={<AdminOffers />} />
    <Route path="/admin/printing-products"      element={<AdminProducts />} />
    <Route path="/admin/templates"              element={<AdminTemplates />} />
    <Route path="/admin/extras"                 element={<AdminExtras />} />
    <Route path="/admin/book-extras"            element={<AdminBookExtras />} />
    <Route path="/admin/settings"               element={<AdminSettings />} />
  </Routes>
);

export default AppRouter;
