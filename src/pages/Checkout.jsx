import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Legacy print checkout route.
 * The active print ordering flow is handled inside PrintingProducts.jsx.
 * Keeping this route as a redirect prevents the old, non-authoritative checkout
 * from attempting to write directly to the database.
 */
const Checkout = () => <Navigate to="/printing-products" replace />;

export default Checkout;
