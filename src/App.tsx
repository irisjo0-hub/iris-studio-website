import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { CartProvider } from './context/CartContext';

type IrisWindow = Window & {
  hasPreloaded?: boolean;
};

const AppContent = () => {
  const irisWindow = window as IrisWindow;
  const [loading, setLoading] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    irisWindow.hasPreloaded = true;
    setLoading(false);
  }, [irisWindow]);

  useEffect(() => {
    if (loading) {
      document.body.classList.add('scroll-lock');
    } else {
      document.body.classList.remove('scroll-lock');
    }

    return () => {
      document.body.classList.remove('scroll-lock');
    };
  }, [loading]);

  return (
    <>
      {loading && <Preloader onComplete={handlePreloaderComplete} />}
      <CartProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </CartProvider>
    </>
  );
};

const App = () => (
  <SiteSettingsProvider>
    <AppContent />
  </SiteSettingsProvider>
);

export default App;
