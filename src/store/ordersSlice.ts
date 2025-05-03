import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderItem {
  name: string;
  address: string;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
}

export interface Order {
  id: string;
  transportType?: 'person' | 'cargo';
  vehicleType?: string;
  carModel: string;
  pickupLocation: string;
  destination: string;
  items?: OrderItem[];
  status: 'pending' | 'in_progress' | 'en_route' | 'completed' | 'cancelled';
}

interface OrdersState {
  orders: Order[];
}

const initialState: OrdersState = {
  orders: [],
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Omit<Order, 'id' | 'status'>>) => {
      const newOrder: Order = {
        ...action.payload,
        id: Date.now().toString(),
        status: 'pending'
      };
      state.orders.push(newOrder);
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string, status: Order['status'] }>) => {
      const order = state.orders.find(order => order.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
    }
  }
});

export const { addOrder, updateOrderStatus, removeOrder } = ordersSlice.actions;
export default ordersSlice.reducer; 