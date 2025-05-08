import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import Header from '../../../components/layout/Header';
import './order-detail.css';
import { 
  FaPlane, 
  FaHotel, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaHome, 
  FaCity,
  FaClock,
  FaRuler,
  FaRoute,
  FaMoneyBillWave,
  FaDollarSign,
  FaExchangeAlt,
  FaFileInvoiceDollar,
  FaPercentage,
  FaUserAlt,
  FaChartPie,
  FaCalculator
} from 'react-icons/fa';
import { 
  updateOrderStatus, 
  assignDriverToOrder, 
  updateDriverPayment,
  Order,
  RoutePoint
} from '../../../store/ordersSlice';

// Função para obter descrições dos tipos de veículos
const getVehicleDescription = (type: string | undefined, transportType: string | undefined) => {
  if (!type || !transportType) return 'Não definido';
  
  let vehicleTypes: Record<string, string> = {};
  
  if (transportType === 'person') {
    vehicleTypes = {
      'standard_car': 'Carro Padrão',
      'comfort_car': 'Carro Conforto',
      'suv': 'SUV',
      'premium_car': 'Carro Premium',
      'van': 'Van (até 8 pessoas)',
      'minibus': 'Mini-ônibus',
      'motorcycle': 'Motocicleta'
    };
  } else if (transportType === 'cargo') {
    vehicleTypes = {
      'small_van': 'Van Pequena (até 1t)',
      'medium_van': 'Van Média (até 3t)',
      'small_truck': 'Caminhão Pequeno (até 5t)',
      'medium_truck': 'Caminhão Médio (até 10t)',
      'large_truck': 'Caminhão Grande (até 20t)',
      'refrigerated_truck': 'Caminhão Refrigerado',
      'flatbed_truck': 'Caminhão Plataforma'
    };
  }
  
  return vehicleTypes[type] || type;
};

// Traduzir status para português
const translateStatus = (status: string) => {
  const translations: Record<string, string> = {
    'pending': 'Pendente',
    'in_progress': 'Aprovado',
    'en_route': 'Em rota',
    'completed': 'Concluído',
    'cancelled': 'Cancelado'
  };
  return translations[status] || status;
};

// Traduzir tipo de transporte para português
const translateTransportType = (type: string | undefined) => {
  if (type === 'person') return 'Passageiros';
  if (type === 'cargo') return 'Carga';
  return 'Não definido';
};

// Function to get location icon
const getLocationIcon = (point: any) => {
  if (point.isCompany) return <span className="location-icon company"><FaBuilding /></span>;
  
  switch (point.locationType) {
    case 'airport':
      return <span className="location-icon airport"><FaPlane /></span>;
    case 'hotel':
      return <span className="location-icon hotel"><FaHotel /></span>;
    default:
      return <span className="location-icon other"><FaMapMarkerAlt /></span>;
  }
};

const getLocationTypeLabel = (point: RoutePoint) => {
  if (point.isCompany) return 'Empresa';
  
  switch (point.locationType) {
    case 'airport':
      return 'Aeroporto';
    case 'hotel':
      return 'Hotel';
    default:
      return 'Endereço';
  }
};

// Adicionar novas funções auxiliares para formatar os valores monetários e distâncias
const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};

const formatDistance = (value: number): string => {
  return `${value.toFixed(1)} km`;
};

const formatDuration = (value: number): string => {
  if (value < 60) {
    return `${Math.round(value)} min`;
  } else {
    const hours = Math.floor(value / 60);
    const minutes = Math.round(value % 60);
    return `${hours}h ${minutes}min`;
  }
};

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const users = useSelector((state: RootState) => state.auth.users);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  
  const order = useMemo(() => {
    return orders.find(order => order.id === id);
  }, [orders, id]);

  // Estado para controlar o motorista selecionado
  const [selectedDriverId, setSelectedDriverId] = useState<string>(order?.driverId || '');
  const [showSuccess, setShowSuccess] = useState(false);

  // Estado para o valor a ser pago ao motorista
  const [driverPaymentAmount, setDriverPaymentAmount] = useState<string>(
    order?.driverPayment?.amount ? order.driverPayment.amount.toString() : ''
  );
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Filtrar apenas usuários com role="driver" e status="active"
  const activeDrivers = useMemo(() => {
    return users.filter(user => user.role === 'driver' && user.status === 'active');
  }, [users]);

  // Encontrar o motorista atual do pedido (agora um usuário com role=driver)
  const currentDriver = useMemo(() => {
    return users.find(user => user.id === order?.driverId);
  }, [users, order?.driverId]);

  // Cálculos para pagamento do motorista e lucro
  const paymentCalculations = useMemo(() => {
    if (!order?.pricing?.finalPrice) return null;
    
    const totalOrderValue = order.pricing.finalPrice;
    const driverPayment = order.driverPayment?.amount || 0;
    const profit = totalOrderValue - driverPayment;
    const driverPercentage = driverPayment > 0 ? (driverPayment / totalOrderValue) * 100 : 0;
    const profitPercentage = 100 - driverPercentage;
    
    return {
      totalOrderValue,
      driverPayment,
      profit,
      driverPercentage: Number(driverPercentage.toFixed(2)),
      profitPercentage: Number(profitPercentage.toFixed(2))
    };
  }, [order]);

  // Verificar se o usuário atual tem permissão para ver/editar informações sensíveis
  const canManageDrivers = useMemo(() => {
    return userProfile?.role === 'admin';
  }, [userProfile]);

  // Verificar se o usuário atual pode gerenciar a ordem (mudar status, excluir)
  const canManageOrder = useMemo(() => {
    return userProfile?.role === 'admin';
  }, [userProfile]);

  // Verificar se o usuário atual pode ver informações financeiras
  const canViewFinancials = useMemo(() => {
    return userProfile?.role === 'admin' || userProfile?.role === 'manager';
  }, [userProfile]);

  // Verificar se o usuário é um motorista
  const isDriver = useMemo(() => {
    return userProfile?.role === 'driver';
  }, [userProfile]);

  // Verificar se o usuário é um gerente
  const isManager = useMemo(() => {
    return userProfile?.role === 'manager';
  }, [userProfile]);

  const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDriverId(e.target.value);
  };

  const assignDriver = () => {
    if (id && selectedDriverId) {
      dispatch(assignDriverToOrder({ orderId: id, driverId: selectedDriverId }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleDriverPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validar que é um número positivo
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setDriverPaymentAmount(value);
    }
  };

  const saveDriverPayment = () => {
    if (id && driverPaymentAmount) {
      const amount = parseFloat(driverPaymentAmount);
      dispatch(updateDriverPayment({ orderId: id, amount }));
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 3000);
    }
  };

  // Helper to display driver license information with backward compatibility
  const getLicenseDisplay = (driver: any) => {
    if (!driver) return null;
    
    // Handle users with role="driver" that have driverInfo
    if (driver.driverInfo?.licenseType) {
      return (
        <div className={`license-badge license-${driver.driverInfo.licenseType.toLowerCase()}`}>
          CNH: {driver.driverInfo.licenseType} - {driver.driverInfo.licenseNumber || ""}
        </div>
      );
    }
    
    // Fallback for legacy drivers from the old driversSlice
    if (driver.license) {
      return (
        <div className={`license-badge license-${driver.license.toLowerCase()}`}>
          CNH: {driver.license}
        </div>
      );
    }
    
    return null;
  };

  if (!order) {
    return (
      <div className="order-detail-page">
        <Header />
        <div className="order-detail-content">
          <div className="order-detail-main">
            <div className="order-detail-title-row">
              <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
                <h1 className="order-detail-title">Detalhes da Solicitação</h1>
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
            <div className="order-not-found">
              <p>Solicitação não encontrada. O ID fornecido pode estar incorreto ou a solicitação foi removida.</p>
              <button 
                className="action-button"
                onClick={() => navigate('/orders')}
                style={{ margin: '1rem auto' }}
              >
                Voltar para lista de solicitações
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <Header />
      <div className="order-detail-content">
        <main className="order-detail-main">
          <div className="order-detail-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
              <h1 className="order-detail-title">Detalhes da Solicitação</h1>
              <span className="order-detail-id">#{order.id}</span>
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

          {showSuccess && (
            <div className="success-message">
              Motorista atribuído com sucesso!
            </div>
          )}

          {showPaymentSuccess && (
            <div className="success-message">
              Pagamento do motorista atualizado com sucesso!
            </div>
          )}

          <div className="order-detail-sections">
            <div className="order-detail-section">
              <h2 className="section-title">Informações Gerais</h2>
              <div className="project-details-grid">
                <div className="detail-card status-card">
                  <div className="detail-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="detail-card-content">
                    <h3>Status</h3>
                    <div className="status-badge-wrapper">
                      <div className={`status-badge status-${order.status}`}>{translateStatus(order.status)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="detail-card transport-card">
                  <div className="detail-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {order.transportType === 'person' ? (
                        <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13M16 3.13C17.7699 3.58317 19.0078 5.17728 19.0078 7.005C19.0078 8.83272 17.7699 10.4268 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      ) : (
                        <path d="M13 16V6C13 5.44772 12.5523 5 12 5H4C3.44772 5 3 5.44772 3 6V16C3 16.5523 3.44772 17 4 17H12C12.5523 17 13 16.5523 13 16ZM13 16V8C13 7.44772 13.4477 7 14 7H20C20.5523 7 21 7.44772 21 8V16C21 16.5523 20.5523 17 20 17H14C13.4477 17 13 16.5523 13 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      )}
                    </svg>
                  </div>
                  <div className="detail-card-content">
                    <h3>Tipo de Transporte</h3>
                    <div className="transport-badge-wrapper">
                      <div className={`transport-badge ${order.transportType}`}>{translateTransportType(order.transportType)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="detail-card vehicle-card">
                  <div className="detail-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 8H19C20.1046 8 21 8.89543 21 10L19 15H17M17 8V15M17 8H5L3 15H17M1 11H3M3 15V19C3 20.1046 3.89543 21 5 21H7C8.10457 21 9 20.1046 9 19V15M15 15V19C15 20.1046 15.8954 21 17 21H19C20.1046 21 21 20.1046 21 19V15M7 10.8V10.8M17 10.8V10.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="detail-card-content">
                    <h3>Veículo</h3>
                    <p className="vehicle-detail">{getVehicleDescription(order.vehicleType, order.transportType)}</p>
                  </div>
                </div>
                
                <div className="detail-card route-card">
                  <div className="detail-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="detail-card-content">
                    <h3>Rota</h3>
                    <p className="route-detail">
                      <span className="route-endpoints">
                        <strong>De:</strong> {order.pickupLocation}<br />
                        <strong>Para:</strong> {order.destination}
                      </span>
                    </p>
                  </div>
                </div>
                
                {order.routeDistance && (
                  <div className="detail-card distance-card">
                    <div className="detail-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.0001 11.08V8.00002C20.0001 7.21002 19.4701 6.54002 18.7001 6.33002L13.3901 4.69002C12.8801 4.55002 12.3601 4.55002 11.8501 4.69002L6.54005 6.33002C5.77005 6.54002 5.24005 7.21002 5.24005 8.00002V11.08C5.24005 14.8 8.38005 19.07 11.3001 20.61C11.7301 20.83 12.2701 20.83 12.7001 20.61C15.6201 19.07 18.7601 14.8 18.7601 11.08" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.5 12L11 13.5L14.5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="detail-card-content">
                      <h3>Detalhes</h3>
                      <div className="metrics-container">
                        <div className="metric-item">
                          <span className="metric-label">Distância:</span>
                          <span className="metric-value">{formatDistance(order.routeDistance.totalDistance)}</span>
                        </div>
                        <div className="metric-item">
                          <span className="metric-label">Tempo:</span>
                          <span className="metric-value">{formatDuration(order.routeDistance.totalDuration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {order.pricing && (
                  <div className="detail-card price-card">
                    <div className="detail-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8C10.3431 8 9 9.34315 9 11C9 12.6569 10.3431 14 12 14C13.6569 14 15 15.3431 15 17C15 18.6569 13.6569 20 12 20M12 8C13.6569 8 15 6.65685 15 5C15 3.34315 13.6569 2 12 2M12 8V2M12 20C10.3431 20 9 21.3431 9 23M12 20V23M12 23C13.6569 23 15 21.6569 15 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="detail-card-content">
                      <h3>Valor</h3>
                      <p className="price-detail">{formatCurrency(order.pricing.finalPrice)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seção de motorista - visível apenas para admin e gerentes */}
            {canManageDrivers && !isDriver && (
              <div className="order-detail-section">
                <h2 className="section-title">Motorista</h2>
                <div className="driver-assignment">
                  {currentDriver && (
                    <div className="current-driver">
                      <p><strong>Motorista atual:</strong> {currentDriver.name}</p>
                      <p>{currentDriver.email}</p>
                      {getLicenseDisplay(currentDriver)}
                    </div>
                  )}
                  <div className="driver-selection">
                    <label htmlFor="driver-select">Selecionar motorista:</label>
                    <div className="driver-select-row">
                      <select 
                        id="driver-select" 
                        value={selectedDriverId} 
                        onChange={handleDriverChange}
                        className="driver-select"
                      >
                        <option value="">-- Selecione um motorista --</option>
                        {activeDrivers.map(driver => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} {driver.driverInfo?.licenseType 
                            ? `(CNH: ${driver.driverInfo.licenseType})` 
                            : ''}
                          </option>
                        ))}
                      </select>
                      <button 
                        className="assign-driver-button" 
                        onClick={assignDriver}
                        disabled={!selectedDriverId || selectedDriverId === order.driverId}
                      >
                        {order.driverId ? 'Alterar motorista' : 'Atribuir motorista'}
                      </button>
                    </div>
                  </div>
                  
                  {order.pricing && order.driverId && (
                    <div className="driver-payment">
                      <h3>Pagamento do Motorista</h3>
                      <div className="payment-form">
                        <div className="payment-input-row">
                          <div className="payment-input-group">
                            <label htmlFor="driver-payment">Valor a pagar (R$):</label>
                            <input 
                              type="text" 
                              id="driver-payment"
                              value={driverPaymentAmount}
                              onChange={handleDriverPaymentChange}
                              className="payment-input"
                            />
                          </div>
                          
                          {driverPaymentAmount && order.pricing.finalPrice && (
                            <div className="payment-percentage">
                              {((parseFloat(driverPaymentAmount) / order.pricing.finalPrice) * 100).toFixed(1)}% do valor total
                            </div>
                          )}
                          
                          <button 
                            className="save-payment-button"
                            onClick={saveDriverPayment}
                            disabled={!driverPaymentAmount}
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Seção de motorista para o próprio motorista - apenas visualização */}
            {isDriver && currentDriver && (
              <div className="order-detail-section">
                <h2 className="section-title">Suas Informações</h2>
                <div className="driver-assignment">
                  <div className="current-driver">
                    <p><strong>Você é o motorista responsável por esta corrida</strong></p>
                    <p>{currentDriver.email}</p>
                    {getLicenseDisplay(currentDriver)}
                  </div>
                </div>
              </div>
            )}

            {/* Informações financeiras - visíveis apenas para admin e gerentes */}
            {canViewFinancials && paymentCalculations && !isDriver && (
              <div className="order-detail-section">
                <h2 className="section-title">Informações Financeiras</h2>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ 
                    flex: '1', 
                    minWidth: '200px', 
                    backgroundColor: '#f0f9ff', 
                    borderRadius: '8px', 
                    padding: '20px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ 
                        backgroundColor: '#2563eb', 
                        borderRadius: '50%', 
                        width: '40px', 
                        height: '40px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginRight: '15px',
                        color: 'white'
                      }}>
                        <FaFileInvoiceDollar size={20} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>Valor Total</h3>
                    </div>
                    <p style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      margin: '0', 
                      color: '#333' 
                    }}>
                      R$ {paymentCalculations.totalOrderValue.toFixed(2)}
                    </p>
                  </div>
                  
                  <div style={{ 
                    flex: '1', 
                    minWidth: '200px', 
                    backgroundColor: '#f0fdf4', 
                    borderRadius: '8px', 
                    padding: '20px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ 
                        backgroundColor: '#16a34a', 
                        borderRadius: '50%', 
                        width: '40px', 
                        height: '40px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginRight: '15px',
                        color: 'white'
                      }}>
                        <FaUserAlt size={20} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>Pagamento Motorista</h3>
                    </div>
                    <p style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      margin: '0', 
                      color: '#333' 
                    }}>
                      R$ {paymentCalculations.driverPayment.toFixed(2)}
                      <span style={{ 
                        fontSize: '15px', 
                        color: '#666', 
                        marginLeft: '5px' 
                      }}>
                        ({paymentCalculations.driverPercentage}%)
                      </span>
                    </p>
                  </div>
                  
                  <div style={{ 
                    flex: '1', 
                    minWidth: '200px', 
                    backgroundColor: '#fef2f2', 
                    borderRadius: '8px', 
                    padding: '20px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ 
                        backgroundColor: '#dc2626', 
                        borderRadius: '50%', 
                        width: '40px', 
                        height: '40px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginRight: '15px',
                        color: 'white'
                      }}>
                        <FaChartPie size={20} />
                      </div>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>Lucro</h3>
                    </div>
                    <p style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      margin: '0', 
                      color: '#333' 
                    }}>
                      R$ {paymentCalculations.profit.toFixed(2)}
                      <span style={{ 
                        fontSize: '15px', 
                        color: '#666', 
                        marginLeft: '5px' 
                      }}>
                        ({paymentCalculations.profitPercentage}%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="order-detail-section">
              <h2 className="section-title">Resumo da Rota</h2>
              
              {order.routePoints && order.routePoints.length > 0 ? (
                <div className="route-summary-container">
                  <div className="route-summary-info">
                    <div className="route-summary-card">
                      <div className="route-summary-icon">
                        <FaRuler />
                      </div>
                      <div className="route-summary-content">
                        <h3>Distância Total</h3>
                        <p>{formatDistance(order.routeDistance?.totalDistance || 0)}</p>
                      </div>
                    </div>
                    
                    <div className="route-summary-card">
                      <div className="route-summary-icon">
                        <FaClock />
                      </div>
                      <div className="route-summary-content">
                        <h3>Tempo Estimado</h3>
                        <p>{formatDuration(order.routeDistance?.totalDuration || 0)}</p>
                      </div>
                    </div>
                    
                    <div className="route-summary-card">
                      <div className="route-summary-icon">
                        <FaRoute />
                      </div>
                      <div className="route-summary-content">
                        <h3>Pontos de Parada</h3>
                        <p>{order.routeDistance?.totalSteps || order.routePoints.length} pontos</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="subsection-title">Pontos da Rota</h3>
              <div className="route-points-list">
                    {order.routePoints.map((point, index) => (
                      <div key={index} className={`route-point-card ${index === 0 ? 'origin-point' : ''} ${index === order.routePoints!.length - 1 ? 'destination-point' : ''} ${point.isLastPassenger ? 'last-passenger-point' : ''}`}>
                    <div className="route-point-icon">
                      {getLocationIcon(point)}
                    </div>
                    <div className="route-point-number">{index + 1}</div>
                    <div className="route-point-info">
                      <h3>{point.name}</h3>
                          <p>{point.fullAddress || point.address}</p>
                      <div className="route-point-tags">
                        {index === 0 && <span className="point-tag origin-tag">Origem</span>}
                            {index === order.routePoints!.length - 1 && <span className="point-tag destination-tag">Destino</span>}
                            {point.isLastPassenger && <span className="point-tag last-passenger-tag">Último Passageiro</span>}
                        {point.isCompany && <span className="point-tag company-tag">Empresa</span>}
                        {point.locationType && (
                          <span className={`point-tag location-type-tag ${point.locationType}`}>
                                {point.locationType === 'airport' ? 'Aeroporto' : point.locationType === 'hotel' ? 'Hotel' : 'Outro'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                  
                  {order.routeDistance?.distanceDetails && order.routeDistance.distanceDetails.length > 0 && (
                    <>
                      <h3 className="subsection-title">Detalhes do Trajeto</h3>
                      <div className="route-segments-list">
                        {order.routeDistance.distanceDetails.map((segment, index) => (
                          <div key={index} className="route-segment-card">
                            <div className="route-segment-header">
                              <div className="route-segment-number">{index + 1}</div>
                              <div className="route-segment-locations">
                                <span className="route-segment-from">{segment.from}</span>
                                <span className="route-segment-arrow">→</span>
                                <span className="route-segment-to">{segment.to}</span>
                              </div>
                            </div>
                            <div className="route-segment-details">
                              <span className="route-segment-distance">
                                <FaRuler /> {formatDistance(segment.distance)}
                              </span>
                              <span className="route-segment-duration">
                                <FaClock /> {formatDuration(segment.duration)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="no-route-data">
                  <p>Não há informações detalhadas sobre a rota para esta solicitação.</p>
                </div>
              )}
            </div>

            {order.pricing && (
              <div className="order-detail-section">
                <h2 className="section-title">Valores e Pagamento</h2>
                <div className="price-info-container">
                  <div className="price-info-cards">
                    {!isDriver && (
                      <>
                        <div className="price-info-card">
                          <div className="price-info-icon">
                            <FaRuler />
                          </div>
                          <div className="price-info-content">
                            <h3>Valor por Km</h3>
                            <p className="price-value">{formatCurrency(order.pricing.kmRate)}</p>
                          </div>
                        </div>
                        
                        <div className="price-info-card">
                          <div className="price-info-icon">
                            <FaRoute />
                          </div>
                          <div className="price-info-content">
                            <h3>Valor pela Distância</h3>
                            <p className="price-value">{formatCurrency(order.pricing.kmBasedPrice)}</p>
                            <p className="price-calculation">
                              {formatDistance(order.routeDistance?.totalDistance || 0)} × {formatCurrency(order.pricing.kmRate)}
                            </p>
                          </div>
                        </div>
                        
                        {order.pricing.minimumPrice && (
                          <div className="price-info-card">
                            <div className="price-info-icon">
                              <FaExchangeAlt />
                            </div>
                            <div className="price-info-content">
                              <h3>Valor Mínimo</h3>
                              <p className="price-value">{formatCurrency(order.pricing.minimumPrice)}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="price-info-card final-price">
                      <div className="price-info-icon">
                        <FaMoneyBillWave />
                      </div>
                      <div className="price-info-content">
                        <h3>{isDriver ? 'Seu Pagamento' : 'Valor Final'}</h3>
                        <p className="final-price-value">
                          {isDriver && order.driverPayment?.amount 
                            ? formatCurrency(order.driverPayment.amount) 
                            : formatCurrency(order.pricing.finalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Passenger List Section - Only show for person transport type */}
            {order.transportType === 'person' && order.items && order.items.length > 0 && (
              <div className="order-detail-section">
                <h2 className="section-title">Lista de Passageiros</h2>
                <div className="items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="item-card">
                      <h3>Passageiro {index + 1}</h3>
                      <p><strong>Nome:</strong> {item.name}</p>
                      <p><strong>Endereço:</strong> {item.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cargo List Section - Only show for cargo transport type */}
            {order.transportType === 'cargo' && order.items && order.items.length > 0 && (
              <div className="order-detail-section">
                <h2 className="section-title">Lista de Cargas</h2>
                <div className="items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="item-card">
                      <h3>Carga {index + 1}</h3>
                      <p><strong>Descrição:</strong> {item.name}</p>
                      <p><strong>Peso:</strong> {item.weight ? `${item.weight} kg` : 'Não informado'}</p>
                      <p><strong>Dimensões:</strong> {typeof item.dimensions === 'string' ? item.dimensions : (item.dimensions ? `${item.dimensions.length}x${item.dimensions.width}x${item.dimensions.height}` : 'Não informado')}</p>
                      <p><strong>Endereço:</strong> {item.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seção de ações - visível apenas para admin */}
            {canManageOrder && !isDriver && (
              <div className="order-detail-section">
                <h2 className="section-title">Ações</h2>
                <div className="order-actions">
                  <div className="status-section">
                    <h3 className="subsection-title">Alterar Status</h3>
                    <div className="status-select-container">
                      <select 
                        id="status-select" 
                        value={order.status}
                        onChange={(e) => {
                          if (id) {
                            dispatch(updateOrderStatus({ id, status: e.target.value as Order['status'] }));
                          }
                        }}
                        className="status-select"
                      >
                        <option value="pending">Pendente</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                      <span className={`current-status-badge status-${order.status}`}>
                        Status atual: {translateStatus(order.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="danger-section">
                    <h3 className="subsection-title">Ações Perigosas</h3>
                    <button 
                      className="action-button danger-button"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.')) {
                          // dispatch(removeOrder(id as string));
                          navigate('/orders');
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Excluir Solicitação
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Seção de ações para gerente - apenas botão de aprovar */}
            {isManager && order.status === 'pending' && (
              <div className="order-detail-section">
                <h2 className="section-title">Ações do Gerente</h2>
                <div style={{ padding: "20px 0" }}>
                  <button 
                    style={{
                      backgroundColor: "#16a34a",
                      color: "white",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      maxWidth: "400px",
                      margin: "0 auto",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                    }}
                    onClick={() => {
                      if (id && window.confirm('Tem certeza que deseja aprovar esta solicitação?')) {
                        dispatch(updateOrderStatus({ id, status: 'in_progress' }));
                      }
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Aprovar Solicitação
                  </button>
                  <p style={{ 
                    textAlign: "center", 
                    marginTop: "16px", 
                    color: "#666", 
                    fontSize: "14px" 
                  }}>
                    Ao aprovar esta solicitação, o status será alterado para "Aprovado"
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderDetail; 