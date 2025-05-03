import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addOrder } from '../../../store/ordersSlice';
import { RootState } from '../../../store';
import Header from '../../../components/layout/Header';
import './order-form.css';
import { Location } from '../../../store/locationSlice';

// Ícones
const PersonIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
  </svg>
);

const CargoIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8h-3V4H3C1.9 4 1 4.9 1 6v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 19.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V10.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/>
  </svg>
);

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

const OrderForm: React.FC = () => {
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
    // Etapa 1: Tipo de transporte
    transportType: '', // 'person' ou 'cargo'
    
    // Etapa 2: Tipo de veículo
    vehicleType: '',
    
    // Etapa 3: Detalhes do transporte
    items: [{
      name: '',
      address: '',
      // Para cargas
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
      },
    }],

    // Etapa 4: Origem e destino
    originLocationId: '',
    destinationLocationId: '',
  });

  // Estado para a rota
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  
  // Estado para controlar o arrastar e soltar
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Verificar se há itens válidos para definir o último passageiro como destino
  const hasValidItems = useMemo(() => {
    return formData.items.some(item => item.name && item.address);
  }, [formData.items]);

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

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          name: '',
          address: '',
          weight: '',
          dimensions: {
            length: '',
            width: '',
            height: '',
          },
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
                <div className="transport-icon">
                  <PersonIcon />
                </div>
                <h3>Pessoas</h3>
                <p>Transporte de passageiros</p>
              </div>
              
              <div 
                className={`transport-card ${formData.transportType === 'cargo' ? 'selected' : ''}`}
                onClick={() => handleTransportTypeSelect('cargo')}
              >
                <div className="transport-icon">
                  <CargoIcon />
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
                  
                  <div className="form-row">
                    <div className="form-group">
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
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor={`address-${index}`}>Endereço</label>
                      <input
                        type="text"
                        id={`address-${index}`}
                        value={item.address}
                        onChange={(e) => handleItemChange(index, 'address', e.target.value)}
                        placeholder="Endereço completo"
                        required
                      />
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
              
              <div className="form-actions">
                <button
                  type="button"
                  className="add-item-button"
                  onClick={addItem}
                >
                  {formData.transportType === 'person' ? 'Adicionar passageiro' : 'Adicionar carga'}
                </button>
              </div>
              
              <div className="form-actions final-actions">
                <button 
                  type="button"
                  onClick={goToPreviousStep}
                  className="back-button"
                >
                  Voltar
                </button>
                <p className="construction-notice">
                  Esta funcionalidade está em construção. Algumas opções podem ser limitadas.
                </p>
                <button 
                  type="button" 
                  className="submit-button"
                  onClick={handleProceedToLocationSelection}
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        );
      
      case 4:
        return (
          <div className="step-container">
            <h2 className="step-title">Selecione a origem e o destino</h2>
            <div className="form-row">
              <div className="form-group location-select-group">
                <label htmlFor="origin-location">Local de Origem</label>
                <select
                  id="origin-location"
                  value={formData.originLocationId}
                  onChange={(e) => handleChangeOriginDestination('originLocationId', e.target.value)}
                  className="settings-input"
                  required
                >
                  <option value="">Selecione a origem</option>
                  {locations.map((location: Location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.city}-{location.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group location-select-group">
                <label htmlFor="destination-location">Local de Destino</label>
                <select
                  id="destination-location"
                  value={formData.destinationLocationId}
                  onChange={(e) => handleChangeOriginDestination('destinationLocationId', e.target.value)}
                  className="settings-input"
                  required
                >
                  <option value="">Selecione o destino</option>
                  {locations.map((location: Location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.city}-{location.state})
                    </option>
                  ))}
                  {formData.transportType === 'person' && (
                    <option value="last-passenger" disabled={!hasValidItems}>
                      Último passageiro
                    </option>
                  )}
                </select>
                {formData.destinationLocationId === 'last-passenger' && (
                  <small className="form-hint">
                    O último passageiro da lista será considerado como destino final.
                  </small>
                )}
              </div>
            </div>

            {formData.originLocationId === formData.destinationLocationId && 
             formData.originLocationId && 
             formData.destinationLocationId !== 'last-passenger' && (
              <div className="location-warning">
                <p>Atenção: origem e destino são o mesmo local.</p>
              </div>
            )}
            
            <div className="form-actions final-actions">
              <button 
                type="button"
                onClick={goToPreviousStep}
                className="back-button"
              >
                Voltar
              </button>
              <button 
                type="button" 
                className="submit-button"
                onClick={handleProceedToRouteOrganization}
                disabled={!formData.originLocationId || !formData.destinationLocationId}
              >
                Continuar
              </button>
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
              <div className="form-actions final-actions">
                <button 
                  type="button"
                  onClick={goToPreviousStep}
                  className="back-button"
                >
                  Voltar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                >
                  Finalizar ordem
                </button>
              </div>
            </form>
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
            <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-name">Tipo de transporte</div>
            </div>
            <div className="step-line"></div>
            <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-name">Veículo</div>
            </div>
            <div className="step-line"></div>
            <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-name">Detalhes</div>
            </div>
            <div className="step-line"></div>
            <div className={`step-indicator ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-name">Origem/Destino</div>
            </div>
            <div className="step-line"></div>
            <div className={`step-indicator ${currentStep >= 5 ? 'active' : ''}`}>
              <div className="step-number">5</div>
              <div className="step-name">Organizar rota</div>
            </div>
          </div>

          {renderStep()}
        </main>
      </div>
    </div>
  );
};

export default OrderForm; 