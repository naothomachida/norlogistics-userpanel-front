import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import ordersReducer from './ordersSlice';
import pricingReducer from './pricingSlice';
import locationsReducer from './locationSlice';
import vehicleTypesReducer from './vehicleTypesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    pricing: pricingReducer,
    locations: locationsReducer,
    vehicleTypes: vehicleTypesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 