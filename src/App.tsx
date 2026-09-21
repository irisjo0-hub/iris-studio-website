import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { CartProvider } from './context/CartContext';

const AppContent = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </CartProvider>
  );
};

const App = () => (
  <SiteSettingsProvider>
    <AppContent />
  </SiteSettingsProvider>
);

export default App;
