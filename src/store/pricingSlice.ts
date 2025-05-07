import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CityPair {
  id: string;
  fromCity: string;
  fromState: string;
  toCity: string;
  toState: string;
  minimumPrice: number;
}

export interface PricingState {
  kmRate: number;
  cityPairs: CityPair[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PricingState = {
  kmRate: 2.50,  // Valor padrão por km
  cityPairs: [
    {
      id: '1',
      fromCity: 'São Paulo',
      fromState: 'SP',
      toCity: 'Campinas',
      toState: 'SP',
      minimumPrice: 180.00
    },
    {
      id: '2',
      fromCity: 'São Paulo',
      fromState: 'SP',
      toCity: 'Ribeirão Preto',
      toState: 'SP',
      minimumPrice: 350.00
    },
    {
      id: '3',
      fromCity: 'Campinas',
      fromState: 'SP',
      toCity: 'Ribeirão Preto',
      toState: 'SP',
      minimumPrice: 250.00
    }
  ],
  isLoading: false,
  error: null
};

const pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {
    setKmRate: (state, action: PayloadAction<number>) => {
      state.kmRate = action.payload;
    },
    
    addCityPair: (state, action: PayloadAction<Omit<CityPair, 'id'>>) => {
      const newCityPair: CityPair = {
        ...action.payload,
        id: Date.now().toString()
      };
      state.cityPairs.push(newCityPair);
    },
    
    updateCityPair: (state, action: PayloadAction<{ id: string, updates: Partial<CityPair> }>) => {
      const { id, updates } = action.payload;
      const cityPair = state.cityPairs.find(pair => pair.id === id);
      if (cityPair) {
        Object.assign(cityPair, updates);
      }
    },
    
    removeCityPair: (state, action: PayloadAction<string>) => {
      state.cityPairs = state.cityPairs.filter(
        cityPair => cityPair.id !== action.payload
      );
    },
    
    // Used for loading state management
    setPricingLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setPricingError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { 
  setKmRate, 
  addCityPair, 
  updateCityPair, 
  removeCityPair,
  setPricingLoading,
  setPricingError
} = pricingSlice.actions;

export default pricingSlice.reducer; 