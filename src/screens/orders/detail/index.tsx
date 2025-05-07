import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import Header from '../../../components/layout/Header';
import './order-detail.css';
import { assignDriverToOrder } from '../../../store/ordersSlice';
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
  FaFileInvoiceDollar
} from 'react-icons/fa';
import { RoutePoint } from '../../../store/ordersSlice';

// Função para obter descrições dos tipos de veículos
const getVehicleDescription = (type: string | undefined, transportType: string | undefined) => {
  if (!type) return 'N/A';

  const personVehicles: Record<string, string> = {
    basic: 'Veículo básico',
    hatch: 'Hatch',
    sedan: 'Sedan',
    suv: 'SUV',
    minibus: 'Microônibus',
    bus: 'Ônibus',
  };

  const cargoVehicles: Record<string, string> = {
    van: 'Van',
    truck_small: 'Caminhão pequeno',
    truck_medium: 'Caminhão médio',
    truck_large: 'Caminhão grande',
    truck_extra: 'Carreta',
    truck_special: 'Carreta especial',
  };

  return transportType === 'person' 
    ? (personVehicles[type] || type) 
    : (cargoVehicles[type] || type);
};

// Traduzir status para português
const translateStatus = (status: string) => {
  const translations: Record<string, string> = {
    'pending': 'Pendente',
    'in_progress': 'Em andamento',
    'en_route': 'Em rota',
    'completed': 'Concluído',
    'cancelled': 'Cancelado'
  };
  return translations[status] || status;
};

// Traduzir tipo de transporte para português
const translateTransportType = (type: string | undefined) => {
  if (!type) return 'N/A';
  return type === 'person' ? 'Pessoas' : 'Cargas';
};

// Function to get location icon
const getLocationIcon = (point: any) => {
  // Check for custom locations first
  if (point.id === 'airport') return <FaPlane />;
  if (point.id === 'hotel') return <FaHotel />;
  if (point.id === 'other') return <FaMapMarkerAlt />;

  // Check for predefined locations or fallback
  if (point.isCompany) return <FaBuilding />;
  if (point.isLastPassenger) return <FaHome />;
  
  // Default icon
  return <FaCity />;
};

const getLocationTypeLabel = (point: RoutePoint) => {
  if (point.locationType === 'airport') return 'Aeroporto';
  if (point.locationType === 'hotel') return 'Hotel';
  if (point.locationType === 'other') return 'Outro Local';
  if (point.isCompany) return 'Empresa';
  if (point.isLastPassenger) return 'Último Passageiro';
  return 'Local';
};

// Adicionar novas funções auxiliares para formatar os valores monetários e distâncias
const formatCurrency = (value: number): string => {
  return `R$ ${value.toFixed(2)}`;
};

const formatDistance = (value: number): string => {
  return `${value.toFixed(2)} km`;
};

const formatDuration = (value: number): string => {
  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} minutos`;
};

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const drivers = useSelector((state: RootState) => state.drivers.drivers);
  
  const order = useMemo(() => {
    return orders.find(order => order.id === id);
  }, [orders, id]);

  // Estado para controlar o motorista selecionado
  const [selectedDriverId, setSelectedDriverId] = useState<string>(order?.driverId || '');
  const [showSuccess, setShowSuccess] = useState(false);

  // Filtrar apenas motoristas ativos
  const activeDrivers = useMemo(() => {
    return drivers.filter(driver => driver.status === 'active');
  }, [drivers]);

  // Encontrar o motorista atual do pedido
  const currentDriver = useMemo(() => {
    return drivers.find(driver => driver.id === order?.driverId);
  }, [drivers, order?.driverId]);

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

          <div className="order-detail-sections">
            <div className="order-detail-section">
              <h2 className="section-title">Informações Gerais</h2>
              <div className="order-info-grid">
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className={`status-badge status-${order.status}`}>{translateStatus(order.status)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tipo de Transporte</span>
                  <span className={`transport-badge ${order.transportType}`}>{translateTransportType(order.transportType)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Veículo</span>
                  <span>{getVehicleDescription(order.vehicleType, order.transportType)}</span>
                </div>
              </div>
            </div>

            <div className="order-detail-section">
              <h2 className="section-title">Motorista</h2>
              <div className="driver-assignment">
                {currentDriver && (
                  <div className="current-driver">
                    <p><strong>Motorista atual:</strong> {currentDriver.name}</p>
                    <p>{currentDriver.phone}</p>
                    <div className={`license-badge license-${currentDriver.license.toLowerCase()}`}>
                      CNH: {currentDriver.license}
                    </div>
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
                          {driver.name} (CNH: {driver.license})
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
              </div>
            </div>

            {/* Nova seção resumo da rota com distâncias e tempos */}
            {order.routeDistance && (
              <div className="order-detail-section">
                <h2 className="section-title">Resumo da Rota</h2>
                <div className="route-summary-container">
                  <div className="route-summary-info">
                    <div className="route-summary-card">
                      <div className="route-summary-icon">
                        <FaRuler />
                      </div>
                      <div className="route-summary-content">
                        <h3>Distância Total</h3>
                        <p>{formatDistance(order.routeDistance.totalDistance)}</p>
                      </div>
                    </div>

                    <div className="route-summary-card">
                      <div className="route-summary-icon">
                        <FaClock />
                      </div>
                      <div className="route-summary-content">
                        <h3>Duração Total</h3>
                        <p>{formatDuration(order.routeDistance.totalDuration)}</p>
                      </div>
                    </div>

                    <div className="route-summary-card">
                      <div className="route-summary-icon">
                        <FaRoute />
                      </div>
                      <div className="route-summary-content">
                        <h3>Número de Etapas</h3>
                        <p>{order.routeDistance.totalSteps}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalhes dos segmentos com distâncias e tempos */}
                <div className="route-segments-container">
                  <h3 className="subsection-title">Detalhes dos Segmentos</h3>
                  <div className="route-segments-list">
                    {order.routeDistance.distanceDetails.map((segment, index) => (
                      <div key={index} className="route-segment-card">
                        <div className="route-segment-header">
                          <div className="route-segment-number">
                            {index + 1}
                          </div>
                          <div className="route-segment-locations">
                            <div className="route-segment-from">
                              <FaMapMarkerAlt />
                              <span>{segment.from}</span>
                            </div>
                            <div className="route-segment-arrow">
                              <FaExchangeAlt />
                            </div>
                            <div className="route-segment-to">
                              <FaMapMarkerAlt />
                              <span>{segment.to}</span>
                            </div>
                          </div>
                        </div>
                        <div className="route-segment-details">
                          <div className="route-segment-distance">
                            <FaRuler />
                            <span>{formatDistance(segment.distance)}</span>
                          </div>
                          <div className="route-segment-duration">
                            <FaClock />
                            <span>{formatDuration(segment.duration)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Nova seção de Informações de Preço */}
            {order.pricing && (
              <div className="order-detail-section">
                <h2 className="section-title">Informações de Preço</h2>
                <div className="price-info-container">
                  <div className="price-info-cards">
                    <div className="price-info-card">
                      <div className="price-info-icon">
                        <FaDollarSign />
                      </div>
                      <div className="price-info-content">
                        <h3>Preço por KM</h3>
                        <p>{formatCurrency(order.pricing.kmRate)}</p>
                      </div>
                    </div>

                    <div className="price-info-card">
                      <div className="price-info-icon">
                        <FaRuler />
                      </div>
                      <div className="price-info-content">
                        <h3>Preço Base</h3>
                        <p className="price-value">{formatCurrency(order.pricing.kmBasedPrice)}</p>
                        <p className="price-calculation">
                          {formatDistance(order.routeDistance?.totalDistance || 0)} × {formatCurrency(order.pricing.kmRate)}
                        </p>
                      </div>
                    </div>

                    {order.pricing.minimumPrice !== null && (
                      <div className="price-info-card">
                        <div className="price-info-icon">
                          <FaMoneyBillWave />
                        </div>
                        <div className="price-info-content">
                          <h3>Preço Mínimo</h3>
                          <p>{formatCurrency(order.pricing.minimumPrice)}</p>
                        </div>
                      </div>
                    )}

                    <div className="price-info-card final-price">
                      <div className="price-info-icon">
                        <FaFileInvoiceDollar />
                      </div>
                      <div className="price-info-content">
                        <h3>Preço Final</h3>
                        <p className="final-price-value">{formatCurrency(order.pricing.finalPrice)}</p>
                        <p className="price-calculation">
                          {order.pricing.minimumPrice !== null
                            ? `Maior valor entre preço base e mínimo`
                            : `Baseado na distância total`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Texto de explicação do cálculo */}
                  <div className="price-explanation">
                    <h3 className="subsection-title">Como o preço foi calculado</h3>
                    <p>
                      O preço base é calculado multiplicando a distância total ({formatDistance(order.routeDistance?.totalDistance || 0)})
                      pelo preço por quilômetro ({formatCurrency(order.pricing.kmRate)}), resultando em {formatCurrency(order.pricing.kmBasedPrice)}.
                    </p>
                    
                    {order.pricing.minimumPrice !== null ? (
                      <>
                        <p>
                          Existe um preço mínimo de {formatCurrency(order.pricing.minimumPrice)} definido para esta rota.
                        </p>
                        <p>
                          O preço final é o maior valor entre o preço base e o preço mínimo: {formatCurrency(order.pricing.finalPrice)}.
                        </p>
                      </>
                    ) : (
                      <p>
                        Como não há preço mínimo definido para esta rota, o preço final é igual ao preço base: {formatCurrency(order.pricing.finalPrice)}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="order-detail-section">
              <h2 className="section-title">Rota</h2>
              <div className="route-points-list">
                {order.routePoints?.map((point, index) => (
                  <div 
                    key={index} 
                    className={`route-point-card 
                      ${index === 0 ? 'origin-point' : ''}
                      ${index === order.routePoints!.length - 1 ? (point.isLastPassenger ? 'last-passenger-point' : 'destination-point') : ''}
                    `}
                  >
                    <div className="route-point-icon">
                      {getLocationIcon(point)}
                    </div>
                    <div className="route-point-number">{index + 1}</div>
                    <div className="route-point-info">
                      <h3>{point.name}</h3>
                      <p>{point.address}</p>
                      <div className="route-point-tags">
                        {index === 0 && <span className="point-tag origin-tag">Origem</span>}
                        {index === order.routePoints!.length - 1 && !point.isLastPassenger && <span className="point-tag destination-tag">Destino</span>}
                        {point.isLastPassenger && <span className="point-tag last-passenger-tag">Último passageiro</span>}
                        {point.isCompany && <span className="point-tag company-tag">Empresa</span>}
                        {point.locationType && (
                          <span className={`point-tag location-type-tag ${point.locationType}`}>
                            {getLocationTypeLabel(point)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="order-detail-section">
                <h2 className="section-title">{order.transportType === 'person' ? 'Passageiros' : 'Cargas'}</h2>
                <div className="items-list">
                  {order.items.map((item, index) => (
                    <div key={index} className="item-card">
                      <h3>{item.name}</h3>
                      <p><strong>Endereço:</strong> {item.address}</p>
                      {order.transportType === 'cargo' && item.weight && (
                        <p><strong>Peso:</strong> {item.weight} kg</p>
                      )}
                      {order.transportType === 'cargo' && item.dimensions && (
                        <p>
                          <strong>Dimensões (cm):</strong> {item.dimensions.length} x {item.dimensions.width} x {item.dimensions.height}
                        </p>
                      )}
                    </div>
                  ))}
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