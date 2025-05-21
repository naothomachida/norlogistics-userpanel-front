import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addOrder, RoutePoint, Order } from '../../../store/ordersSlice';
import { RootState } from '../../../store';
import Header from '../../../components/layout/Header';
import './order-form.css';
import { Location } from '../../../store/locationSlice';
import { MdBusinessCenter } from 'react-icons/md';
import { FaBox, FaHotel, FaPlane, FaMapMarkerAlt, FaBuilding, FaWarehouse, FaHome, FaSpinner, FaUser, FaRoad, FaTruck, FaMoneyBillWave, FaUserTie } from 'react-icons/fa';
import AddressModal, { DetailedAddress } from './AddressModal';
import { useGoogleMapsLoader } from '../../../hooks/useGoogleMapsLoader';
import { MdLocationCity } from 'react-icons/md';
import { calculateRouteDistance, RouteDistanceResult } from '../../../utils/mapbox-route-distance';
import { getLocationIcon, getLocationTypeBadge } from '../../../utils/locationIcons';

// Ícone de arrasto
const DragHandleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
  </svg>
);

// Define interface for detailed address
// Interface for detailed address is now imported from AddressModal

// Define steps as an enum to ensure type safety
enum OrderFormStep {
  TransportType = 1,
  VehicleType = 2,
  Details = 3,
  StartEnd = 4,
  RouteOrganization = 5,
  RouteDetails = 6
}

interface OrderFormProps {} // Empty props interface

// Location type verification constants
const AIRPORT_KEYWORDS = ['aeroporto', 'airport', 'congonhas', 'internacional'];
const HOTEL_KEYWORDS = ['hotel', 'mercure', 'pullman', 'renaissance'];

// Utility function to verify location type
const verifyLocationType = (name: string, expectedType: 'airport' | 'hotel' | 'other'): boolean => {
  const nameLower = (name || '').toLowerCase();

  switch (expectedType) {
    case 'airport':
      return AIRPORT_KEYWORDS.some(keyword => nameLower.includes(keyword));
    case 'hotel':
      return HOTEL_KEYWORDS.some(keyword => nameLower.includes(keyword));
    case 'other':
      return !AIRPORT_KEYWORDS.some(keyword => nameLower.includes(keyword)) &&
             !HOTEL_KEYWORDS.some(keyword => nameLower.includes(keyword));
    default:
      return false;
  }
};

const OrderForm: React.FC<OrderFormProps> = (): React.ReactNode => {
  // IMPORTANT: Hooks must be called in the same order every time to avoid React Hook order errors
  // Order of hooks:
  // 1. Routing/Navigation hooks
  // 2. Redux selector hooks
  // 3. External library hooks (like Google Maps loader)
  // 4. State hooks (useState)
  // 5. Memoized values (useMemo)
  // 6. Effects (useEffect)
  
  // Routing and navigation hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Selector hooks
  const personVehicles = useSelector((state: RootState) => state.vehicleTypes.person);
  const cargoVehicles = useSelector((state: RootState) => state.vehicleTypes.cargo);
  const locations = useSelector((state: RootState) => state.locations.locations);
  const pricing = useSelector((state: RootState) => state.pricing);
  const { userProfile } = useSelector((state: RootState) => state.auth);

  // External library hooks
  const { isLoaded, error: googleMapsError } = useGoogleMapsLoader();
  
  // State hooks - keep a consistent order
  const [currentStep, setCurrentStep] = useState<OrderFormStep>(OrderFormStep.TransportType);
  const [formData, setFormData] = useState({
    transportType: '',
    vehicleType: '',
    items: [{
      name: '',
      phone: '',
      address: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
      },
      detailedAddress: undefined as DetailedAddress | undefined
    }],
    startLocationId: '',
    endLocationId: '',
  });
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [isCustomLocationAddressModalOpen, setIsCustomLocationAddressModalOpen] = useState(false);
  const [isTollModalOpen, setIsTollModalOpen] = useState(false);
  const [tollValue, setTollValue] = useState<string>('');
  const [tollPosition, setTollPosition] = useState<number | null>(null);
  const [customStartLocation, setCustomStartLocation] = useState({
    type: '',
    address: ''
  });
  const [customEndLocation, setCustomEndLocation] = useState({
    type: '',
    address: ''
  });
  const [customLocationModalType, setCustomLocationModalType] = useState<'start' | 'end'>('start');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalData, setApprovalData] = useState({
    approvalType: 'manager',
    approvedBy: '',
  });
  const [routeDistance, setRouteDistance] = useState<RouteDistanceResult | null>(null);
  const [routeDistanceError, setRouteDistanceError] = useState<string | null>(null);
  const [routePrice, setRoutePrice] = useState<{
    kmBasedPrice: number;
    minimumPrice: number | null;
    finalPrice: number;
    tollsTotal?: number;
  } | null>(null);
  const [customLocationDetails, setCustomLocationDetails] = useState<{
    start?: DetailedAddress;
    end?: DetailedAddress;
  }>({});

  // Add state for location type confirmation
  const [isLocationTypeConfirmationOpen, setIsLocationTypeConfirmationOpen] = useState(false);
  const [pendingLocationSelection, setPendingLocationSelection] = useState<{
    type: 'start' | 'end';
    locationId: string;
    locationName: string;
    locationAddress: string;
  } | null>(null);

  // Memoized values
  const hasValidItems = useMemo(() => {
    return formData.items.some(item => item.name && item.address);
  }, [formData.items]);

  // Effects
  useEffect(() => {
    if (googleMapsError) {
      console.error('Google Maps Loading Error:', googleMapsError);
      alert('Erro ao carregar o Google Maps. Por favor, tente novamente mais tarde.');
    }
  }, [googleMapsError]);

  // Render loading state if Google Maps is not loaded
  if (!isLoaded) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner-icon" />
          <p>Carregando mapa...</p>
        </div>
        {googleMapsError && (
          <div className="error-message">
            <p>Erro ao carregar o Google Maps</p>
            <p>{googleMapsError.message}</p>
          </div>
        )}
      </div>
    );
  }

  const handleTransportTypeSelect = (type: 'person' | 'cargo') => {
    setFormData({
      ...formData,
      transportType: type,
      // Reset vehicle type when transport type changes
      vehicleType: '',
      // Reset items based on transport type
      items: [{
        name: '',
        phone: type === 'person' ? '' : '',
        address: '',
        weight: type === 'cargo' ? '' : '',
        dimensions: type === 'cargo' 
          ? { length: '', width: '', height: '' }
          : { length: '', width: '', height: '' },
        detailedAddress: undefined
      }]
    });

    // Automatically advance to the next step
    setCurrentStep(OrderFormStep.VehicleType);
  };

  const handleVehicleTypeSelect = (vehicleId: string) => {
    setFormData({
      ...formData,
      vehicleType: vehicleId
    });

    // Automatically advance to the next step
    setCurrentStep(OrderFormStep.Details);
  };

  const handleCustomLocationAddressSave = (addressData: DetailedAddress) => {
    // Determine whether this is a start or end location
    if (customLocationModalType === 'start') {
      setCustomLocationDetails(prev => ({
        ...prev,
        start: addressData
      }));
      setCustomStartLocation({
        type: addressData.street,
        address: addressData.fullAddress
      });
      setFormData(prev => ({
        ...prev, 
        startLocationId: prev.startLocationId || 'other' // Preserve existing location type
      }));
    } else {
      setCustomLocationDetails(prev => ({
        ...prev,
        end: addressData
      }));
      setCustomEndLocation({
        type: addressData.street,
        address: addressData.fullAddress
      });
      setFormData(prev => ({
        ...prev, 
        endLocationId: prev.endLocationId || 'other' // Preserve existing location type
      }));
    }
    
    // Close the modal
    setIsCustomLocationAddressModalOpen(false);
  };

  const openCustomLocationAddressModal = (type: 'start' | 'end') => {
    setCustomLocationModalType(type);
    setIsCustomLocationAddressModalOpen(true);
  };

  const handleCalculateDistance = async () => {
    try {
      // Extract full addresses from route points, using a fallback
      const addresses = routePoints.map(point => 
        point.fullAddress || 
        `${point.address}, ${point.city || ''} ${point.state || ''}`.trim()
      );

      // Calculate route distance using Mapbox
      const result = await calculateRouteDistance(addresses);

      // Set route distance state
      setRouteDistance(result);

      // Calculate the price based on the route distance
      if (pricing) {
        const priceResult = calculateRoutePrice(result);
        setRoutePrice(priceResult);
        if (priceResult) {
          console.log('💸 Valor total calculado: R$ ' + priceResult.finalPrice.toFixed(2));
              }
      }

      // Clear any previous errors
      setRouteDistanceError(null);

      // Optional: Log the results
            console.log('🏁 Total Route Summary:');
      console.log(`   Total Distance: ${result.totalDistance.toFixed(2)} km`);
      console.log(`   Total Duration: ${result.totalDuration.toFixed(1)} minutes`);
            console.log(`   Total Steps: ${result.totalSteps}`);

      // Log distance details
      result.distanceDetails.forEach((segment, index) => {
        console.log(`📍 Segment ${index + 1}: ${segment.from} → ${segment.to}`);
        console.log(`   Distance: ${segment.distance.toFixed(2)} km`);
        console.log(`   Duration: ${segment.duration.toFixed(1)} minutes`);
      });

      // Set the current step to RouteDetails directly instead of calling handleProceedToRouteDetails
      setCurrentStep(OrderFormStep.RouteDetails);

    } catch (error) {
      console.error('Failed to calculate route distance:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        switch (error.message) {
          case 'Could not geocode enough addresses to calculate route':
            setRouteDistanceError('Não foi possível encontrar as localizações de alguns endereços. Verifique os detalhes dos pontos da rota.');
            break;
          case 'At least two addresses are required':
            setRouteDistanceError('É necessário ter pelo menos dois endereços para calcular a rota.');
            break;
          case 'No routes found':
            setRouteDistanceError('Não foi possível calcular a rota entre os endereços fornecidos.');
            break;
          default:
            setRouteDistanceError('Falha ao calcular a distância da rota. Verifique sua conexão de internet e os endereços.');
    }
      } else {
        setRouteDistanceError('Falha ao calcular a distância da rota. Tente novamente.');
      }
    }
  };

  // Manipuladores de eventos
  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    if (field.includes('.')) {
      // Campo aninhado (como dimensions.length)
      const [parent, child] = field.split('.');
      newItems[index] = {
        ...newItems[index],
        [parent]: {
          ...((newItems[index] as any)[parent] || {}),
          [child]: value,
        },
      };
    } else {
      // Campo direto
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
    }
    
    setFormData({
      ...formData,
      items: newItems,
    });
  };

  const formatPhoneNumber = (value: string) => {
    // Remove non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Apply mask
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    } else {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    const formattedValue = formatPhoneNumber(value);
    handleItemChange(index, 'phone', formattedValue);
  };

  const addItem = () => {
    // For passenger vehicles, check capacity
    if (formData.transportType === 'person') {
      const selectedVehicle = personVehicles.find(v => v.id === formData.vehicleType);
      if (selectedVehicle && formData.items.length >= Number(selectedVehicle.capacity)) {
        alert(`Capacidade máxima do veículo (${selectedVehicle.capacity} passageiros) atingida.`);
        return;
      }
    }
    
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          name: '',
          phone: '',
          address: '',
          weight: '',
          dimensions: {
            length: '',
            width: '',
            height: '',
          },
          detailedAddress: undefined
        }
      ],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      setFormData({
        ...formData,
        items: newItems,
      });
    }
  };

  const handleChangeOriginDestination = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleProceedToLocationSelection = () => {
    setCurrentStep(OrderFormStep.StartEnd);
  };

  const handleProceedToRouteOrganization = () => {
    console.log('🚀 Iniciando handleProceedToRouteOrganization');
    console.log('Dados do formulário:', {
      startLocationId: formData.startLocationId,
      endLocationId: formData.endLocationId,
      items: formData.items,
      customStartLocation,
      customEndLocation
    });

    // Encontrar os locais de origem e destino
    let originLocation = locations.find(loc => loc.id === formData.startLocationId);
    let destinationLocation: Location | undefined;
    
    // Caso especial para "último passageiro"
    let useLastPassengerAsDestination = false;
    if (formData.endLocationId === 'last-passenger') {
      useLastPassengerAsDestination = true;
      // Verificar se há itens válidos
      if (!hasValidItems) {
        alert('É necessário cadastrar pelo menos um passageiro para usar a opção "Último passageiro".');
        return;
      }
    } else {
      destinationLocation = locations.find(loc => loc.id === formData.endLocationId);
    }
    
    // Preparar pontos de rota a partir dos itens do formulário
    const itemPoints: RoutePoint[] = formData.items
      .filter(item => item.name && item.address) // Filtra apenas itens com dados válidos
      .map((item, index) => {
        const basePoint: RoutePoint = {
        id: `item-${index}`,
        name: item.name,
        address: item.address,
          ...(index === 0 ? { isFirstPassenger: true } : {}),
          ...(index === formData.items.length - 1 ? { isLastPassenger: true } : {})
        };

        // Adicionar detalhes específicos para passageiros ou cargas
        if (formData.transportType === 'person') {
          basePoint.phone = item.phone;
        } else if (formData.transportType === 'cargo') {
          basePoint.weight = item.weight;
          basePoint.dimensions = item.dimensions;
        }

        return basePoint;
      });
    
    console.log('Item Points:', itemPoints);
    
    if (itemPoints.length === 0) {
      alert('É necessário adicionar pelo menos um passageiro ou carga com dados válidos.');
      return;
    }
    
    // Preparar ponto de origem
    let originPoint: RoutePoint;
    
    if (['airport', 'hotel', 'other'].includes(formData.startLocationId)) {
      // Use custom location for start
      originPoint = {
        id: formData.startLocationId,
        name: customStartLocation.type || 'Local personalizado',
        address: customStartLocation.address,
        ...(formData.startLocationId === 'airport' ? { locationType: 'airport' } :
            formData.startLocationId === 'hotel' ? { locationType: 'hotel' } :
            formData.startLocationId === 'other' ? { locationType: 'other' } : {})
      };
    } else if (originLocation) {
      // Use predefined location
      originPoint = {
        id: originLocation.id,
        name: originLocation.name,
        address: `${originLocation.address}, ${originLocation.city}-${originLocation.state}`,
        ...(originLocation.isCompany ? { isCompany: true } : {})
      };
    } else if (itemPoints.length > 0) {
      // Fallback to first passenger's address
      originPoint = {
        id: 'first-passenger',
        name: itemPoints[0].name,
        address: itemPoints[0].address
      };
    } else {
      alert('Não foi possível determinar o local de origem.');
      return;
    }
    
    console.log('Origin Point:', originPoint);
    
    // Preparar ponto de destino
    let destinationPoint: RoutePoint;
    
    if (useLastPassengerAsDestination) {
      // Last passenger as destination
      const lastPassenger = itemPoints[itemPoints.length - 1];
      destinationPoint = {
          id: lastPassenger.id,
          name: lastPassenger.name,
          address: lastPassenger.address,
          isLastPassenger: true
        };
    } else if (['airport', 'hotel', 'other'].includes(formData.endLocationId)) {
      // Use custom location for end
      destinationPoint = {
        id: formData.endLocationId,
        name: customEndLocation.type || 'Local personalizado',
        address: customEndLocation.address,
        ...(formData.endLocationId === 'airport' ? { locationType: 'airport' } :
            formData.endLocationId === 'hotel' ? { locationType: 'hotel' } :
            formData.endLocationId === 'other' ? { locationType: 'other' } : {})
      };
    } else if (destinationLocation) {
      // Use predefined location
      destinationPoint = {
        id: destinationLocation.id,
        name: destinationLocation.name,
        address: `${destinationLocation.address}, ${destinationLocation.city}-${destinationLocation.state}`,
        ...(destinationLocation.isCompany ? { isCompany: true } : {})
      };
    } else {
      alert('Não foi possível determinar o local de destino.');
      return;
    }
    
    console.log('Destination Point:', destinationPoint);

    // Construir array de pontos de rota
    let routePointsArray: RoutePoint[];
    if (useLastPassengerAsDestination) {
      // Remove last passenger from intermediate points
      const intermediatePoints = itemPoints.slice(0, -1);
      routePointsArray = [originPoint, ...intermediatePoints, destinationPoint];
    } else {
      routePointsArray = [originPoint, ...itemPoints, destinationPoint];
    }
    
    console.log('Route Points Array:', routePointsArray);
    
    // Definir pontos da rota
    setRoutePoints(routePointsArray);
    
    // Avançar para a próxima etapa
    setCurrentStep(OrderFormStep.RouteOrganization);
    
    console.log('🏁 Finalizado handleProceedToRouteOrganization');
  };

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    // Evitar arrastar o item para o mesmo lugar
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    // Reordenar os pontos da rota
    const newRoutePoints = [...routePoints];
    const draggedItem = newRoutePoints[draggedItemIndex];
    
    // Remover o item arrastado e inseri-lo na nova posição
    newRoutePoints.splice(draggedItemIndex, 1);
    newRoutePoints.splice(index, 0, draggedItem);
    
    // Se estamos usando o último passageiro como destino, garantir que o último ponto tem a tag isLastPassenger
    if (formData.endLocationId === 'last-passenger') {
      // Limpar a flag isLastPassenger de todos os pontos
      newRoutePoints.forEach(point => {
        point.isLastPassenger = false;
      });
      
      // Definir o último ponto como último passageiro
      if (newRoutePoints.length > 0) {
        newRoutePoints[newRoutePoints.length - 1].isLastPassenger = true;
      }
    }
    
    // Atualizar o estado de arrasto e a lista
    setDraggedItemIndex(index);
    setRoutePoints(newRoutePoints);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  // Função para abrir o modal de pedágio
  const openTollModal = (position: number) => {
    console.log('🚦 Abrindo modal de pedágio', { 
      position, 
      routePoints: routePoints.map(point => point.name),
      currentStep
    });
    setTollPosition(position);
    setTollValue('');
    setIsTollModalOpen(true);
  };

  // Função para fechar o modal de pedágio
  const closeTollModal = () => {
    setIsTollModalOpen(false);
    setTollPosition(null);
  };

  // Função para adicionar um pedágio
  const addToll = () => {
    console.log('🚧 Adicionando/Editando pedágio', { 
      tollPosition, 
      tollValue,
      routePoints: routePoints.map(point => point.name)
    });

    if (tollPosition === null || !tollValue || isNaN(parseFloat(tollValue)) || parseFloat(tollValue) <= 0) {
      alert('Por favor, insira um valor válido para o pedágio.');
      return;
    }

    const tollValueNumber = parseFloat(tollValue);
    
    // Check if we're editing an existing toll
    const existingTollIndex = routePoints.findIndex((point, index) => 
      point.isToll && index > tollPosition && index <= tollPosition + 1
    );

    const newRoutePoints = [...routePoints];

    if (existingTollIndex !== -1) {
      // Update existing toll
      newRoutePoints[existingTollIndex] = {
        ...newRoutePoints[existingTollIndex],
        name: `Pedágio R$ ${tollValueNumber.toFixed(2)}`,
        address: `Entre ${routePoints[tollPosition].name} e ${routePoints[tollPosition + 1]?.name || 'destino'}`,
        tollValue: tollValueNumber
      };
    } else {
      // Create a new toll point
      const newTollPoint: RoutePoint = {
        id: `toll-${Date.now()}`,
        name: `Pedágio R$ ${tollValueNumber.toFixed(2)}`,
        address: `Entre ${routePoints[tollPosition].name} e ${routePoints[tollPosition + 1]?.name || 'destino'}`,
        isToll: true,
        tollValue: tollValueNumber
      };
      
      // Insert the toll point
      newRoutePoints.splice(tollPosition + 1, 0, newTollPoint);
    }
    
    // Atualizar os pontos da rota
    setRoutePoints(newRoutePoints);
    
    // Fechar o modal
    closeTollModal();
  };

  // Função para remover um pedágio
  const removeToll = (index: number) => {
    const newRoutePoints = routePoints.filter((_, i) => i !== index);
    setRoutePoints(newRoutePoints);
  };

  // Function to edit an existing toll
  const editToll = (index: number) => {
    const tollPoint = routePoints[index];
    if (tollPoint && tollPoint.isToll) {
      setTollPosition(index - 1); // Set position to the point before the toll
      setTollValue(tollPoint.tollValue?.toString() || '');
      setIsTollModalOpen(true);
    }
  };

  // Função para calcular o total de pedágios
  const calculateTollsTotal = (): number => {
    return routePoints
      .filter(point => point.isToll && point.tollValue)
      .reduce((total, point) => total + (point.tollValue || 0), 0);
  };

  const handleSubmit = async (e?: React.FormEvent, status?: Order['status'], approvedBy?: string) => {
    // Prevent default form submission if event is provided
    if (e) {
      e.preventDefault();
    }

    // Validate all required data
    if (!formData.transportType) {
      alert('Por favor, selecione o tipo de transporte.');
      return;
    }

    if (!formData.vehicleType) {
      alert('Por favor, selecione o tipo de veículo.');
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      alert('Por favor, adicione detalhes dos passageiros/cargas.');
      return;
    }

    if (!formData.startLocationId || !formData.endLocationId) {
      alert('Por favor, selecione os locais de início e fim.');
      return;
    }

    if (!routePoints || routePoints.length < 2) {
      alert('Por favor, organize a rota com pelo menos dois pontos.');
      return;
    }

    try {
      // Extract full addresses from route points, filtering out toll points
      const addresses = routePoints
        .filter(point => !point.isToll)
        .map((point, index) => {
          const address = point.fullAddress || 
            `${point.address}, ${point.city || ''} ${point.state || ''}`.trim();
          console.log(`🗺️ Address ${index + 1}: ${address}`);
          return address;
        });
      
      console.log('🚧 Attempting to calculate route distance');
      
      // Calculate route distance using Mapbox
      const result = await calculateRouteDistance(addresses);

      console.log('✅ Route distance calculation successful');
      console.log('Route Distance Result:', result);

      // Set route distance state
      setRouteDistance(result);

      // Now calculate the price based on the route distance
      if (pricing) {
        const priceResult = calculateRoutePrice(result);
        setRoutePrice(priceResult);
        if (priceResult) {
          console.log('💸 Valor total calculado: R$ ' + priceResult.finalPrice.toFixed(2));
        }
      }

      // Prepare order data for submission
      const orderData: Omit<Order, 'id'> = {
        transportType: (formData.transportType === 'person' || formData.transportType === 'cargo') 
          ? formData.transportType 
          : 'person', // Default to 'person' if type is invalid
        vehicleType: formData.vehicleType,
        carModel: '', // TODO: Add car model selection
        pickupLocation: formData.startLocationId,
        destination: formData.endLocationId,
        startLocationId: formData.startLocationId,
        endLocationId: formData.endLocationId,
        userId: userProfile?.id || '', // ID do usuário que está criando a ordem
        status: status || 'pending',
        approvedBy: approvedBy || undefined,
        items: formData.items.map(item => ({
          name: item.name,
          address: item.address,
          weight: item.weight,
          dimensions: item.dimensions
        })),
        routePoints: routePoints, // Include original route points with tolls
        // Adicionar dados de distância da rota
        routeDistance: {
          totalDistance: result.totalDistance,
          totalDuration: result.totalDuration,
          totalSteps: result.totalSteps,
          distanceDetails: result.distanceDetails.map(segment => ({
            from: segment.from,
            to: segment.to,
            distance: segment.distance,
            duration: segment.duration
          }))
        },
        // Adicionar dados de preço
        pricing: routePrice ? {
          kmRate: pricing.kmRate,
          kmBasedPrice: routePrice.kmBasedPrice,
          minimumPrice: routePrice.minimumPrice,
          finalPrice: routePrice.finalPrice,
          tollsTotal: routePrice.tollsTotal
        } : undefined
      };

      // Registrar no console os dados que estão sendo enviados
      console.log('📦 Dados completos da ordem sendo enviada:', orderData);
      console.log('💰 Informações de preço:', orderData.pricing);
      console.log('🛣️ Informações de rota:', orderData.routeDistance);

      // Dispatch order creation action
      dispatch(addOrder(orderData));

      // Navigate to orders list
      navigate('/orders');
    } catch (error) {
      console.error('Route calculation error:', error);
      setRouteDistanceError(error instanceof Error ? error.message : 'Erro desconhecido ao calcular rota');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > OrderFormStep.TransportType) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProceedToRouteDetails = async () => {
    console.log('🚨 DEBUG: Entering handleProceedToRouteDetails');
    console.log('Route Points:', routePoints);
    console.log('Route Points Length:', routePoints.length);

    // Validate route points
    if (routePoints.length < 2) {
      console.error('🚨 Not enough route points');
      alert('Por favor, adicione pelo menos dois pontos na rota.');
      return;
    }

    // Set loading state
    setIsCalculatingRoute(true);

    try {
      // Extract full addresses from route points, using a fallback
      const addresses = routePoints.map((point, index) => {
        const address = point.fullAddress || 
          `${point.address}, ${point.city || ''} ${point.state || ''}`.trim();
        console.log(`🗺️ Address ${index + 1}: ${address}`);
        return address;
      });
      
      console.log('🚧 Attempting to calculate route distance');
      
      // Calculate route distance using Mapbox
      const result = await calculateRouteDistance(addresses);

      console.log('✅ Route distance calculation successful');
      console.log('Route Distance Result:', result);

      // Set route distance state
      setRouteDistance(result);

      // Now calculate the price based on the route distance
      if (pricing) {
        const priceResult = calculateRoutePrice(result);
        setRoutePrice(priceResult);
        if (priceResult) {
          console.log('💸 Valor total calculado: R$ ' + priceResult.finalPrice.toFixed(2));
        }
      }

      // Clear any previous errors
      setRouteDistanceError(null);

      // Optional: Log the results
      console.log('🏁 Total Route Summary:');
      console.log(`   Total Distance: ${result.totalDistance.toFixed(2)} km`);
      console.log(`   Total Duration: ${result.totalDuration.toFixed(1)} minutes`);
      console.log(`   Total Steps: ${result.totalSteps}`);

      // Log distance details
      result.distanceDetails.forEach((segment, index) => {
        console.log(`📍 Segment ${index + 1}: ${segment.from} → ${segment.to}`);
        console.log(`   Distance: ${segment.distance.toFixed(2)} km`);
        console.log(`   Duration: ${segment.duration.toFixed(1)} minutes`);
      });

      // Set the current step to RouteDetails
      console.log('🔜 Advancing to Route Details step');
      setCurrentStep(OrderFormStep.RouteDetails);
    } catch (error) {
      console.error('❌ Failed to calculate route distance:', error);
      
      // Always set the step to RouteDetails to allow manual intervention
      setCurrentStep(OrderFormStep.RouteDetails);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        switch (error.message) {
          case 'Could not geocode enough addresses to calculate route':
            setRouteDistanceError('Não foi possível encontrar as localizações de alguns endereços. Verifique os detalhes dos pontos da rota.');
            break;
          case 'At least two addresses are required':
            setRouteDistanceError('É necessário ter pelo menos dois endereços para calcular a rota.');
            break;
          case 'No routes found':
            setRouteDistanceError('Não foi possível calcular a rota entre os endereços fornecidos.');
            break;
          default:
            setRouteDistanceError('Falha ao calcular a distância da rota. Verifique sua conexão de internet e os endereços.');
        }
      } else {
        setRouteDistanceError('Falha ao calcular a distância da rota. Tente novamente.');
      }
    } finally {
      // Always reset loading state
      setIsCalculatingRoute(false);
      console.log('🏁 Route details calculation process completed');
    }
  };

  const navigateToStep = (step: OrderFormStep) => {
    // Always allow going back to previous steps
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }

    // Check if the target step is the next step or has partial data
    if (step === currentStep + 1 || 
        (step > currentStep && 
         ((step === OrderFormStep.VehicleType && formData.transportType) ||
          (step === OrderFormStep.Details && formData.vehicleType) ||
          (step === OrderFormStep.StartEnd && formData.items.some(item => item.name || item.address)) ||
          (step === OrderFormStep.RouteOrganization && (formData.startLocationId || formData.endLocationId)) ||
          (step === OrderFormStep.RouteDetails && routeDistance)
         )
        )) {
      setCurrentStep(step);
      return;
    }

    // If trying to jump multiple steps, validate thoroughly
    if (step > currentStep + 1) {
      switch (currentStep) {
        case OrderFormStep.TransportType:
          if (!formData.transportType) return;
          break;
        case OrderFormStep.VehicleType:
          if (!formData.vehicleType) return;
          break;
        case OrderFormStep.Details:
          if (!formData.items.some(item => item.name && item.address)) return;
          break;
        case OrderFormStep.StartEnd:
          if (!formData.startLocationId || !formData.endLocationId) return;
          break;
        case OrderFormStep.RouteOrganization:
          if (!routeDistance) return;
          break;
      }
      
      setCurrentStep(step);
    }
  };

  const openAddressModal = (index: number) => {
    setCurrentItemIndex(index);
    setIsAddressModalOpen(true);
  };

  const handleAddressSave = (addressData: DetailedAddress) => {
    if (currentItemIndex !== null) {
      const newItems = [...formData.items];
      newItems[currentItemIndex] = {
        ...newItems[currentItemIndex],
        address: addressData.fullAddress,
        detailedAddress: addressData
      };
      
      setFormData({
        ...formData,
        items: newItems
      });
      
      setCurrentItemIndex(null);
      setIsAddressModalOpen(false);
    }
  };

  // Update the calculateRoutePrice function to handle toll points more explicitly
  const calculateRoutePrice = (distanceResult?: RouteDistanceResult | null) => {
    // Validate input
    if (!distanceResult || !pricing) {
      console.warn('Não foi possível calcular o preço: dados de distância ou precificação ausentes');
      return null;
    }

    const { totalDistance } = distanceResult;
    const { kmRate, cityPairs } = pricing;

    // Calcular o preço base por km
    const kmBasedPrice = totalDistance * kmRate;

    // Determinar o preço mínimo com base nas cidades
    let minimumPrice: number | null = null;
    let startCity = '';
    let endCity = '';

    // Extrair cidades dos detalhes da rota
    if (distanceResult.distanceDetails.length > 0) {
      const firstSegment = distanceResult.distanceDetails[0];
      const lastSegment = distanceResult.distanceDetails[distanceResult.distanceDetails.length - 1];
      
      // Tentar extrair nomes das cidades
      const extractCity = (placeName: string) => {
        const cityMatch = placeName.match(/,\s*([^,]+),/);
        return cityMatch ? cityMatch[1].trim() : placeName.split(',')[0].trim();
      };

      startCity = extractCity(firstSegment.from);
      endCity = extractCity(lastSegment.to);

      // Buscar preço mínimo para o par de cidades
      const cityPair = cityPairs.find(
        (pair: { fromCity: string; fromState: string; toCity: string; toState: string; minimumPrice: number }) => 
          // Verificar se existe par origem -> destino
          (pair.fromCity.toLowerCase() === startCity.toLowerCase() && 
           pair.toCity.toLowerCase() === endCity.toLowerCase()) ||
          // Verificar se existe par destino -> origem (preço vale para ambas direções)
          (pair.fromCity.toLowerCase() === endCity.toLowerCase() && 
           pair.toCity.toLowerCase() === startCity.toLowerCase())
      );

      if (cityPair) {
        minimumPrice = cityPair.minimumPrice;
      }
    }

    // Calcular o total de pedágios
    const tollsTotal = routePoints
      .filter(point => point.isToll && point.tollValue)
      .reduce((total, point) => total + (point.tollValue || 0), 0);

    // Determinar o preço final (o maior entre o preço por km e o preço mínimo) + pedágios
    const basePrice = minimumPrice !== null ? Math.max(kmBasedPrice, minimumPrice) : kmBasedPrice;
    const finalPrice = basePrice + tollsTotal;

    // Log detalhado do cálculo do preço em reais
    console.log('💰 Detalhes do cálculo de preço:');
    console.log(`   Distância total: ${totalDistance.toFixed(2)} km`);
    console.log(`   Preço por km: R$ ${kmRate.toFixed(2)}`);
    console.log(`   Preço base (distância × taxa por km): R$ ${kmBasedPrice.toFixed(2)}`);
    
    if (minimumPrice !== null) {
      console.log(`   Preço mínimo para rota ${startCity}-${endCity}: R$ ${minimumPrice.toFixed(2)}`);
      console.log(`   Preço base (maior entre preço por km e mínimo): R$ ${basePrice.toFixed(2)}`);
    } else {
      console.log(`   Preço base: R$ ${basePrice.toFixed(2)}`);
    }

    if (tollsTotal > 0) {
      console.log(`   Total de pedágios: R$ ${tollsTotal.toFixed(2)}`);
    }
    
    console.log(`   Preço final: R$ ${finalPrice.toFixed(2)}`);

    return {
      kmBasedPrice,
      minimumPrice,
      finalPrice,
      tollsTotal
    };
  };

  // Add this function near the top of the component, before the renderLocationOptions
  const getInitials = (name: string, fallback: string = 'LO'): string => {
    if (!name) return fallback;
    const words = name.split(/\s+/);
    return words.length > 1 
      ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
      : words[0].slice(0, 2).toUpperCase();
  };

  // Render method for custom location details
  const renderCustomLocationDetails = (type: 'start' | 'end') => {
    const locationDetails = type === 'start' 
      ? customLocationDetails.start 
      : customLocationDetails.end;
    
    if (!locationDetails) return null;

    return (
      <div className="custom-location-details">
        <div className="custom-location-info">
          <div className="custom-location-header">
            <h4>{type === 'start' ? 'Local de Origem' : 'Local de Destino'}</h4>
            <button 
              className="edit-custom-location-button"
              onClick={() => openCustomLocationAddressModal(type)}
            >
              Editar
            </button>
          </div>
          <div className="custom-location-content">
            <p><strong>Rua:</strong> {locationDetails.street}</p>
            <p><strong>Número:</strong> {locationDetails.number}</p>
            <p><strong>Bairro:</strong> {locationDetails.neighborhood}</p>
            <p><strong>Cidade:</strong> {locationDetails.city}</p>
            <p><strong>Estado:</strong> {locationDetails.state}</p>
            <p><strong>CEP:</strong> {locationDetails.cep}</p>
            <p><strong>Endereço Completo:</strong> {locationDetails.fullAddress}</p>
          </div>
        </div>
      </div>
    );
  };

  // Modify the existing LocationTypeConfirmationModal to include verification logic
  const LocationTypeConfirmationModal = () => {
    if (!pendingLocationSelection) return null;

    const { type, locationId, locationName, locationAddress } = pendingLocationSelection;

    // Determine the expected location type
    const expectedType = 
      locationId === 'airport' ? 'airport' :
      locationId === 'hotel' ? 'hotel' :
      'other';

    // Verify if the location matches the expected type
    const isLocationTypeMatch = verifyLocationType(locationName, expectedType);

    return (
      <div className="location-type-confirmation-modal">
        <div className="location-type-confirmation-content">
          <h3>Confirmação de Local</h3>
          {!isLocationTypeMatch ? (
            <p>
              O local "{locationName}" parece não ser um {expectedType === 'airport' ? 'aeroporto' : 'hotel'}. 
              Tem certeza que deseja continuar?
            </p>
          ) : (
            <p>Confirmar local: {locationName}?</p>
          )}
          <div className="location-type-confirmation-actions">
            <button 
              className="cancel-button"
              onClick={() => {
                setIsLocationTypeConfirmationOpen(false);
                setPendingLocationSelection(null);
              }}
            >
              Cancelar
            </button>
            <button 
              className="confirm-button"
              onClick={() => {
                // Confirm the location selection
                const updateField = type === 'start' 
                  ? 'startLocationId' 
                  : 'endLocationId';
                
                setFormData(prev => ({
                  ...prev, 
                  [updateField]: locationId
                }));

                // Open address modal for custom location
                setCustomLocationModalType(type);
                setIsCustomLocationAddressModalOpen(true);
                
                // Close confirmation modal
                setIsLocationTypeConfirmationOpen(false);
                setPendingLocationSelection(null);
              }}
            >
              {!isLocationTypeMatch ? 'Continuar mesmo assim' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modify renderLocationOptions to use confirmation modal
  const renderLocationOptions = (type: 'start' | 'end') => {
    // Custom location types
    const customLocations = [
      { 
        id: 'airport', 
        name: 'Aeroporto', 
        icon: <FaPlane className="location-card-icon" />,
        type: 'airport'
      },
      { 
        id: 'hotel', 
        name: 'Hotel', 
        icon: <FaHotel className="location-card-icon" />,
        type: 'hotel'
      },
      { 
        id: 'other', 
        name: 'Outro Local', 
        icon: <FaMapMarkerAlt className="location-card-icon" />,
        type: 'other'
      }
    ];

    // Combine predefined locations with custom locations
    const allLocations = [
      ...customLocations,
      ...locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        icon: loc.isCompany 
          ? <span className="location-card-icon">{getInitials(loc.name)}</span>
          : <FaMapMarkerAlt className="location-card-icon" />,
        type: loc.isCompany ? 'company' : 'predefined'
      }))
    ];

    // Add last passenger option for end location
    if (type === 'end') {
      allLocations.push({
        id: 'last-passenger',
        name: 'Último Passageiro',
        icon: <FaHome className="location-card-icon" />,
        type: 'last-passenger'
      });
    }

    const handleLocationSelect = (location: any) => {
      // For custom location types
      if (['airport', 'hotel', 'other'].includes(location.id)) {
        const expectedType = 
          location.id === 'airport' ? 'airport' :
          location.id === 'hotel' ? 'hotel' :
          'other';

        const isLocationTypeMatch = verifyLocationType(location.name, expectedType);

        setPendingLocationSelection({
          type,
          locationId: location.id,
          locationName: location.name || location.type || 'Local personalizado',
          locationAddress: 'Endereço a ser definido'
        });

        // If location type doesn't match, open confirmation modal
        if (!isLocationTypeMatch) {
          setIsLocationTypeConfirmationOpen(true);
        } else {
          // Directly set the location
          const updateField = type === 'start' 
            ? 'startLocationId' 
            : 'endLocationId';
          
          setFormData(prev => ({
            ...prev, 
            [updateField]: location.id
          }));

          // Open address modal for custom location
          setCustomLocationModalType(type);
          setIsCustomLocationAddressModalOpen(true);
        }
      } else {
        // For predefined locations
        const updateField = type === 'start' 
          ? 'startLocationId' 
          : 'endLocationId';
        
        setFormData(prev => ({
          ...prev, 
          [updateField]: location.id
        }));
      }
    };

        return (
      <div className="location-options-container">
        <div className="location-cards-grid">
          {allLocations.map(location => (
            <React.Fragment key={location.id}>
              <div 
                className={`location-card ${
                  (type === 'start' ? formData.startLocationId : formData.endLocationId) === location.id 
                    ? 'selected' 
                    : ''
                }`}
                onClick={() => handleLocationSelect(location)}
              >
                <div className="location-card-content">
                  <div className="location-card-icon">{location.icon}</div>
                  <div className="location-card-text">
                    <h4>{location.name}</h4>
                    {location.type === 'company' && (
                      <span className="company-badge">Empresa</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Render custom location details immediately after the selected custom location card */}
              {location.id === (type === 'start' ? formData.startLocationId : formData.endLocationId) &&
               ['airport', 'hotel', 'other'].includes(location.id) &&
               renderCustomLocationDetails(type)}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const navigateToNextStep = () => {
    switch(true) {
      case currentStep === OrderFormStep.TransportType:
        if (formData.transportType) setCurrentStep(OrderFormStep.VehicleType);
        break;
      case currentStep === OrderFormStep.VehicleType:
        if (formData.vehicleType) setCurrentStep(OrderFormStep.Details);
        break;
      case currentStep === OrderFormStep.Details:
        if (formData.items.some(item => item.name && item.address)) setCurrentStep(OrderFormStep.StartEnd);
        break;
      case currentStep === OrderFormStep.StartEnd:
        if (formData.startLocationId && formData.endLocationId) handleProceedToRouteOrganization();
        break;
    }
  };

  return (
    <div className="order-form-page">
      <Header />
      <div className="order-form-content">
        <div className="order-form-main">
          <div className="order-form-title-row">
            <h1 className="order-form-title">Nova Solicitação</h1>
          </div>

          {/* Steps Indicator */}
          <div className="steps-indicator">
            {[
              { step: 1, name: 'Tipo de Transporte' },
              { step: 2, name: 'Tipo de Veículo' },
              { step: 3, name: 'Detalhes' },
              { step: 4, name: 'Origem/Destino' },
              { step: 5, name: 'Organizar Rota' },
              { step: 6, name: 'Detalhes da Rota' }
            ].map((stepInfo, index, array) => (
              <React.Fragment key={stepInfo.step}>
                <div 
                  className={`step-indicator ${currentStep >= stepInfo.step ? 'active' : ''}`}
                  onClick={() => navigateToStep(stepInfo.step as OrderFormStep)}
                >
                  <div className="step-number">{stepInfo.step}</div>
                  <div className="step-name">{stepInfo.name}</div>
                </div>
                {index < array.length - 1 && (
                  <div className="step-line"></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Container */}
          <div className="step-container">
            {currentStep === OrderFormStep.TransportType && (
              <div>
                <div className="step-title-container">
                  <div className="step-navigation-buttons">
                    {currentStep > OrderFormStep.TransportType && (
                      <button 
                        className="back-button"
                        onClick={goToPreviousStep}
                      >
                        Voltar
                      </button>
                    )}
                  </div>
                  <h2 className="step-title">Selecione o Tipo de Transporte</h2>
                  <div className="step-navigation-buttons">
                    <button 
                      className="continue-button"
                      onClick={navigateToNextStep}
                      disabled={!formData.transportType}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
                <div className="transport-type-selection">
                  <div 
                    className={`transport-card ${formData.transportType === 'person' ? 'selected' : ''}`}
                    onClick={() => handleTransportTypeSelect('person')}
                  >
                    <div className="transport-icon person-icon">
                      <FaUserTie />
                    </div>
                    <h3>Transporte de Pessoas</h3>
                    <p>Viagens com passageiros</p>
                  </div>
                  <div 
                    className={`transport-card ${formData.transportType === 'cargo' ? 'selected' : ''}`}
                    onClick={() => handleTransportTypeSelect('cargo')}
                  >
                    <div className="transport-icon box-icon">
                      <FaBox />
                    </div>
                    <h3>Transporte de Cargas</h3>
                    <p>Entregas e logística</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === OrderFormStep.VehicleType && (
              <div>
                <div className="step-title-container">
                  <div className="step-navigation-buttons">
                    <button 
                      className="back-button"
                      onClick={goToPreviousStep}
                    >
                      Voltar
                    </button>
                  </div>
                  <h2 className="step-title">Selecione o Tipo de Veículo</h2>
                  <div className="step-navigation-buttons">
                    <button 
                      className="continue-button"
                      onClick={navigateToNextStep}
                      disabled={!formData.vehicleType}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
                <div className="vehicle-type-selection">
                  {(formData.transportType === 'person' ? personVehicles : cargoVehicles).map(vehicle => (
                    <div 
                      key={vehicle.id}
                      className={`vehicle-card ${formData.vehicleType === vehicle.id ? 'selected' : ''}`}
                      onClick={() => handleVehicleTypeSelect(vehicle.id)}
                    >
                      <h3>{vehicle.name}</h3>
                      <p>{vehicle.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === OrderFormStep.Details && (
              <div>
                <div className="step-title-container">
                  <div className="step-navigation-buttons">
                    <button 
                      className="back-button"
                      onClick={goToPreviousStep}
                    >
                      Voltar
                    </button>
                  </div>
                  <h2 className="step-title">Detalhes dos {formData.transportType === 'person' ? 'Passageiros' : 'Itens'}</h2>
                  <div className="step-navigation-buttons">
                    <button 
                      className="continue-button"
                      onClick={navigateToNextStep}
                      disabled={!formData.items.some(item => item.name && item.address)}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
                <div className="details-form">
                  {formData.items.map((item, index) => (
                    <div key={index} className="item-details">
                      <div className="item-header">
                        <h3>Item {index + 1}</h3>
                        {formData.items.length > 1 && (
                          <button 
                            className="remove-item-button"
                            onClick={() => removeItem(index)}
                          >
                            Remover
                          </button>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nome</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            placeholder="Nome completo"
                          />
                        </div>
                        {formData.transportType === 'person' && (
                          <div className="form-group">
                            <label>Telefone</label>
                            <input
                              type="tel"
                              value={item.phone}
                              onChange={(e) => handlePhoneChange(index, e.target.value)}
                              placeholder="(00) 00000-0000"
                            />
                          </div>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group address-row">
                          <label>Endereço</label>
                          <div className="address-input-container">
                            <input
                              type="text"
                              value={item.address}
                              placeholder="Selecione o endereço"
                              readOnly
                              onClick={() => openAddressModal(index)}
                            />
                            <button 
                              className="edit-address-button"
                              onClick={() => openAddressModal(index)}
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="form-actions">
                    <button 
                      className="add-item-button"
                      onClick={addItem}
                    >
                      Adicionar Item
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === OrderFormStep.StartEnd && (
              <div>
                <div className="step-title-container">
                  <div className="step-navigation-buttons">
                    <button 
                      className="back-button"
                      onClick={goToPreviousStep}
                    >
                      Voltar
                    </button>
                  </div>
                  <h2 className="step-title">Selecione Origem e Destino</h2>
                  <div className="step-navigation-buttons">
                    <button 
                      className="continue-button"
                      onClick={handleProceedToRouteOrganization}
                      disabled={!formData.startLocationId || !formData.endLocationId}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
                <div className="location-selection-container">
                  <div className="location-selection-column">
                    <h3>Local de Origem</h3>
                    {renderLocationOptions('start')}
                  </div>
                  <div className="location-selection-column">
                    <h3>Local de Destino</h3>
                    {renderLocationOptions('end')}
                  </div>
                </div>
              </div>
            )}

            {currentStep === OrderFormStep.RouteOrganization && (
              <>
                <div className="step-title-container">
                  <div className="step-navigation-buttons">
                    <button 
                      className="back-button"
                      onClick={goToPreviousStep}
                    >
                      Voltar
                    </button>
                  </div>
                  <h2 className="step-title">Organize a Rota</h2>
                  <div className="step-navigation-buttons">
                    <button 
                      className="continue-button"
                      onClick={handleProceedToRouteDetails}
                      disabled={routePoints.length < 2}
                    >
                      Calcular Rota
                    </button>
                  </div>
                </div>
                <div className="route-organization-container">
                  {routePoints.map((point, index) => (
                    <div 
                      key={point.id} 
                      className={`route-point-card ${
                        index === 0 ? 'origin-point' : 
                        index === routePoints.length - 1 ? 'destination-point' : ''
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="route-point-number">{index + 1}</div>
                      <div className="route-point-icon">
                        {getLocationIcon({ 
                          name: point.name, 
                          locationType: point.locationType, 
                          isCompany: point.isCompany,
                          isToll: point.isToll
                        })}
                      </div>
                      <div className="route-point-info">
                        <h3>{point.name}</h3>
                        <p>{point.address}</p>
                        <div className="route-point-tags">
                          {index === 0 && <span className="point-tag origin-tag">Origem</span>}
                          {index === routePoints.length - 1 && <span className="point-tag destination-tag">Destino</span>}
                          {point.isCompany && <span className="point-tag company-tag">Empresa</span>}
                          {point.locationType && (
                            <span className={`point-tag location-type-tag ${point.locationType}`}>
                              {point.locationType === 'airport' ? 'Aeroporto' :
                               point.locationType === 'hotel' ? 'Hotel' :
                               'Outro Local'}
                            </span>
                          )}
                        </div>
                      </div>
                      {point.isToll && (
                        <div className="route-point-toll-actions">
                          <button 
                            className="edit-toll-button"
                            onClick={() => editToll(index)}
                          >
                            Editar
                          </button>
                          <button 
                            className="remove-toll-button"
                            onClick={() => removeToll(index)}
                          >
                            Remover
                          </button>
                        </div>
                      )}
                      {index < routePoints.length - 1 && !point.isToll && !routePoints[index + 1].isToll && (
                        <div className="route-point-actions">
                          <button 
                            className="add-toll-button"
                            onClick={() => openTollModal(index)}
                          >
                            Adicionar Pedágio
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {currentStep === OrderFormStep.RouteDetails && (
              <div className="route-details-page">
                <div className="step-title-container">
                  <div className="step-navigation-buttons">
                    <button 
                      className="back-button"
                      onClick={goToPreviousStep}
                    >
                      Voltar
                    </button>
                  </div>
                  <h2 className="step-title">Detalhes da Rota</h2>
                  <div className="step-navigation-buttons">
                    <button 
                      className="submit-button"
                      onClick={() => handleSubmit()}
                    >
                      Criar Solicitação
                    </button>
                  </div>
                </div>
                {routeDistance && (
                  <>
                    {/* Route Distance Summary */}
                    <div className="route-distance-summary">
                      <h2>Resumo da Rota</h2>
                      <div className="route-summary-container">
                        <div className="route-summary-card">
                          <div className="route-summary-icon">
                            <FaRoad />
                          </div>
                          <div className="route-summary-content">
                            <h3>Distância Total</h3>
                            <p>{routeDistance.totalDistance.toFixed(2)} km</p>
                          </div>
                        </div>
                        <div className="route-summary-card">
                          <div className="route-summary-icon">
                            <FaTruck />
                          </div>
                          <div className="route-summary-content">
                            <h3>Tempo Total</h3>
                            <p>{routeDistance.totalDuration.toFixed(1)} minutos</p>
                          </div>
                        </div>
                        <div className="route-summary-card">
                          <div className="route-summary-icon">
                            <FaMapMarkerAlt />
                          </div>
                          <div className="route-summary-content">
                            <h3>Total de Etapas</h3>
                            <p>{routeDistance.totalSteps}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Route Price Summary */}
                    {routePrice && pricing && (
                      <div className="route-price-container">
                        <h3>Detalhes de Preço</h3>
                        <div className="route-price-summary">
                          <div className="route-price-card">
                            <div className="route-price-icon">
                              <FaRoad />
                            </div>
                            <div className="route-price-content">
                              <h3>Preço por KM</h3>
                              <p>R$ {pricing.kmRate.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="route-price-card">
                            <div className="route-price-icon">
                              <FaMoneyBillWave />
                            </div>
                            <div className="route-price-content">
                              <h3>Preço Base</h3>
                              <p>R$ {routePrice.kmBasedPrice.toFixed(2)}</p>
                            </div>
                          </div>
                          {routePrice.minimumPrice !== null && (
                            <div className="route-price-card">
                              <div className="route-price-icon">
                                <FaMapMarkerAlt />
                              </div>
                              <div className="route-price-content">
                                <h3>Preço Mínimo</h3>
                                <p>R$ {routePrice.minimumPrice.toFixed(2)}</p>
                              </div>
                            </div>
                          )}
                          {routePrice.tollsTotal && routePrice.tollsTotal > 0 && (
                            <div className="route-price-card toll-card">
                              <div className="route-price-icon">
                                <FaRoad />
                              </div>
                              <div className="route-price-content">
                                <h3>Total de Pedágios</h3>
                                <p>R$ {routePrice.tollsTotal.toFixed(2)}</p>
                              </div>
                            </div>
                          )}
                          <div className="route-price-card final-price">
                            <div className="route-price-icon">
                              <FaMoneyBillWave />
                            </div>
                            <div className="route-price-content">
                              <h3>Preço Final</h3>
                              <p className="final-price-value">R$ {routePrice.finalPrice.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Route Segments */}
                    <div className="route-segments-container">
                      <h3>Detalhes dos Segmentos</h3>
                      {routeDistance.distanceDetails.map((segment, index) => (
                        <div key={index} className="route-segment-card">
                          <div className="route-segment-header">
                            <div className="route-segment-number">{index + 1}</div>
                            <div className="route-segment-locations">
                              <div className="route-segment-from">{segment.from}</div>
                              <div className="route-segment-arrow">→</div>
                              <div className="route-segment-to">{segment.to}</div>
                            </div>
                          </div>
                          <div className="route-segment-details">
                            <div className="route-segment-distance">
                              Distância: {segment.distance.toFixed(2)} km
                            </div>
                            <div className="route-segment-duration">
                              Duração: {segment.duration.toFixed(1)} minutos
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Toll Points */}
                    {routePoints.filter(point => point.isToll).length > 0 && (
                      <div className="route-toll-points-container">
                        <h3>Pedágios</h3>
                        {routePoints.filter(point => point.isToll).map((tollPoint, index) => (
                          <div key={index} className="toll-point">
                            <div className="toll-point-icon">
                              <FaRoad />
                            </div>
                            <div className="toll-point-content">
                              <h3>{tollPoint.name}</h3>
                              <p>{tollPoint.address}</p>
                            </div>
                            <div className="toll-point-actions">
                              <span>R$ {tollPoint.tollValue?.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Error Handling */}
                {routeDistanceError && (
                  <div className="error-message">
                    <p>{routeDistanceError}</p>
                    <div className="error-actions">
                      <button 
                        className="continue-button" 
                        onClick={handleProceedToRouteDetails}
                      >
                        Tentar Novamente
                      </button>
                      <button 
                        className="submit-button"
                        onClick={() => {
                          // Force advance to next step even with error
                          setCurrentStep(OrderFormStep.RouteDetails);
                        }}
                      >
                        Continuar Mesmo Assim
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isAddressModalOpen && (
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSave={handleAddressSave}
          initialAddress={currentItemIndex !== null ? formData.items[currentItemIndex].detailedAddress : undefined}
        />
      )}

      {isCustomLocationAddressModalOpen && (
        <AddressModal
          isOpen={isCustomLocationAddressModalOpen}
          onClose={() => setIsCustomLocationAddressModalOpen(false)}
          onSave={handleCustomLocationAddressSave}
          title={`Endereço de ${customLocationModalType === 'start' ? 'Origem' : 'Destino'}`}
        />
      )}

      {/* Add Location Type Confirmation Modal */}
      {isLocationTypeConfirmationOpen && <LocationTypeConfirmationModal />}

      {/* Modal de Pedágio */}
      {isTollModalOpen && tollPosition !== null && (
        <div className="toll-modal">
          <div className="toll-modal-content">
            <h3>Adicionar Pedágio</h3>
            <div className="toll-route-preview">
              <div className="toll-route-point">
                {routePoints[tollPosition] && getLocationIcon({ 
                  name: routePoints[tollPosition].name || '', 
                  locationType: routePoints[tollPosition].locationType,
                  isCompany: routePoints[tollPosition].isCompany
                })}
                <span>{routePoints[tollPosition]?.name || 'Ponto de Origem'}</span>
              </div>
              <div className="toll-route-arrow">→</div>
              <div className="toll-route-point">
                {routePoints[tollPosition + 1] && getLocationIcon({ 
                  name: routePoints[tollPosition + 1].name || '', 
                  locationType: routePoints[tollPosition + 1].locationType,
                  isCompany: routePoints[tollPosition + 1].isCompany
                })}
                <span>{routePoints[tollPosition + 1]?.name || 'Ponto de Destino'}</span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="tollValue">Valor do Pedágio (R$)</label>
              <input
                type="number"
                id="tollValue"
                value={tollValue}
                onChange={(e) => setTollValue(e.target.value)}
                placeholder="Digite o valor do pedágio"
                step="0.01"
                min="0"
              />
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button" 
                onClick={closeTollModal}
              >
                Cancelar
              </button>
              <button 
                className="confirm-button" 
                onClick={addToll}
                disabled={!tollValue || parseFloat(tollValue) <= 0}
              >
                Adicionar Pedágio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;