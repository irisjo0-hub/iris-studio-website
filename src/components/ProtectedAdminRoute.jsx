import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedAdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;
    const verifyAdmin = async () => {
      if (!active) return;
      setLoading(true);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          if (active) { setAuthorized(false); setLoading(false); }
          return;
        }

        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
        if (rpcError) throw rpcError;
        if (!isAdmin) {
          if (active) { setAuthorized(false); setLoading(false); }
          return;
        }

        if (active) {
          setAuthorized(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Admin verification error:', err);
        if (active) {
          // Do not log the admin out because of a transient tab/network/RPC failure.
          setLoading(false);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      if (!session) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void verifyAdmin();
      }
    });

    void verifyAdmin();

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#ECEBE7' }}>
        <div className="admin-loading" style={{ fontFamily: 'sans-serif', color: '#6F2477', fontSize: '1.25rem' }}>
          جاري التحقق من صلاحيات المسؤول...
        </div>
      </div>
    );
  }

  if (!authorized) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

export default ProtectedAdminRoute;
