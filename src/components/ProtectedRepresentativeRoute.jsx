import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedRepresentativeRoute = () => {
  const [state, setState] = useState('loading');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (mounted) setState('unauthenticated'); return; }
      const { data: rep, error } = await supabase.from('representatives')
        .select('user_id,status').eq('user_id', user.id).eq('status', 'active').maybeSingle();
      if (mounted) setState(!error && rep ? 'authorized' : 'unauthorized');
    })();
    return () => { mounted = false; };
  }, []);

  if (state === 'loading') return <div className="rep-route-loading">جارٍ التحقق من الحساب...</div>;
  if (state !== 'authorized') return <Navigate to="/representative/login" replace />;
  return <Outlet />;
};

export default ProtectedRepresentativeRoute;
