import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import Header from '../../../components/layout/Header';
import './order-detail.css';
import { assignDriverToOrder } from '../../../store/ordersSlice';

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
                    <div className="route-point-number">{index + 1}</div>
                    <div className="route-point-info">
                      <h3>{point.name}</h3>
                      <p>{point.address}</p>
                      <div className="route-point-tags">
                        {index === 0 && <span className="point-tag origin-tag">Origem</span>}
                        {index === order.routePoints!.length - 1 && !point.isLastPassenger && <span className="point-tag destination-tag">Destino</span>}
                        {point.isLastPassenger && <span className="point-tag last-passenger-tag">Último passageiro</span>}
                        {point.isCompany && <span className="point-tag company-tag">Empresa</span>}
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