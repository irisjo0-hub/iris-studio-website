import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';

// Keep the landing shell eager; load secondary routes on demand so the initial
// bundle does not pull every customer/admin page into the first render.
import Home from '../pages/Home';
import AdminLogin from '../pages/AdminLogin';
import NotFound from '../pages/NotFound';

const Work = lazy(() => import('../pages/Work'));
const Packages = lazy(() => import('../pages/Packages'));
const GraduationBooks = lazy(() => import('../pages/GraduationBooks'));
const GraduationBookOrder = lazy(() => import('../pages/GraduationBookOrder'));
const TemplatesGallery = lazy(() => import('../pages/TemplatesGallery'));
const Booking = lazy(() => import('../pages/Booking'));
const PrintingProducts = lazy(() => import('../pages/PrintingProducts'));
const ProductPhotography = lazy(() => import('../pages/ProductPhotography'));
const OutdoorPhotography = lazy(() => import('../pages/OutdoorPhotography'));
const Events = lazy(() => import('../pages/Events'));
const GraduationPackage = lazy(() => import('../pages/GraduationPackage'));
const MediaPortal = lazy(() => import('../pages/MediaPortal'));
const StudioPortal = lazy(() => import('../pages/StudioPortal'));
const PrintPortal = lazy(() => import('../pages/PrintPortal'));
const Checkout = lazy(() => import('../pages/Checkout'));

const Admin = lazy(() => import('../pages/Admin'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminBookings = lazy(() => import('../pages/AdminBookings'));
const AdminSchedule = lazy(() => import('../pages/AdminSchedule'));
const AdminGraduationOrders = lazy(() => import('../pages/AdminGraduationOrders'));
const AdminWork = lazy(() => import('../pages/AdminWork'));
const AdminPackages = lazy(() => import('../pages/AdminPackages'));
const AdminTemplates = lazy(() => import('../pages/AdminTemplates'));
const AdminExtras = lazy(() => import('../pages/AdminExtras'));
const AdminBookExtras = lazy(() => import('../pages/AdminBookExtras'));
const AdminOffers = lazy(() => import('../pages/AdminOffers'));
const AdminProducts = lazy(() => import('../pages/AdminProducts'));
const AdminPrintingOrders = lazy(() => import('../pages/AdminPrintingOrders'));
const AdminSettings = lazy(() => import('../pages/AdminSettings'));
const AdminFlow = lazy(() => import('../pages/AdminFlow'));
const AdminFlowFeedback = lazy(() => import('../pages/AdminFlowFeedback'));

const AppRouter = () => (
  <Suspense fallback={null}>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/graduation-books" element={<GraduationBooks />} />
        <Route path="/graduation-order" element={<GraduationBookOrder />} />
        <Route path="/graduation-book-order" element={<GraduationBookOrder />} />
        <Route path="/templates" element={<TemplatesGallery />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/printing-products" element={<PrintingProducts />} />

        <Route path="/product-photography" element={<ProductPhotography />} />
        <Route path="/outdoor-photography" element={<OutdoorPhotography />} />
        <Route path="/events" element={<Events />} />
        <Route path="/graduation-package" element={<GraduationPackage />} />

        <Route path="/media" element={<MediaPortal />} />
        <Route path="/media/*" element={<MediaPortal />} />

        <Route path="/studio" element={<StudioPortal />} />
        <Route path="/studio/sessions" element={<Booking />} />
        <Route path="/studio/packages" element={<Packages />} />
        <Route path="/studio/events" element={<Events />} />
        <Route path="/studio/graduation" element={<StudioPortal />} />
        <Route path="/studio/graduation/sessions" element={<GraduationPackage />} />
        <Route path="/studio/graduation/notebooks" element={<GraduationBooks />} />
        <Route path="/studio/graduation/templates" element={<TemplatesGallery />} />
        <Route path="/studio/graduation/inner-pages" element={<TemplatesGallery />} />
        <Route path="/studio/graduation/order" element={<GraduationBookOrder />} />
        <Route path="/studio/work" element={<Work />} />
        <Route path="/studio/faq" element={<StudioPortal />} />
        <Route path="/studio/contact" element={<StudioPortal />} />
        <Route path="/studio/*" element={<StudioPortal />} />

        <Route path="/print" element={<PrintPortal />} />
        <Route path="/print/shop" element={<PrintingProducts />} />
        <Route path="/print/categories" element={<PrintPortal />} />
        <Route path="/print/products" element={<PrintingProducts />} />
        <Route path="/print/custom" element={<PrintPortal />} />
        <Route path="/print/cart" element={<PrintPortal />} />
        <Route path="/print/checkout" element={<Checkout />} />
        <Route path="/print/track" element={<PrintPortal />} />
        <Route path="/print/contact" element={<PrintPortal />} />
        <Route path="/print/*" element={<PrintPortal />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/schedule" element={<AdminSchedule />} />
        <Route path="/admin/graduation-orders" element={<AdminGraduationOrders />} />
        <Route path="/admin/printing-orders" element={<AdminPrintingOrders />} />
        <Route path="/admin/work" element={<AdminWork />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        <Route path="/admin/offers" element={<AdminOffers />} />
        <Route path="/admin/printing-products" element={<AdminProducts />} />
        <Route path="/admin/templates" element={<AdminTemplates />} />
        <Route path="/admin/extras" element={<AdminExtras />} />
        <Route path="/admin/book-extras" element={<AdminBookExtras />} />
        <Route path="/admin/flow" element={<AdminFlow />} />
        <Route path="/admin/flow-feedback" element={<AdminFlowFeedback />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AppRouter;
