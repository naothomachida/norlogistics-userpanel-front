import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockOrders } from '../data/mockOrders';

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
  isToll?: boolean;
  tollValue?: number;
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
  status: 'pending' | 'in_progress' | 'en_route' | 'completed' | 'cancelled' | 'approved';
  userId: string;
  driverId?: string;
  approvedBy?: string;
  driverPayment?: {
    amount: number;
    percentage?: number;
  };
  extraFinancialEntries?: {
    id: string;
    description: string;
    amount: number;
    type: 'increase' | 'decrease';
  }[];
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
    tollsTotal?: number;
  };
}

interface OrdersState {
  orders: Order[];
}

const initialState: OrdersState = {
  orders: mockOrders,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Omit<Order, 'id'> & { userId: string, status?: Order['status'], approvedBy?: string }>) => {
      const newOrder: Order = {
        ...action.payload,
        id: Date.now().toString(),
        status: action.payload.status || 'pending'
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
    updateDriverPayment: (state, action: PayloadAction<{ orderId: string, amount: number }>) => {
      const order = state.orders.find(order => order.id === action.payload.orderId);
      if (order && order.pricing) {
        const percentage = (action.payload.amount / order.pricing.finalPrice) * 100;
        order.driverPayment = {
          amount: action.payload.amount,
          percentage: Number(percentage.toFixed(2))
        };
      }
    },
    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
    },
    addExtraFinancialEntry: (state, action: PayloadAction<{ 
      orderId: string, 
      entry: { 
        description: string, 
        amount: number, 
        type: 'increase' | 'decrease' 
      } 
    }>) => {
      const order = state.orders.find(order => order.id === action.payload.orderId);
      if (order) {
        if (!order.extraFinancialEntries) {
          order.extraFinancialEntries = [];
        }
        
        order.extraFinancialEntries.push({
          id: Date.now().toString(),
          ...action.payload.entry
        });
      }
    },
    removeExtraFinancialEntry: (state, action: PayloadAction<{ 
      orderId: string, 
      entryId: string 
    }>) => {
      const order = state.orders.find(order => order.id === action.payload.orderId);
      if (order && order.extraFinancialEntries) {
        order.extraFinancialEntries = order.extraFinancialEntries.filter(
          entry => entry.id !== action.payload.entryId
        );
      }
    }
  }
});

export const { 
  addOrder, 
  updateOrderStatus, 
  assignDriverToOrder, 
  updateDriverPayment, 
  removeOrder,
  addExtraFinancialEntry,
  removeExtraFinancialEntry
} = ordersSlice.actions;
export default ordersSlice.reducer; 