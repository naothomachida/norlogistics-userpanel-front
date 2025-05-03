import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { updateOrderStatus, removeOrder } from '../../../store/ordersSlice';
import Header from '../../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import './order-list.css';

const OrderList: React.FC = () => {
  const orders = useSelector((state: RootState) => state.orders.orders);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const handleStatusChange = (id: string, newStatus: 'pending' | 'in_progress' | 'en_route' | 'completed' | 'cancelled') => {
    dispatch(updateOrderStatus({ id, status: newStatus }));
  };

  const handleRemoveOrder = (id: string) => {
    dispatch(removeOrder(id));
  };

  return (
    <div className="orders-page">
      <Header />
      <div className="orders-content">
        <main className="orders-main">
          <div className="orders-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <h1 className="orders-title">Orders</h1>
              <span className="orders-title-count">{orders.length}</span>
            </div>
            <div className="action-buttons">
              <button 
                className="action-button"
                onClick={() => navigate('/orders/new')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Create Order
              </button>
              <button className="action-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                </svg>
                Export
              </button>
            </div>
          </div>

          <div className="orders-filters">
            <div className="filter-group">
              <span>Status: All</span>
            </div>
            <div className="filter-group date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="#777" />
              </svg>
              <span style={{ marginLeft: '8px' }}>All dates</span>
            </div>
            <div className="filter-spacer"></div>
            <div className="search-input">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
              </svg>
              <input type="text" placeholder="Search orders" />
            </div>
            <div className="filter-group">
              <span>Filters (0)</span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="no-orders">
              <p>No orders found. Create a new order to get started.</p>
              <button 
                className="action-button" 
                style={{ margin: '1rem auto', display: 'flex' }}
                onClick={() => navigate('/orders/new')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Create Order
              </button>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Car Model</th>
                    <th>Pickup Location</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th style={{textAlign: 'center'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.carModel}</td>
                      <td>{order.pickupLocation}</td>
                      <td>{order.destination}</td>
                      <td>
                        <div className="status-select">
                          <select 
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                            className={`status-${order.status}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="en_route">En Route</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="action-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                            </svg>
                          </button>
                          <button className="action-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
                            </svg>
                          </button>
                          <button 
                            className="action-icon" 
                            onClick={() => handleRemoveOrder(order.id)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderList; 