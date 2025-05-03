import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { updateOrderStatus, removeOrder } from '../../../store/ordersSlice';

const OrderList: React.FC = () => {
  const orders = useSelector((state: RootState) => state.orders.orders);
  const dispatch: AppDispatch = useDispatch();

  const handleStatusChange = (id: string, newStatus: 'pending' | 'in_progress' | 'en_route' | 'completed' | 'cancelled') => {
    dispatch(updateOrderStatus({ id, status: newStatus }));
  };

  const handleRemoveOrder = (id: string) => {
    dispatch(removeOrder(id));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Orders List</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{order.carModel}</h2>
                <p>From: {order.pickupLocation}</p>
                <p>To: {order.destination}</p>
                <p className="font-bold">Status: 
                  <span 
                    className={`ml-2 px-2 py-1 rounded text-sm ${
                      order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      order.status === 'in_progress' ? 'bg-blue-200 text-blue-800' :
                      order.status === 'en_route' ? 'bg-green-200 text-green-800' :
                      order.status === 'completed' ? 'bg-green-500 text-white' :
                      'bg-red-200 text-red-800'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <select 
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                  className="p-2 border rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="en_route">En Route</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button 
                  onClick={() => handleRemoveOrder(order.id)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList; 