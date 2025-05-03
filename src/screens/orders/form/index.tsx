import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addOrder } from '../../../store/ordersSlice';
import Header from '../../../components/layout/Header';
import './order-form.css';

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

// Tipos de veículos
const vehicleTypes = {
  person: [
    { id: 'basic', name: 'Básico', description: 'Econômico e compacto' },
    { id: 'hatch', name: 'Hatch', description: 'Compacto e versátil' },
    { id: 'sedan', name: 'Sedan', description: 'Confortável e espaçoso' },
    { id: 'suv', name: 'SUV', description: 'Robusto e espaçoso' },
    { id: 'minibus', name: 'Microônibus', description: 'Para grupos pequenos' },
    { id: 'bus', name: 'Ônibus', description: 'Para grupos grandes' },
  ],
  cargo: [
    { id: 'van', name: 'Van', description: 'Cargas pequenas até 1 tonelada' },
    { id: 'truck_small', name: 'Caminhão pequeno', description: '3/4, VUC, até 3 toneladas' },
    { id: 'truck_medium', name: 'Caminhão médio', description: 'Toco, até 6 toneladas' },
    { id: 'truck_large', name: 'Caminhão grande', description: 'Truck, até 12 toneladas' },
    { id: 'truck_extra', name: 'Carreta', description: 'Cargas acima de 12 toneladas' },
    { id: 'truck_special', name: 'Carreta especial', description: 'Cargas indivisíveis ou excedentes' },
  ]
};

const OrderForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados dos itens para o formato final
    const processedItems = formData.items.map(item => {
      const processedItem: any = {
        name: item.name,
        address: item.address,
      };
      
      // Adicionar campos específicos para cargas
      if (formData.transportType === 'cargo') {
        processedItem.weight = item.weight;
        processedItem.dimensions = item.dimensions;
      }
      
      return processedItem;
    });
    
    // Enviar para o store
    dispatch(addOrder({
      transportType: formData.transportType as 'person' | 'cargo',
      vehicleType: formData.vehicleType,
      carModel: formData.vehicleType, // Para manter compatibilidade
      pickupLocation: formData.items[0].address,
      destination: formData.items.length > 1 ? formData.items[1].address : 'N/A',
      items: processedItems,
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
          ? vehicleTypes.person 
          : vehicleTypes.cargo;
          
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
            <form onSubmit={handleSubmit} className="details-form">
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
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
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
          </div>

          {renderStep()}
        </main>
      </div>
    </div>
  );
};

export default OrderForm; 