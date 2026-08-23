import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';

import Home                from '../pages/Home';
import Work                from '../pages/Work';
import Packages            from '../pages/Packages';
import GraduationBooks     from '../pages/GraduationBooks';
import GraduationBookOrder from '../pages/GraduationBookOrder';
import TemplatesGallery    from '../pages/TemplatesGallery';
import Booking             from '../pages/Booking';
import PrintingProducts    from '../pages/PrintingProducts';

// Flow Destination Minimal Placeholders
import ProductPhotography  from '../pages/ProductPhotography';
import OutdoorPhotography  from '../pages/OutdoorPhotography';
import Events              from '../pages/Events';
import GraduationPackage   from '../pages/GraduationPackage';
import NotFound            from '../pages/NotFound';
// 3 Main Division Portals
import MediaPortal         from '../pages/MediaPortal';
import StudioPortal        from '../pages/StudioPortal';
import PrintPortal         from '../pages/PrintPortal';

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
import AdminFlow               from '../pages/AdminFlow';
import AdminFlowFeedback       from '../pages/AdminFlowFeedback';

const AppRouter = () => (
  <Routes>
    {/* Customer routes wrapped in layout route */}
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

      {/* IRIS Flow Destination Routes */}
      <Route path="/product-photography"  element={<ProductPhotography />} />
      <Route path="/outdoor-photography"  element={<OutdoorPhotography />} />
      <Route path="/events"               element={<Events />} />
      <Route path="/graduation-package"   element={<GraduationPackage />} />

      {/* 3 Main Division Portals & Sub-routes */}
      <Route path="/media"                       element={<MediaPortal />} />
      <Route path="/media/*"                     element={<MediaPortal />} />

      <Route path="/studio"                      element={<StudioPortal />} />
      <Route path="/studio/sessions"             element={<Booking />} />
      <Route path="/studio/packages"             element={<Packages />} />
      <Route path="/studio/events"               element={<Events />} />
      <Route path="/studio/graduation"           element={<StudioPortal />} />
      <Route path="/studio/graduation/sessions"  element={<GraduationPackage />} />
      <Route path="/studio/graduation/notebooks" element={<GraduationBooks />} />
      <Route path="/studio/graduation/templates" element={<TemplatesGallery />} />
      <Route path="/studio/graduation/inner-pages" element={<TemplatesGallery />} />
      <Route path="/studio/graduation/order"     element={<GraduationBookOrder />} />
      <Route path="/studio/work"                 element={<Work />} />
      <Route path="/studio/faq"                  element={<StudioPortal />} />
      <Route path="/studio/contact"              element={<StudioPortal />} />
      <Route path="/studio/*"                    element={<StudioPortal />} />

      <Route path="/print"                       element={<PrintPortal />} />
      <Route path="/print/shop"                  element={<PrintingProducts />} />
      <Route path="/print/categories"            element={<PrintPortal />} />
      <Route path="/print/products"              element={<PrintingProducts />} />
      <Route path="/print/custom"                element={<PrintPortal />} />
      <Route path="/print/cart"                  element={<PrintPortal />} />
      <Route path="/print/checkout"              element={<PrintPortal />} />
      <Route path="/print/track"                 element={<PrintPortal />} />
      <Route path="/print/contact"               element={<PrintPortal />} />
      <Route path="/print/*"                     element={<PrintPortal />} />

      <Route path="*"                      element={<NotFound />} />
    </Route>

    {/* Public Admin Login Route */}
    <Route path="/admin/login"                  element={<AdminLogin />} />

    {/* Protected Admin routes */}
    <Route element={<ProtectedAdminRoute />}>
      <Route path="/admin"                        element={<Admin />} />
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
      <Route path="/admin/flow"                   element={<AdminFlow />} />
      <Route path="/admin/flow-feedback"          element={<AdminFlowFeedback />} />
      <Route path="/admin/settings"               element={<AdminSettings />} />
    </Route>
  </Routes>
);

export default AppRouter;
