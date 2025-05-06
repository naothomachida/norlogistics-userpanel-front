import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addOrder } from '../../../store/ordersSlice';
import { RootState } from '../../../store';
import Header from '../../../components/layout/Header';
import './order-form.css';
import { Location } from '../../../store/locationSlice';
import { MdBusinessCenter } from 'react-icons/md';
import { FaBox } from 'react-icons/fa';
import AddressModal, { DetailedAddress } from './AddressModal';
import { useGoogleMapsLoader } from '../../../hooks/useGoogleMapsLoader';

// Ícone de arrasto
const DragHandleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
  </svg>
);

// Interface para ponto de rota
interface RoutePoint {
  id: string;
  name: string;
  phone?: string;
  address: string;
  isCompany?: boolean;
  isLastPassenger?: boolean;
  // Outros campos para cargas
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
}

// Define interface for detailed address
// Interface for detailed address is now imported from AddressModal

const OrderForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Obter tipos de veículos e locais do Redux store
  const personVehicles = useSelector((state: RootState) => state.vehicleTypes.person);
  const cargoVehicles = useSelector((state: RootState) => state.vehicleTypes.cargo);
  const locations = useSelector((state: RootState) => state.locations.locations);

  // Controles de etapas
  const [currentStep, setCurrentStep] = useState(1);
  
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
    originLocationId: '',
    destinationLocationId: '',
  });

  // Estado para a rota
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  
  // Estado para controlar o arrastar e soltar
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // State for address modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);

  // Verificar se há itens válidos para definir o último passageiro como destino
  const hasValidItems = useMemo(() => {
    return formData.items.some(item => item.name && item.address);
  }, [formData.items]);

  // New state for route distance
  const [routeDistance, setRouteDistance] = useState<RouteDistanceResult | null>(null);

  // Add this near the route distance state declaration
  const [routeDistanceError, setRouteDistanceError] = useState<string | null>(null);

  // Use Google Maps loader hook
  const { isLoaded, error: mapLoadError } = useGoogleMapsLoader();

  // Define route distance type
  interface RouteDistanceResult {
    totalDistance: number;
    totalSteps: number;
    distanceDetails: Array<{
      from: string; 
      to: string; 
      distance: number; 
      duration: number
    }>;
  }

  const handleCalculateDistance = async () => {
    // Check if Google Maps API is loaded
    if (!isLoaded) {
      setRouteDistanceError('Google Maps JavaScript API not loaded');
      console.error('Google Maps JavaScript API not loaded');
      return;
    }

    try {
      // Extract full addresses from route points
      const addresses = routePoints.map(point => point.address);
      
      // Geocode addresses
      const geocoder = new window.google.maps.Geocoder();
      const locations = await Promise.all(
        addresses.map(address => 
          new Promise<google.maps.LatLng>((resolve, reject) => {
            geocoder.geocode({ address: address }, (results, status) => {
              if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
                resolve(results[0].geometry.location);
              } else {
                reject(new Error(`Geocoding failed for address: ${address}`));
              }
            });
          })
        )
      );

      // Calculate distance matrix
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: locations,
          destinations: locations.slice(1),
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC
        },
        (response, status) => {
          if (status === window.google.maps.DistanceMatrixStatus.OK) {
            const rows = response?.rows || [];
            
            let totalDistance = 0;
            const distanceDetails: Array<{
              from: string, 
              to: string, 
              distance: number, 
              duration: number
            }> = [];

            rows.forEach((row, index) => {
              const element = row.elements[0];
              if (element.status === 'OK') {
                const distanceInKm = element.distance.value / 1000;
                totalDistance += distanceInKm;

                distanceDetails.push({
                  from: addresses[index],
                  to: addresses[index + 1],
                  distance: distanceInKm,
                  duration: element.duration.value / 60 // Convert to minutes
                });

                console.log(`📍 Segment ${index + 1}: ${addresses[index]} → ${addresses[index + 1]}`);
                console.log(`   Distance: ${distanceInKm.toFixed(2)} km`);
                console.log(`   Duration: ${(element.duration.value / 60).toFixed(1)} minutes`);
              }
            });

            const result: RouteDistanceResult = {
              totalDistance: Math.round(totalDistance * 10) / 10,
              totalSteps: addresses.length,
              distanceDetails: distanceDetails
            };

            console.log('🏁 Total Route Summary:');
            console.log(`   Total Distance: ${result.totalDistance} km`);
            console.log(`   Total Steps: ${result.totalSteps}`);

            // Set route distance state
            setRouteDistance(result);

            // Add error handling for insufficient route points
            if (routePoints.length < 2) {
              setRouteDistanceError('Adicione pelo menos dois pontos na rota');
              return;
            }

            // Clear any previous errors
            setRouteDistanceError(null);
          } else {
            console.error(`Distance matrix calculation failed: ${status}`);
          }
        }
      );
    } catch (error) {
      console.error('Failed to calculate route distance:', error);
      setRouteDistanceError('Falha ao calcular a distância da rota');
    }
  };

  // Calculate distance whenever route points change
  useEffect(() => {
    if (routePoints.length > 1) {
      handleCalculateDistance();
    }
  }, [routePoints]);

  // Manipuladores de eventos
  const handleTransportTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      transportType: type,
    });
    setCurrentStep(2);
  };

  const handleVehicleTypeSelect = (type: string) => {
    setFormData({
      ...formData,
      vehicleType: type,
    });
    setCurrentStep(3);
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
    setCurrentStep(4);
  };

  const handleProceedToRouteOrganization = () => {
    // Encontrar os locais de origem e destino
    let originLocation = locations.find(loc => loc.id === formData.originLocationId);
    let destinationLocation: Location | undefined;
    
    // Caso especial para "último passageiro"
    let useLastPassengerAsDestination = false;
    if (formData.destinationLocationId === 'last-passenger') {
      useLastPassengerAsDestination = true;
      // Verificar se há itens válidos
      if (!hasValidItems) {
        alert('É necessário cadastrar pelo menos um passageiro para usar a opção "Último passageiro".');
        return;
      }
    } else {
      destinationLocation = locations.find(loc => loc.id === formData.destinationLocationId);
    }
    
    if (!originLocation || (!useLastPassengerAsDestination && !destinationLocation)) {
      alert('Por favor, selecione a origem e o destino.');
      return;
    }
    
    // Preparar pontos de rota a partir dos itens do formulário
    const originPoint: RoutePoint = {
      id: originLocation.id,
      name: originLocation.name,
      address: `${originLocation.address}, ${originLocation.city}-${originLocation.state}`,
      isCompany: originLocation.isCompany || false
    };
    
    const itemPoints: RoutePoint[] = formData.items
      .filter(item => item.name && item.address) // Filtra apenas itens com dados válidos
      .map((item, index) => ({
        id: `item-${index}`,
        name: item.name,
        phone: item.phone,
        address: item.address,
        weight: formData.transportType === 'cargo' ? item.weight : undefined,
        dimensions: formData.transportType === 'cargo' ? item.dimensions : undefined
      }));
    
    if (itemPoints.length === 0) {
      alert('É necessário adicionar pelo menos um passageiro ou carga com dados válidos.');
      return;
    }
    
    // Se usar último passageiro como destino, converter o último item para destino
    let routePointsArray: RoutePoint[] = [];
    if (useLastPassengerAsDestination) {
      if (itemPoints.length > 0) {
        const lastPassenger = itemPoints.pop()!; // Remove o último item
        const destinationPoint: RoutePoint = {
          id: lastPassenger.id,
          name: lastPassenger.name,
          phone: lastPassenger.phone,
          address: lastPassenger.address,
          isLastPassenger: true
        };
        routePointsArray = [originPoint, ...itemPoints, destinationPoint];
      }
    } else {
      // Destino é um local selecionado
      const destinationPoint: RoutePoint = {
        id: destinationLocation!.id,
        name: destinationLocation!.name,
        address: `${destinationLocation!.address}, ${destinationLocation!.city}-${destinationLocation!.state}`,
        isCompany: destinationLocation!.isCompany || false
      };
      routePointsArray = [originPoint, ...itemPoints, destinationPoint];
    }
    
    // Definir pontos da rota
    setRoutePoints(routePointsArray);
    
    // Avançar para a próxima etapa
    setCurrentStep(5);
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
    if (formData.destinationLocationId === 'last-passenger') {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados dos itens para o formato final
    const processedItems = routePoints
      .filter(point => !point.id.includes('lenovo') && 
                        !point.id.includes(formData.originLocationId) && 
                        !point.id.includes(formData.destinationLocationId))
      .map(point => {
        const processedItem: any = {
          name: point.name,
          phone: point.phone,
          address: point.address,
        };
        
        // Adicionar campos específicos para cargas
        if (formData.transportType === 'cargo') {
          processedItem.weight = point.weight;
          processedItem.dimensions = point.dimensions;
        }
        
        return processedItem;
      });
    
    // Enviar para o store
    dispatch(addOrder({
      transportType: formData.transportType as 'person' | 'cargo',
      vehicleType: formData.vehicleType,
      carModel: formData.vehicleType, // Para manter compatibilidade
      originLocationId: formData.originLocationId,
      destinationLocationId: formData.destinationLocationId,
      items: processedItems,
      routePoints: routePoints.map(point => ({
        name: point.name,
        phone: point.phone,
        address: point.address,
        isCompany: point.isCompany || false,
        isLastPassenger: point.isLastPassenger || false
      }))
    }));
    
    navigate('/orders');
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const navigateToStep = (step: number) => {
    // Always allow going back to previous steps
    if (step < currentStep) {
      setCurrentStep(step);
      return;
    }

    // Check if the target step is the next step or has partial data
    if (step === currentStep + 1 || 
        (step > currentStep && 
         ((step === 2 && formData.transportType) ||
          (step === 3 && formData.vehicleType) ||
          (step === 4 && formData.items.some(item => item.name || item.address)) ||
          (step === 5 && (formData.originLocationId || formData.destinationLocationId))
         )
        )) {
      setCurrentStep(step);
      return;
    }

    // If trying to jump multiple steps, validate thoroughly
    if (step > currentStep + 1) {
      switch (currentStep) {
        case 1:
          if (!formData.transportType) return;
          break;
        case 2:
          if (!formData.vehicleType) return;
          break;
        case 3:
          if (!formData.items.some(item => item.name && item.address)) return;
          break;
        case 4:
          if (!formData.originLocationId || !formData.destinationLocationId) return;
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

  // Renderizar etapas
  const renderStep = () => {
    switch (currentStep) {
      case 1:
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
        
      case 2:
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
        
      case 3:
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
      
      case 4:
        return (
          <div className="step-container">
            <h2 className="step-title">Selecione a origem e o destino</h2>
            
            <div className="location-selection-container">
              <div className="location-selection-column">
                <h3>Local de Origem</h3>
                
                <div className="location-cards-grid">
                  {locations.map((location) => (
                    <div 
                      key={location.id}
                      className={`location-card ${formData.originLocationId === location.id ? 'selected' : ''}`}
                      onClick={() => handleChangeOriginDestination('originLocationId', location.id)}
                    >
                      <div className="location-card-content">
                        <h4>{location.name}</h4>
                        <p>{location.address}</p>
                        <div className="location-card-details">
                          <span>{location.city} - {location.state}</span>
                          {location.isCompany && <span className="company-badge">Empresa</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="form-hint">
                  Para adicionar mais locais, vá até <strong>Configurações</strong>
                </p>
              </div>
              
              <div className="location-selection-column">
                <h3>Local de Destino</h3>
                
                <div className="location-cards-grid">
                  {locations.map((location) => (
                    <div 
                      key={location.id}
                      className={`location-card ${formData.destinationLocationId === location.id ? 'selected' : ''}`}
                      onClick={() => handleChangeOriginDestination('destinationLocationId', location.id)}
                    >
                      <div className="location-card-content">
                        <h4>{location.name}</h4>
                        <p>{location.address}</p>
                        <div className="location-card-details">
                          <span>{location.city} - {location.state}</span>
                          {location.isCompany && <span className="company-badge">Empresa</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {formData.transportType === 'person' && (
                    <div 
                      className={`location-card ${formData.destinationLocationId === 'last-passenger' ? 'selected' : ''} ${!hasValidItems ? 'disabled' : ''}`}
                      onClick={() => hasValidItems && handleChangeOriginDestination('destinationLocationId', 'last-passenger')}
                    >
                      <div className="location-card-content">
                        <h4>Último passageiro</h4>
                        <p>O último passageiro da lista será considerado como destino final</p>
                        {!hasValidItems && (
                          <div className="location-card-warning">
                            Adicione passageiros primeiro
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="form-hint">
                  Para adicionar mais locais, vá até <strong>Configurações</strong>
                </p>
              </div>
            </div>

            {formData.originLocationId === formData.destinationLocationId && 
             formData.originLocationId && 
             formData.destinationLocationId !== 'last-passenger' && (
              <div className="location-warning">
                <p>Atenção: origem e destino são o mesmo local.</p>
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
                  onClick={handleProceedToRouteOrganization}
                  disabled={!formData.originLocationId || !formData.destinationLocationId}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        );
        
      case 5:
        const isLastPassengerDestination = formData.destinationLocationId === 'last-passenger';
        return (
          <div className="step-container">
            <h2 className="step-title">Organizar rota de entrega</h2>
            <div className="route-instructions">
              <p>Arraste e solte os pontos abaixo para organizar a rota na ordem desejada.</p>
              <p>A rota inicia no local de origem {isLastPassengerDestination ? 'e o último passageiro será considerado como destino final.' : 'e termina no local de destino.'}</p>
              
              <div className="route-distance-actions">
                <button 
                  type="button" 
                  className="calculate-distance-button"
                  onClick={handleCalculateDistance}
                  disabled={routePoints.length < 2}
                >
                  Calcular distância total
                </button>
              </div>
            </div>
            
            <div className="route-container">
              {routePoints.map((point, index) => {
                // Determinar se o ponto é origem, destino ou ponto intermediário
                const isOrigin = index === 0;
                const isDestination = !isLastPassengerDestination && index === routePoints.length - 1;
                const isLastPassenger = point.isLastPassenger;
                
                // Determinar se o ponto pode ser arrastado
                const canDrag = !isOrigin && (!isDestination || isLastPassengerDestination);
                
                return (
                  <div 
                    key={point.id}
                    className={`route-point 
                      ${isOrigin ? 'origin-point' : ''} 
                      ${isDestination ? 'destination-point' : ''} 
                      ${isLastPassenger ? 'last-passenger-point' : ''} 
                      ${point.isCompany ? 'company-point' : ''} 
                      ${draggedItemIndex === index ? 'dragging' : ''}`}
                    draggable={canDrag}
                    onDragStart={() => canDrag && handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="route-point-handle">
                      {canDrag && <DragHandleIcon />}
                    </div>
                    <div className="route-point-number">{index + 1}</div>
                    <div className="route-point-content">
                      <h3>{point.name}</h3>
                      <p>{point.address}</p>
                      {point.phone && <p className="route-point-phone">{point.phone}</p>}
                      {point.isCompany && <span className="company-badge">Empresa</span>}
                      {isOrigin && <span className="origin-badge">Origem</span>}
                      {isDestination && <span className="destination-badge">Destino</span>}
                      {isLastPassenger && <span className="last-passenger-badge">Último passageiro</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <form onSubmit={handleSubmit}>
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
                    type="submit" 
                    className="submit-button"
                  >
                    Finalizar ordem
                  </button>
                </div>
              </div>
            </form>

            {routeDistance && (
              <div className="route-distance-summary">
                <h3>Resumo da Rota</h3>
                <div className="route-distance-details">
                  <p>Distância Total: {routeDistance.totalDistance} km</p>
                  <p>Número de Etapas: {routeDistance.totalSteps}</p>
                  <details>
                    <summary>Detalhes de cada segmento</summary>
                    {routeDistance.distanceDetails.map((segment, index) => (
                      <div key={index} className="route-segment">
                        <p>
                          {segment.from} → {segment.to}
                          <br />
                          Distância: {segment.distance.toFixed(2)} km
                          <br />
                          Duração: {segment.duration.toFixed(1)} minutos
                        </p>
                      </div>
                    ))}
                  </details>
                </div>
              </div>
            )}

            {routeDistanceError && (
              <div className="route-distance-error">
                <p>{routeDistanceError}</p>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Etapa não encontrada</div>;
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
              onClick={() => navigateToStep(1)}
              title={currentStep < 1 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">1</div>
              <div className="step-name">Tipo de transporte</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}
              onClick={() => navigateToStep(2)}
              title={currentStep < 2 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">2</div>
              <div className="step-name">Veículo</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}
              onClick={() => navigateToStep(3)}
              title={currentStep < 3 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">3</div>
              <div className="step-name">Detalhes</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-indicator ${currentStep >= 4 ? 'active' : ''}`}
              onClick={() => navigateToStep(4)}
              title={currentStep < 4 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">4</div>
              <div className="step-name">Origem/Destino</div>
            </div>
            <div className="step-line"></div>
            <div 
              className={`step-indicator ${currentStep >= 5 ? 'active' : ''}`}
              onClick={() => navigateToStep(5)}
              title={currentStep < 5 ? "Complete the previous step to access this" : ""}
            >
              <div className="step-number">5</div>
              <div className="step-name">Organizar rota</div>
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
    </div>
  );
};

export default OrderForm; 