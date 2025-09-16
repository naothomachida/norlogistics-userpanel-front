import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  license: string;
  status: 'active' | 'inactive';
}

interface DriversState {
  drivers: Driver[];
}

// Dados iniciais de motoristas para exemplo
const initialState: DriversState = {
  drivers: [
    { id: '1', name: 'Rafael Gomes', email: 'rafael.gomes@example.com', phone: '(11) 99123-4567', license: 'AB', status: 'active' },
    { id: '2', name: 'Fernanda Lima', email: 'fernanda.lima@example.com', phone: '(11) 98765-4321', license: 'D', status: 'active' },
    { id: '3', name: 'Pedro Santos', email: 'pedro.santos@example.com', phone: '(21) 99876-5432', license: 'E', status: 'inactive' },
    { id: '4', name: 'Carolina Oliveira', email: 'carolina.oliveira@example.com', phone: '(31) 97654-3210', license: 'AD', status: 'active' },
  ]
};

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    addDriver: (state, action: PayloadAction<Omit<Driver, 'id'>>) => {
      const newId = (Math.max(...state.drivers.map(driver => parseInt(driver.id))) + 1).toString();
      state.drivers.push({
        id: newId,
        ...action.payload
      });
    },
    updateDriver: (state, action: PayloadAction<Driver>) => {
      const index = state.drivers.findIndex(driver => driver.id === action.payload.id);
      if (index !== -1) {
        state.drivers[index] = action.payload;
      }
    },
    removeDriver: (state, action: PayloadAction<string>) => {
      state.drivers = state.drivers.filter(driver => driver.id !== action.payload);
    },
    updateDriverStatus: (state, action: PayloadAction<{ id: string, status: 'active' | 'inactive' }>) => {
      const { id, status } = action.payload;
      const driver = state.drivers.find(driver => driver.id === id);
      if (driver) {
        driver.status = status;
      }
    },
  },
});

export const { addDriver, updateDriver, removeDriver, updateDriverStatus } = driversSlice.actions;
export default driversSlice.reducer; 