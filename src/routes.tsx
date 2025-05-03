import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OrderList from './screens/orders/list';
import OrderForm from './screens/orders/form';
import TransactionsPage from './screens/transactions';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/orders" element={<OrderList />} />
      <Route path="/orders/new" element={<OrderForm />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/" element={<div className="container mx-auto p-4">Welcome to Shipment Tracker</div>} />
    </Routes>
  );
};

export default AppRoutes; 