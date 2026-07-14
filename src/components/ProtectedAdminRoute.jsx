import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ProtectedAdminRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAdmin = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          if (active) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin');
        if (rpcError || !isAdmin) {
          if (active) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        if (active) {
          setAuthorized(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Admin verification error:', err);
        if (active) {
          setAuthorized(false);
          setLoading(false);
        }
      }
    };

    checkAdmin();

    return () => {
      active = false;
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

  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
