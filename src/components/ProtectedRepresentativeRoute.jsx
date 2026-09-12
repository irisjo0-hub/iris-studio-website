import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const RETRY_DELAYS = [0, 400, 900, 1600];

const ProtectedRepresentativeRoute = () => {
  const [state, setState] = useState('loading');

  useEffect(() => {
    let mounted = true;
    let retryTimer;

    const verifyRepresentative = async (attempt = 0) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        if (mounted) {
          if (attempt < RETRY_DELAYS.length - 1) {
            retryTimer = window.setTimeout(() => verifyRepresentative(attempt + 1), RETRY_DELAYS[attempt + 1]);
          } else {
            retryTimer = window.setTimeout(() => verifyRepresentative(0), 3000);
          }
        }
        return;
      }

      if (!user) {
        if (mounted) setState('unauthenticated');
        return;
      }

      const { data: rep, error } = await supabase
        .from('representatives')
        .select('user_id,status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        if (mounted) {
          if (attempt < RETRY_DELAYS.length - 1) {
            retryTimer = window.setTimeout(() => verifyRepresentative(attempt + 1), RETRY_DELAYS[attempt + 1]);
          } else {
            setState('checking');
            retryTimer = window.setTimeout(() => verifyRepresentative(0), 3000);
          }
        }
        return;
      }

      if (mounted) setState(rep?.status === 'active' ? 'authorized' : 'unauthorized');
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        setState('unauthenticated');
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void verifyRepresentative();
      }
    });

    void verifyRepresentative();

    return () => {
      mounted = false;
      window.clearTimeout(retryTimer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (state === 'loading' || state === 'checking') {
    return <div className="rep-route-loading">جارٍ التحقق من الحساب...</div>;
  }

  if (state !== 'authorized') return <Navigate to="/representative/login" replace />;
  return <Outlet />;
};

export default ProtectedRepresentativeRoute;
