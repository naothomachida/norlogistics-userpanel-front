import { Order } from '../store/ordersSlice';

// Lista de ordens de exemplo para testes
export const mockOrders: Order[] = [
  {
    id: '1677056400000', // 22/02/2023
    transportType: 'person',
    vehicleType: 'sedan',
    carModel: 'Toyota Corolla',
    pickupLocation: 'Aeroporto de Congonhas',
    destination: 'Hotel Pullman',
    startLocationId: 'airport_congonhas',
    endLocationId: 'hotel_pullman',
    status: 'pending',
    userId: 'user1', // Admin
    driverId: 'user5', // Atribuído ao motorista
    items: [],
    routePoints: [
      {
        id: 'airport_congonhas',
        name: 'Aeroporto de Congonhas',
        address: 'Av. Washington Luís, s/n - Vila Congonhas',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Washington Luís, s/n - Vila Congonhas, São Paulo - SP',
        locationType: 'airport'
      },
      {
        id: 'hotel_pullman',
        name: 'Hotel Pullman',
        address: 'Rua Joinville, 515 - Vila Mariana',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Rua Joinville, 515 - Vila Mariana, São Paulo - SP',
        locationType: 'hotel'
      }
    ],
    routeDistance: {
      totalDistance: 12.5,
      totalDuration: 35,
      totalSteps: 1,
      distanceDetails: [
        {
          from: 'Aeroporto de Congonhas',
          to: 'Hotel Pullman',
          distance: 12.5,
          duration: 35
        }
      ]
    },
    pricing: {
      kmRate: 4.5,
      kmBasedPrice: 56.25,
      minimumPrice: 50,
      finalPrice: 56.25
    }
  },
  {
    id: '1677142800000', // 23/02/2023
    transportType: 'cargo',
    vehicleType: 'truck_medium',
    carModel: 'Mercedes-Benz',
    pickupLocation: 'Centro de Distribuição Zona Leste',
    destination: 'Lojas ABC - Shopping Center Norte',
    startLocationId: 'cd_zona_leste',
    endLocationId: 'lojas_abc_center_norte',
    status: 'pending',
    userId: 'user3', // Usuário comum
    driverId: 'user5', // Atribuído ao motorista
    items: [
      {
        name: 'Produtos eletrônicos',
        address: 'Centro de Distribuição Zona Leste',
        weight: '350kg',
        dimensions: {
          length: '120cm',
          width: '80cm',
          height: '100cm'
        }
      }
    ],
    routePoints: [
      {
        id: 'cd_zona_leste',
        name: 'Centro de Distribuição Zona Leste',
        address: 'Av. Aricanduva, 5000',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Aricanduva, 5000, São Paulo - SP',
        isCompany: true
      },
      {
        id: 'lojas_abc_center_norte',
        name: 'Lojas ABC - Shopping Center Norte',
        address: 'Travessa Casalbuono, 120',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Travessa Casalbuono, 120, São Paulo - SP',
        isCompany: true
      }
    ],
    routeDistance: {
      totalDistance: 22.3,
      totalDuration: 55,
      totalSteps: 1,
      distanceDetails: [
        {
          from: 'Centro de Distribuição Zona Leste',
          to: 'Lojas ABC - Shopping Center Norte',
          distance: 22.3,
          duration: 55
        }
      ]
    },
    pricing: {
      kmRate: 6.5,
      kmBasedPrice: 144.95,
      minimumPrice: 100,
      finalPrice: 144.95
    }
  },
  {
    id: '1677229200000', // 24/02/2023
    transportType: 'person',
    vehicleType: 'minibus',
    carModel: 'Mercedes-Benz Sprinter',
    pickupLocation: 'Hotel Mercure',
    destination: 'Centro de Convenções Anhembi',
    startLocationId: 'hotel_mercure',
    endLocationId: 'anhembi',
    status: 'pending',
    userId: 'user2', // Gerente
    items: [],
    routePoints: [
      {
        id: 'hotel_mercure',
        name: 'Hotel Mercure',
        address: 'Rua São Carlos do Pinhal, 87',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Rua São Carlos do Pinhal, 87, São Paulo - SP',
        locationType: 'hotel'
      },
      {
        id: 'anhembi',
        name: 'Centro de Convenções Anhembi',
        address: 'Av. Olavo Fontoura, 1209',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Olavo Fontoura, 1209, São Paulo - SP',
        isCompany: true
      }
    ],
    routeDistance: {
      totalDistance: 14.8,
      totalDuration: 40,
      totalSteps: 1,
      distanceDetails: [
        {
          from: 'Hotel Mercure',
          to: 'Centro de Convenções Anhembi',
          distance: 14.8,
          duration: 40
        }
      ]
    },
    pricing: {
      kmRate: 7.5,
      kmBasedPrice: 111.0,
      minimumPrice: 90,
      finalPrice: 111.0
    }
  },
  {
    id: '1677574800000', // 28/02/2023
    transportType: 'person',
    vehicleType: 'sedan',
    carModel: 'Toyota Corolla',
    pickupLocation: 'Aeroporto de Guarulhos',
    destination: 'Hotel Renaissance',
    startLocationId: 'airport_guarulhos',
    endLocationId: 'hotel_renaissance',
    status: 'pending',
    userId: 'user4', // Usuário gerenciado pelo gerente
    driverId: 'user5', // Atribuído ao motorista
    items: [],
    routePoints: [
      {
        id: 'airport_guarulhos',
        name: 'Aeroporto Internacional de Guarulhos',
        address: 'Rod. Hélio Smidt, s/n',
        city: 'Guarulhos',
        state: 'SP',
        fullAddress: 'Rod. Hélio Smidt, s/n, Guarulhos - SP',
        locationType: 'airport'
      },
      {
        id: 'hotel_renaissance',
        name: 'Hotel Renaissance',
        address: 'Alameda Santos, 2233',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Alameda Santos, 2233, São Paulo - SP',
        locationType: 'hotel'
      }
    ],
    routeDistance: {
      totalDistance: 28.5,
      totalDuration: 75,
      totalSteps: 1,
      distanceDetails: [
        {
          from: 'Aeroporto Internacional de Guarulhos',
          to: 'Hotel Renaissance',
          distance: 28.5,
          duration: 75
        }
      ]
    },
    pricing: {
      kmRate: 4.5,
      kmBasedPrice: 128.25,
      minimumPrice: 50,
      finalPrice: 128.25
    }
  },
  {
    id: '1677661200000', // 01/03/2023
    transportType: 'cargo',
    vehicleType: 'van',
    carModel: 'Renault Master',
    pickupLocation: 'Depósito Central',
    destination: 'Shopping Ibirapuera',
    startLocationId: 'deposito_central',
    endLocationId: 'shopping_ibirapuera',
    status: 'pending',
    userId: 'user3', // Usuário comum
    items: [
      {
        name: 'Material de marketing',
        address: 'Depósito Central',
        weight: '120kg',
        dimensions: {
          length: '80cm',
          width: '60cm',
          height: '70cm'
        }
      }
    ],
    routePoints: [
      {
        id: 'deposito_central',
        name: 'Depósito Central',
        address: 'Rua Voluntários da Pátria, 2500',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Rua Voluntários da Pátria, 2500, São Paulo - SP',
        isCompany: true
      },
      {
        id: 'shopping_ibirapuera',
        name: 'Shopping Ibirapuera',
        address: 'Av. Ibirapuera, 3103',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Ibirapuera, 3103, São Paulo - SP',
        isCompany: true
      }
    ],
    routeDistance: {
      totalDistance: 16.9,
      totalDuration: 45,
      totalSteps: 1,
      distanceDetails: [
        {
          from: 'Depósito Central',
          to: 'Shopping Ibirapuera',
          distance: 16.9,
          duration: 45
        }
      ]
    },
    pricing: {
      kmRate: 5.0,
      kmBasedPrice: 84.5,
      minimumPrice: 70,
      finalPrice: 84.5
    }
  },
  {
    id: '1678438800000', // 10/03/2023
    transportType: 'person',
    vehicleType: 'suv',
    carModel: 'Toyota RAV4',
    pickupLocation: 'Aeroporto de Congonhas',
    destination: 'Centro Empresarial Nações Unidas',
    startLocationId: 'airport_congonhas',
    endLocationId: 'cenu',
    status: 'pending',
    userId: 'user1', // Admin
    items: [],
    routePoints: [
      {
        id: 'airport_congonhas',
        name: 'Aeroporto de Congonhas',
        address: 'Av. Washington Luís, s/n - Vila Congonhas',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. Washington Luís, s/n - Vila Congonhas, São Paulo - SP',
        locationType: 'airport'
      },
      {
        id: 'cenu',
        name: 'Centro Empresarial Nações Unidas',
        address: 'Av. das Nações Unidas, 12901',
        city: 'São Paulo',
        state: 'SP',
        fullAddress: 'Av. das Nações Unidas, 12901, São Paulo - SP',
        isCompany: true
      }
    ],
    routeDistance: {
      totalDistance: 13.7,
      totalDuration: 35,
      totalSteps: 1,
      distanceDetails: [
        {
          from: 'Aeroporto de Congonhas',
          to: 'Centro Empresarial Nações Unidas',
          distance: 13.7,
          duration: 35
        }
      ]
    },
    pricing: {
      kmRate: 5.5,
      kmBasedPrice: 75.35,
      minimumPrice: 60,
      finalPrice: 75.35
    }
  }
]; 