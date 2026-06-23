import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

// Admin root page – redirects based on authentication status
const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Render nothing as redirect will happen
  return (
    <AdminLayout>
      {/* Empty placeholder – redirects are handled in useEffect */}
    </AdminLayout>
  );
};

export default Admin;
