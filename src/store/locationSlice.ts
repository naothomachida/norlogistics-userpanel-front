import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  isCompany?: boolean;
}

interface LocationsState {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
}

// Estado inicial com locais padrão
const initialState: LocationsState = {
  locations: [
    { 
      id: 'lenovo-sorocaba', 
      name: 'Lenovo Sorocaba', 
      address: 'Av. Jerome Case, 2600', 
      city: 'Sorocaba', 
      state: 'SP',
      zipCode: '18087-220',
      isCompany: true
    },
    { 
      id: 'lenovo-indaiatuba', 
      name: 'Lenovo Indaiatuba', 
      address: 'Rod. Engenheiro Ermênio de Oliveira Penteado, Km 57,5', 
      city: 'Indaiatuba', 
      state: 'SP',
      zipCode: '13337-300',
      isCompany: true
    }
  ],
  isLoading: false,
  error: null
};

const locationSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    addLocation: (state, action: PayloadAction<Location>) => {
      // Verificar se já existe uma localização com mesmo ID
      const exists = state.locations.some(loc => loc.id === action.payload.id);
      if (!exists) {
        state.locations.push(action.payload);
      }
    },
    updateLocation: (state, action: PayloadAction<{id: string, updates: Partial<Location>}>) => {
      const { id, updates } = action.payload;
      const locationIndex = state.locations.findIndex(loc => loc.id === id);
      
      if (locationIndex !== -1) {
        state.locations[locationIndex] = {
          ...state.locations[locationIndex],
          ...updates
        };
      }
    },
    removeLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter(loc => loc.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { 
  addLocation, 
  updateLocation, 
  removeLocation,
  setLoading,
  setError
} = locationSlice.actions;

export default locationSlice.reducer; 