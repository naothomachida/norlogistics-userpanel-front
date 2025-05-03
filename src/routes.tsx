import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OrderList from './screens/orders/list';
import OrderForm from './screens/orders/form';
import Settings from './screens/settings';
import Users from './screens/users';
import Profile from './screens/profile';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/orders" element={<OrderList />} />
      <Route path="/orders/new" element={<OrderForm />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/users" element={<Users />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/" element={<Navigate to="/orders" replace />} />
    </Routes>
  );
};

export default AppRoutes; 