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

export interface RoutePoint {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  fullAddress?: string;
  isCompany?: boolean;
  isLastPassenger?: boolean;
  locationType?: 'airport' | 'hotel' | 'other';
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  phone?: string;
}

export interface Order {
  id: string;
  transportType: 'person' | 'cargo';
  vehicleType: string;
  carModel?: string;
  pickupLocation: string;
  destination: string;
  startLocationId: string;
  endLocationId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  driverId?: string;
  items: {
    name: string;
    address: string;
    weight?: string;
    dimensions?: {
      length: string;
      width: string;
      height: string;
    };
  }[];
  routePoints?: RoutePoint[];
  routeDistance?: {
    totalDistance: number;
    totalDuration: number;
    totalSteps: number;
    distanceDetails: {
      from: string;
      to: string;
      distance: number;
      duration: number;
    }[];
  };
  pricing?: {
    kmRate: number;
    kmBasedPrice: number;
    minimumPrice: number | null;
    finalPrice: number;
  };
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
    assignDriverToOrder: (state, action: PayloadAction<{ orderId: string, driverId: string }>) => {
      const order = state.orders.find(order => order.id === action.payload.orderId);
      if (order) {
        order.driverId = action.payload.driverId;
      }
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
    }
  }
});

export const { addOrder, updateOrderStatus, assignDriverToOrder, removeOrder } = ordersSlice.actions;
export default ordersSlice.reducer; 