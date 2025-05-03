import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addOrder } from '../../../store/ordersSlice';

const OrderForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState({
    carModel: '',
    pickupLocation: '',
    destination: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Dispatch the new order to Redux store
    dispatch(addOrder({
      carModel: orderDetails.carModel,
      pickupLocation: orderDetails.pickupLocation,
      destination: orderDetails.destination,
    }));

    // Reset form and navigate to orders list
    setOrderDetails({
      carModel: '',
      pickupLocation: '',
      destination: '',
    });
    navigate('/orders');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Order</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <div>
          <label htmlFor="carModel" className="block mb-2 font-semibold">Car Model</label>
          <input
            type="text"
            id="carModel"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={orderDetails.carModel}
            onChange={(e) => setOrderDetails({...orderDetails, carModel: e.target.value})}
            placeholder="Enter car model"
            required
          />
        </div>
        <div>
          <label htmlFor="pickupLocation" className="block mb-2 font-semibold">Pickup Location</label>
          <input
            type="text"
            id="pickupLocation"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={orderDetails.pickupLocation}
            onChange={(e) => setOrderDetails({...orderDetails, pickupLocation: e.target.value})}
            placeholder="Enter pickup location"
            required
          />
        </div>
        <div>
          <label htmlFor="destination" className="block mb-2 font-semibold">Destination</label>
          <input
            type="text"
            id="destination"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={orderDetails.destination}
            onChange={(e) => setOrderDetails({...orderDetails, destination: e.target.value})}
            placeholder="Enter destination"
            required
          />
        </div>
        <div className="flex space-x-4">
          <button 
            type="submit" 
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Create Order
          </button>
          <button 
            type="button"
            onClick={() => navigate('/orders')}
            className="flex-1 bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm; 