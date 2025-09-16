import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VehicleType {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  capacity?: number;
  maxWeight?: number; // em toneladas
}

interface VehicleTypesState {
  person: VehicleType[];
  cargo: VehicleType[];
  isLoading: boolean;
  error: string | null;
}

// Estado inicial com os tipos de veículos padrão
const initialState: VehicleTypesState = {
  person: [
    { id: 'basic', name: 'Básico', description: 'Econômico e compacto', capacity: 4 },
    { id: 'hatch', name: 'Hatch', description: 'Compacto e versátil', capacity: 4 },
    { id: 'sedan', name: 'Sedan', description: 'Confortável e espaçoso', capacity: 5 },
    { id: 'suv', name: 'SUV', description: 'Robusto e espaçoso', capacity: 5 },
    { id: 'suv_luxo', name: 'SUV Luxo', description: 'Luxuoso e confortável', capacity: 5 },
    { id: 'spin_7_lugares', name: 'Spin 7 Lugares', description: 'Espaçoso para família', capacity: 7 },
    { id: 'minibus', name: 'Microônibus', description: 'Para grupos pequenos', capacity: 16 },
    { id: 'bus', name: 'Ônibus', description: 'Para grupos grandes', capacity: 45 },
  ],
  cargo: [
    { id: 'van', name: 'Van', description: 'Cargas pequenas até 1 tonelada', maxWeight: 1 },
    { id: 'truck_small', name: 'Caminhão pequeno', description: '3/4, VUC, até 3 toneladas', maxWeight: 3 },
    { id: 'truck_medium', name: 'Caminhão médio', description: 'Toco, até 6 toneladas', maxWeight: 6 },
    { id: 'truck_large', name: 'Caminhão grande', description: 'Truck, até 12 toneladas', maxWeight: 12 },
    { id: 'truck_extra', name: 'Carreta', description: 'Cargas acima de 12 toneladas', maxWeight: 30 },
    { id: 'truck_special', name: 'Carreta especial', description: 'Cargas indivisíveis ou excedentes', maxWeight: 40 },
  ],
  isLoading: false,
  error: null
};

export const vehicleTypesSlice = createSlice({
  name: 'vehicleTypes',
  initialState,
  reducers: {
    // Adicionar um novo tipo de veículo para transporte de pessoas
    addPersonVehicleType: (state, action: PayloadAction<VehicleType>) => {
      state.person.push(action.payload);
    },
    
    // Adicionar um novo tipo de veículo para transporte de cargas
    addCargoVehicleType: (state, action: PayloadAction<VehicleType>) => {
      state.cargo.push(action.payload);
    },
    
    // Atualizar um tipo de veículo existente para transporte de pessoas
    updatePersonVehicleType: (state, action: PayloadAction<{ id: string, updates: Partial<VehicleType> }>) => {
      const { id, updates } = action.payload;
      const index = state.person.findIndex(vehicle => vehicle.id === id);
      if (index !== -1) {
        state.person[index] = { ...state.person[index], ...updates };
      }
    },
    
    // Atualizar um tipo de veículo existente para transporte de cargas
    updateCargoVehicleType: (state, action: PayloadAction<{ id: string, updates: Partial<VehicleType> }>) => {
      const { id, updates } = action.payload;
      const index = state.cargo.findIndex(vehicle => vehicle.id === id);
      if (index !== -1) {
        state.cargo[index] = { ...state.cargo[index], ...updates };
      }
    },
    
    // Remover um tipo de veículo para transporte de pessoas
    removePersonVehicleType: (state, action: PayloadAction<string>) => {
      state.person = state.person.filter(vehicle => vehicle.id !== action.payload);
    },
    
    // Remover um tipo de veículo para transporte de cargas
    removeCargoVehicleType: (state, action: PayloadAction<string>) => {
      state.cargo = state.cargo.filter(vehicle => vehicle.id !== action.payload);
    },
    
    // Definir o estado de carregamento
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // Definir um erro
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Reset para o estado inicial
    resetVehicleTypes: () => initialState
  }
});

export const {
  addPersonVehicleType,
  addCargoVehicleType,
  updatePersonVehicleType,
  updateCargoVehicleType,
  removePersonVehicleType,
  removeCargoVehicleType,
  setLoading,
  setError,
  resetVehicleTypes
} = vehicleTypesSlice.actions;

export default vehicleTypesSlice.reducer; 