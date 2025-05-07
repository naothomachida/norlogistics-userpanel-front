import { configureStore } from '@reduxjs/toolkit';
import ordersReducer from './ordersSlice';
import vehicleTypesReducer from './vehicleTypesSlice';
import locationReducer from './locationSlice';
import driversReducer from './driversSlice';
import pricingReducer from './pricingSlice';

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    vehicleTypes: vehicleTypesReducer,
    locations: locationReducer,
    drivers: driversReducer,
    pricing: pricingReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 