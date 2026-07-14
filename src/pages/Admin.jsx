import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Admin root page – redirects to admin dashboard
const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default Admin;
