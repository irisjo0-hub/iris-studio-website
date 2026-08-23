import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { CartProvider } from './context/CartContext';

const App = () => (
  <SiteSettingsProvider>
    <CartProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </CartProvider>
  </SiteSettingsProvider>
);

export default App;
