import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

const App = () => (
  <SiteSettingsProvider>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </SiteSettingsProvider>
);

export default App;
