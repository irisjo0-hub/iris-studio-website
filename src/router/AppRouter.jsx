import { lazy, Suspense } from 'react';

const lazyRetry = (importer) =>
  lazy(() =>
    importer()
      .then((module) => {
        try { sessionStorage.removeItem('iris-chunk-reload'); } catch {}
        return module;
      })
      .catch((error) => {
        const message = String(error?.message || error || '');
        const isChunkError =
          /dynamically imported module|failed to fetch|importing a module script/i.test(message);

        if (isChunkError) {
          try {
            if (!sessionStorage.getItem('iris-chunk-reload')) {
              sessionStorage.setItem('iris-chunk-reload', '1');
              window.location.reload();
              return new Promise(() => {});
            }
            sessionStorage.removeItem('iris-chunk-reload');
          } catch {}
        }
        throw error;
      })
  );
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedAdminRoute from '../components/ProtectedAdminRoute';
import ProtectedRepresentativeRoute from '../components/ProtectedRepresentativeRoute';

// Keep the landing shell eager; load secondary routes on demand so the initial
// bundle does not pull every customer/admin page into the first render.
import Home from '../pages/Home';
import AdminLogin from '../pages/AdminLogin';
import NotFound from '../pages/NotFound';

const Work = lazyRetry(() => import('../pages/Work'));
const Packages = lazyRetry(() => import('../pages/Packages'));
const GraduationBooks = lazyRetry(() => import('../pages/GraduationBooks'));
const GraduationBookOrder = lazyRetry(() => import('../pages/GraduationBookOrder'));
const TemplatesGallery = lazyRetry(() => import('../pages/TemplatesGallery'));
const Booking = lazyRetry(() => import('../pages/Booking'));
const PrintingProducts = lazyRetry(() => import('../pages/PrintingProducts'));
const ProductPhotography = lazyRetry(() => import('../pages/ProductPhotography'));
const OutdoorPhotography = lazyRetry(() => import('../pages/OutdoorPhotography'));
const Events = lazyRetry(() => import('../pages/Events'));
const GraduationPackage = lazyRetry(() => import('../pages/GraduationPackage'));
const MediaPortal = lazyRetry(() => import('../pages/MediaPortal'));
const StudioPortal = lazyRetry(() => import('../pages/StudioPortal'));
const PrintPortal = lazyRetry(() => import('../pages/PrintPortal'));
const Checkout = lazyRetry(() => import('../pages/Checkout'));

const Admin = lazyRetry(() => import('../pages/Admin'));
const AdminDashboard = lazyRetry(() => import('../pages/AdminDashboard'));
const AdminBookings = lazyRetry(() => import('../pages/AdminBookings'));
const AdminSchedule = lazyRetry(() => import('../pages/AdminSchedule'));
const AdminGraduationOrders = lazyRetry(() => import('../pages/AdminGraduationOrders'));
const AdminWork = lazyRetry(() => import('../pages/AdminWork'));
const AdminPackages = lazyRetry(() => import('../pages/AdminPackages'));
const AdminTemplates = lazyRetry(() => import('../pages/AdminTemplates'));
const AdminExtras = lazyRetry(() => import('../pages/AdminExtras'));
const AdminBookExtras = lazyRetry(() => import('../pages/AdminBookExtras'));
const AdminOffers = lazyRetry(() => import('../pages/AdminOffers'));
const AdminProducts = lazyRetry(() => import('../pages/AdminProducts'));
const AdminPrintingOrders = lazyRetry(() => import('../pages/AdminPrintingOrders'));
const AdminSettings = lazyRetry(() => import('../pages/AdminSettings'));
const AdminFlow = lazyRetry(() => import('../pages/AdminFlow'));
const AdminFlowFeedback = lazyRetry(() => import('../pages/AdminFlowFeedback'));
const AdminRepresentatives = lazyRetry(() => import('../pages/AdminRepresentatives'));
const RepresentativeLogin = lazyRetry(() => import('../pages/RepresentativeLogin'));
const RepresentativeResetPassword = lazyRetry(() => import('../pages/RepresentativeResetPassword'));
const RepresentativeDashboard = lazyRetry(() => import('../pages/RepresentativeDashboard'));
const RepresentativeSales = lazyRetry(() => import('../pages/RepresentativeSales'));
const RepresentativeWithdrawals = lazyRetry(() => import('../pages/RepresentativeWithdrawals'));
const RepresentativeProfile = lazyRetry(() => import('../pages/RepresentativeProfile'));

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
      <Route path="/representative/login" element={<RepresentativeLogin />} />
      <Route path="/representative/reset-password" element={<RepresentativeResetPassword />} />

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
        <Route path="/admin/representatives" element={<AdminRepresentatives />} />
      </Route>

      <Route element={<ProtectedRepresentativeRoute />}>
        <Route path="/representative/dashboard" element={<RepresentativeDashboard />} />
        <Route path="/representative/sales" element={<RepresentativeSales />} />
        <Route path="/representative/withdrawals" element={<RepresentativeWithdrawals />} />
        <Route path="/representative/profile" element={<RepresentativeProfile />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AppRouter;
