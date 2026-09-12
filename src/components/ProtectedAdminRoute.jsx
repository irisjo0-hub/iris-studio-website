import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const RETRY_DELAYS = [0, 400, 900, 1600];

const ProtectedAdminRoute = () => {
  const [state, setState] = useState('loading');

  useEffect(() => {
    let active = true;
    let retryTimer;

    const verifyAdmin = async (attempt = 0) => {
      if (!active) return;

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Admin session check failed:', sessionError);
        if (active) {
          if (attempt < RETRY_DELAYS.length - 1) {
            retryTimer = window.setTimeout(() => verifyAdmin(attempt + 1), RETRY_DELAYS[attempt + 1]);
          } else {
            // Keep the route open while the session still exists. The next
            // auth event/refresh will retry the authoritative admin check.
            setState('checking');
            retryTimer = window.setTimeout(() => verifyAdmin(0), 3000);
          }
        }
        return;
      }

      if (!session?.user) {
        if (active) setState('unauthenticated');
        return;
      }

      const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');

      if (rpcError) {
        console.error('Admin authorization check failed:', rpcError);
        if (active) {
          if (attempt < RETRY_DELAYS.length - 1) {
            retryTimer = window.setTimeout(() => verifyAdmin(attempt + 1), RETRY_DELAYS[attempt + 1]);
          } else {
            // Never redirect an authenticated admin because of a temporary
            // network/RPC failure. Retry in the background instead.
            setState('checking');
            retryTimer = window.setTimeout(() => verifyAdmin(0), 3000);
          }
        }
        return;
      }

      if (active) setState(isAdmin ? 'authorized' : 'unauthorized');
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'SIGNED_OUT' || !session) {
        setState('unauthenticated');
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void verifyAdmin();
      }
    });

    void verifyAdmin();

    return () => {
      active = false;
      window.clearTimeout(retryTimer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (state === 'loading' || state === 'checking') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#ECEBE7',
        }}
      >
        <div
          className="admin-loading"
          style={{
            fontFamily: 'sans-serif',
            color: '#6F2477',
            fontSize: '1.25rem',
          }}
        >
          {state === 'checking'
            ? 'جارٍ إعادة التحقق من جلسة المسؤول...'
            : 'جاري التحقق من صلاحيات المسؤول...'}
        </div>
      </div>
    );
  }

  if (state === 'unauthorized' || state === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
