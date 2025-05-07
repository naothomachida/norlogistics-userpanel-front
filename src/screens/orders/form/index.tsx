import React, { useState, useMemo, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addOrder, RoutePoint, Order } from '../../../store/ordersSlice';
import { RootState } from '../../../store';
import Header from '../../../components/layout/Header';
import './order-form.css';
import { Location } from '../../../store/locationSlice';
import { MdBusinessCenter } from 'react-icons/md';
import { FaBox, FaHotel, FaPlane, FaMapMarkerAlt, FaBuilding, FaWarehouse, FaHome, FaSpinner } from 'react-icons/fa';
import AddressModal, { DetailedAddress } from './AddressModal';
import { useGoogleMapsLoader } from '../../../hooks/useGoogleMapsLoader';
import { MdLocationCity } from 'react-icons/md';
import { calculateRouteDistance, RouteDistanceResult } from '../../../utils/mapbox-route-distance';

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

const OrderForm: React.FC<OrderFormProps> = (): React.ReactNode => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Obter tipos de veículos e locais do Redux store
  const personVehicles = useSelector((state: RootState) => state.vehicleTypes.person);
  const cargoVehicles = useSelector((state: RootState) => state.vehicleTypes.cargo);
  const locations = useSelector((state: RootState) => state.locations.locations);
  const pricing = useSelector((state: RootState) => state.pricing);

  // Controles de etapas
  const [currentStep, setCurrentStep] = useState<OrderFormStep>(OrderFormStep.TransportType);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    transportType: '', // 'person' ou 'cargo'
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

  // Estado para a rota
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  
  // Estado para controlar o arrastar e soltar
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // State for address modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);

  // Add state for custom location address modal
  const [isCustomLocationAddressModalOpen, setIsCustomLocationAddressModalOpen] = useState(false);

  // Verificar se há itens válidos para definir o último passageiro como destino
  const hasValidItems = useMemo(() => {
    return formData.items.some(item => item.name && item.address);
  }, [formData.items]);

  // New state for route distance
  const [routeDistance, setRouteDistance] = useState<RouteDistanceResult | null>(null);

  // Add this near the route distance state declaration
  const [routeDistanceError, setRouteDistanceError] = useState<string | null>(null);
  
  // Estado para preços
  const [routePrice, setRoutePrice] = useState<{
    kmBasedPrice: number;
    minimumPrice: number | null;
    finalPrice: number;
  } | null>(null);

  // Use Google Maps loader hook
  const { isLoaded } = useGoogleMapsLoader();

  // Modify custom location state to have separate start and end locations
  const [customStartLocation, setCustomStartLocation] = useState({
    type: '',
    address: ''
  });

  const [customEndLocation, setCustomEndLocation] = useState({
    type: '',
    address: ''
  });

  // Update the custom location modal type state
  const [customLocationModalType, setCustomLocationModalType] = useState<'start' | 'end'>('start');

  // Add loading state near other state declarations
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const handleCustomLocationAddressSave = (addressData: DetailedAddress) => {
    // Update custom location based on the current modal type (start or end)
    if (customLocationModalType === 'start') {
      setCustomStartLocation(prev => ({
        ...prev,
        address: addressData.fullAddress || ''
      }));
    } else {
      setCustomEndLocation(prev => ({
        ...prev, 
        address: addressData.fullAddress || ''
      }));
    }
    
    // Close the modal
    setIsCustomLocationAddressModalOpen(false);
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
  const handleTransportTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      transportType: type,
    });
    setCurrentStep(OrderFormStep.VehicleType);
  };

  const handleVehicleTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      vehicleType: type,
    });
    setCurrentStep(OrderFormStep.Details);
  };

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

    // Construir array de pontos de rota
    let routePointsArray: RoutePoint[];
    if (useLastPassengerAsDestination) {
      // Remove last passenger from intermediate points
      const intermediatePoints = itemPoints.slice(0, -1);
      routePointsArray = [originPoint, ...intermediatePoints, destinationPoint];
    } else {
      routePointsArray = [originPoint, ...itemPoints, destinationPoint];
    }
    
    // Definir pontos da rota
    setRoutePoints(routePointsArray);
    
    // Avançar para a próxima etapa
    setCurrentStep(OrderFormStep.RouteOrganization);
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

  const handleSubmit = async (e?: React.FormEvent) => {
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

    if (!routeDistance) {
      alert('Por favor, calcule a distância da rota.');
      return;
    }

    try {
      // Prepare order data for submission
      const orderData: Omit<Order, 'id' | 'status'> = {
        transportType: (formData.transportType === 'person' || formData.transportType === 'cargo') 
          ? formData.transportType 
          : 'person', // Default to 'person' if type is invalid
        vehicleType: formData.vehicleType,
        carModel: '', // TODO: Add car model selection
        pickupLocation: formData.startLocationId,
        destination: formData.endLocationId,
        startLocationId: formData.startLocationId,
        endLocationId: formData.endLocationId,
        items: formData.items.map(item => ({
          name: item.name,
          address: item.address,
          weight: item.weight,
          dimensions: item.dimensions
        })),
        routePoints: routePoints,
        // Adicionar dados de distância da rota
        routeDistance: {
          totalDistance: routeDistance.totalDistance,
          totalDuration: routeDistance.totalDuration,
          totalSteps: routeDistance.totalSteps,
          distanceDetails: routeDistance.distanceDetails.map(segment => ({
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
          finalPrice: routePrice.finalPrice
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
      console.error('Order submission error:', error);
      alert('Erro ao submeter ordem. Por favor, tente novamente.');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > OrderFormStep.TransportType) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProceedToRouteDetails = async () => {
    // Validate route points
    if (routePoints.length < 2) {
      alert('Por favor, adicione pelo menos dois pontos na rota.');
      return;
    }

    // Set loading state
    setIsCalculatingRoute(true);

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
    } finally {
      // Always reset loading state
      setIsCalculatingRoute(false);
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

  // Update the calculateRoutePrice function to accept a routeDistance parameter
  const calculateRoutePrice = (distanceResult?: RouteDistanceResult | null) => {
    // Use the provided route distance or fall back to the state
    const distance = distanceResult || routeDistance;
    
    if (!distance || !pricing) return null;

    // Obter cidades de origem e destino a partir dos pontos da rota
    const startPoint = routePoints[0];
    const endPoint = routePoints[routePoints.length - 1];

    const startCity = startPoint?.city || '';
    const startState = startPoint?.state || '';
    const endCity = endPoint?.city || '';
    const endState = endPoint?.state || '';

    // Calcular preço baseado em km
    const kmBasedPrice = distance.totalDistance * pricing.kmRate;

    // Procurar por preço mínimo entre cidades
    let minimumPrice = null;
    
    // Verificar se existe preço mínimo para o par de cidades (em ambas as direções)
    const cityPair = pricing.cityPairs.find(
      pair => 
        // Verificar se existe par origem -> destino
        (pair.fromCity.toLowerCase() === startCity.toLowerCase() && 
         pair.fromState === startState && 
         pair.toCity.toLowerCase() === endCity.toLowerCase() && 
         pair.toState === endState) ||
        // Verificar se existe par destino -> origem (preço vale para ambas direções)
        (pair.fromCity.toLowerCase() === endCity.toLowerCase() && 
         pair.fromState === endState && 
         pair.toCity.toLowerCase() === startCity.toLowerCase() && 
         pair.toState === startState)
    );

    if (cityPair) {
      minimumPrice = cityPair.minimumPrice;
    }

    // Determinar o preço final (o maior entre o preço por km e o preço mínimo)
    const finalPrice = minimumPrice !== null ? Math.max(kmBasedPrice, minimumPrice) : kmBasedPrice;

    // Log detalhado do cálculo do preço em reais
    console.log('💰 Detalhes do cálculo de preço:');
    console.log(`   Distância total: ${distance.totalDistance.toFixed(2)} km`);
    console.log(`   Preço por km: R$ ${pricing.kmRate.toFixed(2)}`);
    console.log(`   Preço base (distância × taxa por km): R$ ${kmBasedPrice.toFixed(2)}`);
    
    if (minimumPrice !== null) {
      console.log(`   Preço mínimo para rota ${startCity}-${endCity}: R$ ${minimumPrice.toFixed(2)}`);
      console.log(`   Preço final (maior entre preço base e mínimo): R$ ${finalPrice.toFixed(2)}`);
    } else {
      console.log(`   Preço final: R$ ${finalPrice.toFixed(2)}`);
    }

    return {
      kmBasedPrice,
      minimumPrice,
      finalPrice
    };
  };

  // Helper function to get icon for location type
  const getLocationIcon = (type: string, isCompany?: boolean) => {
    switch (type) {
      case 'airport':
        return <FaPlane />;
      case 'hotel':
        return <FaHotel />;
      case 'other':
        return <FaMapMarkerAlt />;
      case 'first-passenger':
        return <FaHome />;
      case 'last-passenger':
        return <FaHome />;
      default:
        // For predefined locations
        if (isCompany) {
          return <FaBuilding />;
        }
        return <MdLocationCity />;
    }
  };

  // Replace the entire renderStep function to fix all JSX structure issues
  const renderStep = () => {
    switch (currentStep) {
      case OrderFormStep.TransportType:
        return (
          <div className="step-container">
            <h2 className="step-title">O que você deseja transportar?</h2>
            <div className="transport-type-selection">
              <div 
                className={`transport-card ${formData.transportType === 'person' ? 'selected' : ''}`}
                onClick={() => handleTransportTypeSelect('person')}
              >
                <div className="transport-icon person-icon">
                  <MdBusinessCenter />
                </div>
                <h3>Pessoas</h3>
                <p>Transporte de executivos</p>
              </div>
              
              <div 
                className={`transport-card ${formData.transportType === 'cargo' ? 'selected' : ''}`}
                onClick={() => handleTransportTypeSelect('cargo')}
              >
                <div className="transport-icon box-icon">
                  <FaBox />
                </div>
                <h3>Cargas</h3>
                <p>Transporte de mercadorias</p>
              </div>
            </div>
          </div>
        );
      
      case OrderFormStep.VehicleType:
        const vehicles = formData.transportType === 'person' 
          ? personVehicles 
          : cargoVehicles;
          
        return (
          <div className="step-container">
            <h2 className="step-title">
              {formData.transportType === 'person' 
                ? 'Escolha o tipo de veículo para os passageiros' 
                : 'Escolha o tipo de veículo para a carga'}
            </h2>
            <div className="vehicle-type-selection">
              {vehicles.map((vehicle) => (
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
            <br />
            <p className="form-hint">
              Para adicionar mais tipos de veículos, vá até <strong>Configurações</strong>
            </p>
          </div>
        );
      
      case OrderFormStep.Details:
        return (
          <div className="step-container">
            <h2 className="step-title">
              {formData.transportType === 'person' 
                ? 'Detalhes dos passageiros' 
                : 'Detalhes das cargas'}
            </h2>
            <form className="details-form">
              {formData.items.map((item, index) => (
                <div key={index} className="item-details">
                  <div className="item-header">
                    <h3>{formData.transportType === 'person' ? `Passageiro ${index + 1}` : `Carga ${index + 1}`}</h3>
                    {formData.items.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-item-button"
                        onClick={() => removeItem(index)}
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  
                  <div className="name-phone-row">
                    <div className="form-group name-group">
                      <label htmlFor={`name-${index}`}>
                        {formData.transportType === 'person' ? 'Nome' : 'Descrição da carga'}
                      </label>
                      <input
                        type="text"
                        id={`name-${index}`}
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder={formData.transportType === 'person' ? 'Nome do passageiro' : 'Descrição da carga'}
                        required
                      />
                    </div>
                    
                    {formData.transportType === 'person' && (
                    <div className="form-group phone-group">
                      <label htmlFor={`phone-${index}`}>Telefone</label>
                      <input
                        type="tel"
                        id={`phone-${index}`}
                        value={item.phone}
                        onChange={(e) => handlePhoneChange(index, e.target.value)}
                        placeholder="Telefone do passageiro"
                        required
                      />
                    </div>
                    )}
                  </div>
                  
                  <div className="form-row address-row">
                    <div className="form-group address-group">
                      <label htmlFor={`address-${index}`}>Endereço</label>
                      <div className="address-input-container">
                        <input
                          type="text"
                          id={`address-${index}`}
                          value={item.address}
                          onClick={() => openAddressModal(index)}
                          readOnly
                          placeholder="Clique para adicionar endereço"
                          required
                        />
                        {item.address && (
                          <button 
                            type="button" 
                            className="edit-address-button"
                            onClick={() => openAddressModal(index)}
                          >
                            Editar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {formData.transportType === 'cargo' && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor={`weight-${index}`}>Peso (kg)</label>
                          <input
                            type="number"
                            id={`weight-${index}`}
                            value={item.weight}
                            onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                            placeholder="Peso em kg"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-row dimensions-row">
                        <h4>Dimensões (cm)</h4>
                        <div className="form-group">
                          <label htmlFor={`length-${index}`}>Comprimento</label>
                          <input
                            type="number"
                            id={`length-${index}`}
                            value={item.dimensions.length}
                            onChange={(e) => handleItemChange(index, 'dimensions.length', e.target.value)}
                            placeholder="Comprimento"
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor={`width-${index}`}>Largura</label>
                          <input
                            type="number"
                            id={`width-${index}`}
                            value={item.dimensions.width}
                            onChange={(e) => handleItemChange(index, 'dimensions.width', e.target.value)}
                            placeholder="Largura"
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor={`height-${index}`}>Altura</label>
                          <input
                            type="number"
                            id={`height-${index}`}
                            value={item.dimensions.height}
                            onChange={(e) => handleItemChange(index, 'dimensions.height', e.target.value)}
                            placeholder="Altura"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              <div className="form-actions all-buttons">
                <button 
                  type="button"
                  onClick={goToPreviousStep}
                  className="back-button"
                >
                  Voltar etapa
                </button>
                
                <div className="right-actions">
                  <button
                    type="button"
                    className="add-item-button"
                    onClick={addItem}
                  >
                    {formData.transportType === 'person' ? 'Adicionar passageiro' : 'Adicionar carga'}
                  </button>
                  
                  {formData.transportType === 'person' && formData.vehicleType && (
                    <div className="capacity-info">
                      {(() => {
                        const selectedVehicle = personVehicles.find(v => v.id === formData.vehicleType);
                        if (selectedVehicle) {
                          const capacity = Number(selectedVehicle.capacity);
                          const current = formData.items.length;
                          const remaining = capacity - current;
                          return (
                            <span className={remaining <= 2 ? 'low-capacity' : ''}>
                              {remaining > 0 
                                ? `Vagas restantes: ${remaining} de ${capacity}` 
                                : 'Capacidade máxima atingida'}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                  
                  <button 
                    type="button" 
                    className="continue-button"
                    onClick={handleProceedToLocationSelection}
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
      
      case OrderFormStep.StartEnd:
        // StartEnd step
        return (
          <div className="step-container">
            <h2 className="step-title">Selecione o início e o fim</h2>
            
            <div className="location-selection-container">
              <div className="location-selection-column">
                <h3>Local de Início</h3>
                
                <div className="location-cards-grid">
                  {/* First passenger option */}
                  {formData.transportType === 'person' && formData.items.length > 0 && (
                    <div 
                      id={`start-first-passenger-card`}
                      key="first-passenger"
                      className={`location-card first-last-passenger-card ${formData.startLocationId === 'first-passenger' ? 'selected' : ''}`}
                      onClick={() => {
                        handleChangeOriginDestination('startLocationId', 'first-passenger');
                        setCustomStartLocation({ type: '', address: '' });
                      }}
                    >
                      <h4>Primeiro Passageiro</h4>
                      <div className="passenger-name">{formData.items[0].name}</div>
                      <div className="passenger-address">{formData.items[0].address}</div>
                    </div>
                  )}

                  {/* New custom location options */}
                  {['airport', 'hotel', 'other'].map((type) => (
                    <div 
                      id={`start-${type}-location-card`}
                      key={`start-${type}`}
                      className={`location-card ${
                        (formData.startLocationId === type)
                          ? 'selected' 
                          : ''
                      }`}
                      onClick={() => {
                        handleChangeOriginDestination('startLocationId', type);
                      }}
                    >
                      <div className="location-card-content">
                        <div className="location-card-icon">
                          {getLocationIcon(type)}
                        </div>
                        <div className="location-card-text">
                          <h4>{
                            type === 'airport' 
                              ? 'Aeroporto' 
                              : type === 'hotel' 
                                ? 'Hotel' 
                                : 'Outro Local'
                          }</h4>
                          {formData.startLocationId === type && (
                            <div className="item-details custom-location-input">
                              <div className="form-group name-group">
                                <label htmlFor={`start-${type}-location-name`}>
                                  Nome do local
                                </label>
                  <input 
                    type="text"
                                  id={`start-${type}-location-name`}
                                  placeholder="Digite o nome do local"
                                  value={customStartLocation.type}
                                  onChange={(e) => setCustomStartLocation(prev => ({
                                    ...prev, 
                                    type: e.target.value
                                  }))}
                                  onClick={(e) => e.stopPropagation()}
                                  required
                  />
                </div>
                
                              <div className="form-group address-group">
                                <label htmlFor={`start-${type}-location-address`}>
                                  Endereço completo
                                </label>
                                <div className="address-input-container">
                                  <input
                                    type="text"
                                    id={`start-${type}-location-address`}
                                    value={customStartLocation.address}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCustomLocationModalType('start');
                                      setIsCustomLocationAddressModalOpen(true);
                                    }}
                                    readOnly
                                    placeholder="Clique para adicionar endereço"
                                    required
                                  />
                                  {customStartLocation.address && (
                                    <button 
                                      type="button" 
                                      className="edit-address-button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCustomLocationModalType('start');
                                        setIsCustomLocationAddressModalOpen(true);
                                      }}
                                    >
                                      Editar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Existing locations */}
                  {locations.map((location) => (
                    <div 
                      id={`start-location-card-${location.id}`}
                      key={`start-${location.id}`}
                      className={`location-card ${formData.startLocationId === location.id ? 'selected' : ''}`}
                      onClick={() => {
                        handleChangeOriginDestination('startLocationId', location.id);
                        setCustomStartLocation({ type: '', address: '' });
                      }}
                    >
                      <div className="location-card-content">
                        <div className="location-card-icon">
                          {getLocationIcon(
                            location.id, 
                            location.isCompany
                          )}
                        </div>
                        <div className="location-card-text">
                        <h4>{location.name}</h4>
                        <p>{location.address}</p>
                        <div className="location-card-details">
                          <span>{location.city} - {location.state}</span>
                          {location.isCompany && <span className="company-badge">Empresa</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="location-selection-column">
                <h3>Local de Fim</h3>
                
                <div className="location-cards-grid">
                  {/* Last passenger option */}
                  {formData.transportType === 'person' && formData.items.length > 0 && (
                    <div 
                      id={`end-first-passenger-card`}
                      key="last-passenger"
                      className={`location-card first-last-passenger-card ${formData.endLocationId === 'last-passenger' ? 'selected' : ''}`}
                      onClick={() => {
                        handleChangeOriginDestination('endLocationId', 'last-passenger');
                        setCustomEndLocation({ type: '', address: '' });
                      }}
                    >
                      <h4>Último Passageiro</h4>
                      <div className="passenger-name">{formData.items[formData.items.length - 1].name}</div>
                      <div className="passenger-address">{formData.items[formData.items.length - 1].address}</div>
                    </div>
                  )}

                  {/* New custom location options */}
                  {['airport', 'hotel', 'other'].map((type) => (
                    <div 
                      id={`end-${type}-location-card`}
                      key={`end-${type}`}
                      className={`location-card ${
                        (formData.endLocationId === type)
                          ? 'selected' 
                          : ''
                      }`}
                      onClick={() => {
                        handleChangeOriginDestination('endLocationId', type);
                      }}
                    >
                      <div className="location-card-content">
                        <div className="location-card-icon">
                          {getLocationIcon(type)}
                        </div>
                        <div className="location-card-text">
                          <h4>{
                            type === 'airport' 
                              ? 'Aeroporto' 
                              : type === 'hotel' 
                                ? 'Hotel' 
                                : 'Outro Local'
                          }</h4>
                          {formData.endLocationId === type && (
                            <div className="item-details custom-location-input">
                              <div className="form-group name-group">
                                <label htmlFor={`end-${type}-location-name`}>
                                  Nome do local
                                </label>
                  <input 
                    type="text"
                                  id={`end-${type}-location-name`}
                                  placeholder="Digite o nome do local"
                                  value={customEndLocation.type}
                                  onChange={(e) => setCustomEndLocation(prev => ({
                                    ...prev, 
                                    type: e.target.value
                                  }))}
                                  onClick={(e) => e.stopPropagation()}
                                  required
                  />
                </div>
                
                              <div className="form-group address-group">
                                <label htmlFor={`end-${type}-location-address`}>
                                  Endereço completo
                                </label>
                                <div className="address-input-container">
                                  <input
                                    type="text"
                                    id={`end-${type}-location-address`}
                                    value={customEndLocation.address}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCustomLocationModalType('end');
                                      setIsCustomLocationAddressModalOpen(true);
                                    }}
                                    readOnly
                                    placeholder="Clique para adicionar endereço"
                                    required
                                  />
                                  {customEndLocation.address && (
                                    <button 
                                      type="button" 
                                      className="edit-address-button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCustomLocationModalType('end');
                                        setIsCustomLocationAddressModalOpen(true);
                                      }}
                                    >
                                      Editar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Existing locations */}
                  {locations.map((location) => (
                    <div 
                      id={`end-location-card-${location.id}`}
                      key={`end-${location.id}`}
                      className={`location-card ${formData.endLocationId === location.id ? 'selected' : ''}`}
                      onClick={() => {
                        handleChangeOriginDestination('endLocationId', location.id);
                        setCustomEndLocation({ type: '', address: '' });
                      }}
                    >
                      <div className="location-card-content">
                        <div className="location-card-icon">
                          {getLocationIcon(
                            location.id, 
                            location.isCompany
                        )}
                      </div>
                        <div className="location-card-text">
                        <h4>{location.name}</h4>
                        <p>{location.address}</p>
                        <div className="location-card-details">
                          <span>{location.city} - {location.state}</span>
                          {location.isCompany && <span className="company-badge">Empresa</span>}
                    </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {formData.startLocationId === formData.endLocationId && 
             formData.startLocationId && 
             formData.endLocationId !== 'last-passenger' && (
              <div className="location-warning">
                <p>Atenção: início e fim são o mesmo local.</p>
              </div>
            )}
            
            <div className="form-actions all-buttons">
              <button 
                type="button"
                onClick={goToPreviousStep}
                className="back-button"
              >
                Voltar etapa
              </button>
              
              <div className="right-actions">
                <button 
                  type="button" 
                  className="continue-button"
                  onClick={() => {
                    // Validate custom locations if selected
                    if (['airport', 'hotel', 'other'].includes(formData.startLocationId)) {
                      if (!customStartLocation.address) {
                        alert('Por favor, preencha o endereço do local de início.');
                        return;
                      }
                    }
                    if (['airport', 'hotel', 'other'].includes(formData.endLocationId)) {
                      if (!customEndLocation.address) {
                        alert('Por favor, preencha o endereço do local de fim.');
                        return;
                      }
                    }
                    handleProceedToRouteOrganization();
                  }}
                  disabled={!formData.startLocationId || !formData.endLocationId}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        );
      
      case OrderFormStep.RouteOrganization:
        return (
          <div className="step-container">
            <div className="route-container">
              {routePoints.map((point, index) => (
                <div 
                  key={point.id}
                  className={`route-point ${draggedItemIndex === index ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="route-point-handle">
                    <DragHandleIcon />
                  </div>
                  <div className="route-point-number">{index + 1}</div>
                  <div className="route-point-content">
                    <div className="route-point-header">
                      <div className="route-point-icon">
                        {getLocationIcon(point.locationType || '', point.isCompany)}
                      </div>
                      <h3>{point.name}</h3>
                    </div>
                    <p>{point.address}</p>
                    {point.locationType && (
                      <span className="location-type-badge">
                        {point.locationType === 'airport' ? 'Aeroporto' :
                         point.locationType === 'hotel' ? 'Hotel' :
                         point.locationType === 'other' ? 'Outro Local' : ''}
                      </span>
                    )}
                    {point.isCompany && <span className="company-badge">Empresa</span>}
                    {index === 0 && <span className="origin-badge">Origem</span>}
                    {index === routePoints.length - 1 && point.isLastPassenger && <span className="last-passenger-badge">Último passageiro</span>}
                    {index === routePoints.length - 1 && !point.isLastPassenger && <span className="destination-badge">Destino</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="form-actions all-buttons">
              <button 
                type="button"
                onClick={goToPreviousStep}
                className="back-button"
              >
                Voltar etapa
              </button>
              
              <div className="right-actions">
                <button 
                  type="button" 
                  className="continue-button"
                  onClick={handleProceedToRouteDetails}
                  disabled={isCalculatingRoute}
                >
                  {isCalculatingRoute ? (
                    <div className="loading-overlay">
                      <FaSpinner className="loading-spinner" />
                      <span className="sr-only">Calculando rota...</span>
                    </div>
                  ) : (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ marginRight: '0.5rem' }}
                      >
                        <path d="M13 17l5-5-5-5"/>
                        <path d="M6 17l5-5-5-5"/>
                      </svg>
                      Avançar para cálculo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      
      case OrderFormStep.RouteDetails:
        return (
          <div className="route-details-page">
            <div className="route-details-header">
              <h2 className="step-title">Resumo da Ordem</h2>
              
              {routeDistance && (
                <>
                  <div className="route-distance-summary">
                    <div className="route-distance-details">
                      <div className="route-summary-card">
                        <div className="route-summary-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12h18"/>
                            <path d="M12 3l3 6l3 -6"/>
                            <path d="M12 21l3 -6l3 6"/>
                          </svg>
                        </div>
                        <div className="route-summary-content">
                          <h3>Distância Total</h3>
                          <p>{routeDistance.totalDistance.toFixed(2)} km</p>
                        </div>
                      </div>

                      <div className="route-summary-card">
                        <div className="route-summary-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                        </div>
                        <div className="route-summary-content">
                          <h3>Duração Total</h3>
                          <p>{routeDistance.totalDuration.toFixed(1)} minutos</p>
                        </div>
                      </div>

                      <div className="route-summary-card">
                        <div className="route-summary-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 3l18 18"/>
                            <path d="M6 6l12 12"/>
                            <path d="M10 6l6 12"/>
                          </svg>
                        </div>
                        <div className="route-summary-content">
                          <h3>Número de Etapas</h3>
                          <p>{routeDistance.totalSteps}</p>
                        </div>
                      </div>
                    </div>

                    <div className="route-segments-container">
                      <h3>Detalhes dos Segmentos</h3>
                      {routeDistance.distanceDetails.map((segment, index) => (
                        <div key={index} className="route-segment-card">
                          <div className="route-segment-header">
                            <div className="route-segment-number">
                              {index + 1}
                            </div>
                            <div className="route-segment-locations">
                              <div className="route-segment-from">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>
                                  <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/>
                                </svg>
                                <span>{segment.from}</span>
                              </div>
                              <div className="route-segment-arrow">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12l14 0"/>
                                  <path d="M15 16l4 -4"/>
                                  <path d="M15 8l4 4"/>
                                </svg>
                              </div>
                              <div className="route-segment-to">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>
                                  <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/>
                                </svg>
                                <span>{segment.to}</span>
                              </div>
                            </div>
                          </div>
                          <div className="route-segment-details">
                            <div className="route-segment-distance">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12h18"/>
                                <path d="M12 3l3 6l3 -6"/>
                                <path d="M12 21l3 -6l3 6"/>
                              </svg>
                              <span>{segment.distance.toFixed(2)} km</span>
                            </div>
                            <div className="route-segment-duration">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
                                <path d="M12 7l0 5l3 3"/>
                              </svg>
                              <span>{segment.duration.toFixed(1)} minutos</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Seção de preço - Após os detalhes dos segmentos */}
                    <div className="route-price-container">
                      <h3>Informações de Preço</h3>
                      <div className="route-price-summary">
                        <div className="route-price-card">
                          <div className="route-price-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 1v22m5-18H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                          </div>
                          <div className="route-price-content">
                            <h3>Preço por KM</h3>
                            <p>R$ {pricing?.kmRate.toFixed(2) || '0.00'}</p>
                          </div>
                        </div>

                        <div className="route-price-card">
                          <div className="route-price-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3" />
                              <path d="M8 7V3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V7" />
                              <path d="M12 12v4" />
                              <path d="M8 12h8" />
                            </svg>
                          </div>
                          <div className="route-price-content">
                            <h3>Preço Base</h3>
                            <p>R$ {routePrice ? routePrice.kmBasedPrice.toFixed(2) : '0.00'}</p>
                          </div>
                        </div>

                        {routePrice && routePrice.minimumPrice !== null && (
                          <div className="route-price-card">
                            <div className="route-price-icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                              </svg>
                            </div>
                            <div className="route-price-content">
                              <h3>Preço Mínimo</h3>
                              <p>R$ {routePrice.minimumPrice.toFixed(2)}</p>
                            </div>
                          </div>
                        )}

                        <div className="route-price-card final-price">
                          <div className="route-price-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <path d="m9.7 16.3 4.6-4.6" />
                              <path d="M15.5 11.2v-1.7h-1.7" />
                              <path d="M9.8 12.5v1.7h1.7" />
                            </svg>
                          </div>
                          <div className="route-price-content">
                            <h3>Preço Final</h3>
                            <p className="final-price-value">R$ {routePrice ? routePrice.finalPrice.toFixed(2) : '0.00'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="form-actions all-buttons">
                <button 
                  type="button"
                  onClick={goToPreviousStep}
                  className="back-button"
                >
                  Voltar etapa
                </button>
                
                <div className="right-actions">
                  <button 
                    type="button" 
                    className="continue-button"
                    onClick={handleSubmit}
                  >
                    Finalizar ordem
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="order-form-page">
      <Header />
      <div className="order-form-content">
        <main className="order-form-main">
          <div className="order-form-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
              <h1 className="order-form-title">Nova solicitação</h1>
            </div>
            <div className="action-buttons">
              <button 
                className="action-button"
                onClick={() => navigate('/orders')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Voltar
              </button>
            </div>
          </div>

          <div className="steps-indicator">
            <div 
              className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}
              onClick={() => navigateToStep(OrderFormStep.TransportType)}
              title={currentStep < 1 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">1</div>
              <div className="step-name">Tipo de transporte</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}
              onClick={() => navigateToStep(OrderFormStep.VehicleType)}
              title={currentStep < 2 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">2</div>
              <div className="step-name">Veículo</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}
              onClick={() => navigateToStep(OrderFormStep.Details)}
              title={currentStep < 3 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">3</div>
              <div className="step-name">Detalhes</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-indicator ${currentStep >= 4 ? 'active' : ''}`}
              onClick={() => navigateToStep(OrderFormStep.StartEnd)}
              title={currentStep < 4 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">4</div>
              <div className="step-name">Início/Fim</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-indicator ${currentStep >= 5 ? 'active' : ''}`}
              onClick={() => navigateToStep(OrderFormStep.RouteOrganization)}
              title={currentStep < 5 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">5</div>
              <div className="step-name">Organizar rota</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-indicator ${currentStep >= 6 ? 'active' : ''}`}
              onClick={() => navigateToStep(OrderFormStep.RouteDetails)}
              title={currentStep < 6 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">6</div>
              <div className="step-name">Detalhes da rota</div>
            </div>
          </div>

          {renderStep()}
        </main>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleAddressSave}
        initialAddress={
          currentItemIndex !== null && formData.items[currentItemIndex].detailedAddress 
            ? formData.items[currentItemIndex].detailedAddress 
            : undefined
        }
      />

      {/* Add the address modal for custom locations */}
      <AddressModal
        isOpen={isCustomLocationAddressModalOpen}
        onClose={() => setIsCustomLocationAddressModalOpen(false)}
        onSave={handleCustomLocationAddressSave}
        initialAddress={customStartLocation.address ? {
          fullAddress: customStartLocation.address
        } : undefined}
      />
    </div>
  );
};

export default OrderForm;