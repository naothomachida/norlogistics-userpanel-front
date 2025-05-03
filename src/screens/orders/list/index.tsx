import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { updateOrderStatus, removeOrder } from '../../../store/ordersSlice';
import Header from '../../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import './order-list.css';

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

// Função para obter a origem do pedido a partir dos pontos de rota
const getOrigin = (routePoints: any[] | undefined) => {
  if (!routePoints || routePoints.length === 0) return 'N/A';
  const origin = routePoints[0];
  
  // Retorna apenas o nome, sem indicar se é empresa ou não
  return origin.name;
};

// Função para obter o destino do pedido a partir dos pontos de rota
const getDestination = (routePoints: any[] | undefined) => {
  if (!routePoints || routePoints.length === 0) return 'N/A';
  const destination = routePoints[routePoints.length - 1];
  
  if (destination.isLastPassenger) {
    return `Último passageiro (${destination.name})`;
  }
  
  if (destination.isCompany) {
    return `${destination.name} (Empresa)`;
  }
  
  return destination.name;
};

// Tipo para representar os filtros
type OrderFilters = {
  status: string; // 'all' ou um status específico
  type: string; // 'all', 'person' ou 'cargo'
  dateRange: string; // 'all', 'today', 'week', 'month'
  searchQuery: string;
};

const OrderList: React.FC = () => {
  const orders = useSelector((state: RootState) => state.orders.orders);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  // Estado para os filtros
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  // Controle para o dropdown de filtros
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Função para atualizar os filtros
  const updateFilter = (filterType: keyof OrderFilters, value: string) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
    
    // Fechar o dropdown correspondente
    if (filterType === 'status') setShowStatusDropdown(false);
    if (filterType === 'type') setShowTypeDropdown(false);
    if (filterType === 'dateRange') setShowDateDropdown(false);
  };

  // Função para contar quantos filtros estão ativos
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      dateRange: 'all',
      searchQuery: ''
    });
  };

  // Função para criar uma data anterior com base no período
  const getDateFromRange = (range: string): Date | null => {
    const now = new Date();
    
    if (range === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
    } else if (range === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return weekAgo;
    } else if (range === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return monthAgo;
    }
    
    return null;
  };

  // Filtragem dos pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filtro por status
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }
      
      // Filtro por tipo de transporte
      if (filters.type !== 'all' && order.transportType !== filters.type) {
        return false;
      }
      
      // Filtro por data
      if (filters.dateRange !== 'all') {
        const dateRangeStart = getDateFromRange(filters.dateRange);
        
        if (dateRangeStart) {
          // Usando o ID como timestamp (assumindo que está no formato de timestamp)
          const orderDate = new Date(parseInt(order.id));
          if (orderDate < dateRangeStart) {
            return false;
          }
        }
      }
      
      // Filtro por termo de busca
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const originMatches = getOrigin(order.routePoints)?.toLowerCase().includes(searchLower);
        const destinationMatches = getDestination(order.routePoints)?.toLowerCase().includes(searchLower);
        const vehicleMatches = getVehicleDescription(order.vehicleType, order.transportType).toLowerCase().includes(searchLower);
        
        if (!originMatches && !destinationMatches && !vehicleMatches) {
          return false;
        }
      }
      
      return true;
    });
  }, [orders, filters]);

  const handleStatusChange = (id: string, newStatus: 'pending' | 'in_progress' | 'en_route' | 'completed' | 'cancelled') => {
    dispatch(updateOrderStatus({ id, status: newStatus }));
  };

  const handleRemoveOrder = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta solicitação?')) {
      dispatch(removeOrder(id));
    }
  };

  // Traduzir status para português
  const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
      'all': 'Todos',
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
    if (type === 'all') return 'Todos';
    return type === 'person' ? 'Pessoas' : 'Cargas';
  };

  // Traduzir range de data para português
  const translateDateRange = (range: string) => {
    const translations: Record<string, string> = {
      'all': 'Todas as datas',
      'today': 'Hoje',
      'week': 'Últimos 7 dias',
      'month': 'Último mês'
    };
    return translations[range] || range;
  };

  return (
    <div className="orders-page">
      <Header />
      <div className="orders-content">
        <main className="orders-main">
          <div className="orders-title-row">
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '20px' }}>
              <h1 className="orders-title">Solicitações</h1>
              <span className="orders-title-count">{filteredOrders.length}</span>
            </div>
            <div className="action-buttons">
              <button 
                className="action-button"
                onClick={() => navigate('/orders/new')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Nova solicitação
              </button>
              <button className="action-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                </svg>
                Exportar
              </button>
            </div>
          </div>

          <div className="orders-filters">
            <div className="filter-group filter-dropdown">
              <div 
                className="filter-selected" 
                onClick={() => {
                  setShowStatusDropdown(!showStatusDropdown);
                  setShowTypeDropdown(false);
                  setShowDateDropdown(false);
                }}
              >
                <span>Status: {translateStatus(filters.status)}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill="currentColor" />
                </svg>
              </div>
              {showStatusDropdown && (
                <div className="filter-options">
                  <div 
                    className={`filter-option ${filters.status === 'all' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('status', 'all')}
                  >
                    Todos
                  </div>
                  <div 
                    className={`filter-option ${filters.status === 'pending' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('status', 'pending')}
                  >
                    Pendente
                  </div>
                  <div 
                    className={`filter-option ${filters.status === 'in_progress' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('status', 'in_progress')}
                  >
                    Em andamento
                  </div>
                  <div 
                    className={`filter-option ${filters.status === 'en_route' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('status', 'en_route')}
                  >
                    Em rota
                  </div>
                  <div 
                    className={`filter-option ${filters.status === 'completed' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('status', 'completed')}
                  >
                    Concluído
                  </div>
                  <div 
                    className={`filter-option ${filters.status === 'cancelled' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('status', 'cancelled')}
                  >
                    Cancelado
                  </div>
                </div>
              )}
            </div>
            
            <div className="filter-group filter-dropdown">
              <div 
                className="filter-selected" 
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowStatusDropdown(false);
                  setShowDateDropdown(false);
                }}
              >
                <span>Tipo: {translateTransportType(filters.type)}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill="currentColor" />
                </svg>
              </div>
              {showTypeDropdown && (
                <div className="filter-options">
                  <div 
                    className={`filter-option ${filters.type === 'all' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('type', 'all')}
                  >
                    Todos
                  </div>
                  <div 
                    className={`filter-option ${filters.type === 'person' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('type', 'person')}
                  >
                    Pessoas
                  </div>
                  <div 
                    className={`filter-option ${filters.type === 'cargo' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('type', 'cargo')}
                  >
                    Cargas
                  </div>
                </div>
              )}
            </div>
            
            <div className="filter-group filter-dropdown date">
              <div 
                className="filter-selected" 
                onClick={() => {
                  setShowDateDropdown(!showDateDropdown);
                  setShowStatusDropdown(false);
                  setShowTypeDropdown(false);
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="#777" />
                </svg>
                <span style={{ marginLeft: '8px' }}>{translateDateRange(filters.dateRange)}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10l5 5 5-5z" fill="currentColor" />
                </svg>
              </div>
              {showDateDropdown && (
                <div className="filter-options">
                  <div 
                    className={`filter-option ${filters.dateRange === 'all' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('dateRange', 'all')}
                  >
                    Todas as datas
                  </div>
                  <div 
                    className={`filter-option ${filters.dateRange === 'today' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('dateRange', 'today')}
                  >
                    Hoje
                  </div>
                  <div 
                    className={`filter-option ${filters.dateRange === 'week' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('dateRange', 'week')}
                  >
                    Últimos 7 dias
                  </div>
                  <div 
                    className={`filter-option ${filters.dateRange === 'month' ? 'selected' : ''}`} 
                    onClick={() => updateFilter('dateRange', 'month')}
                  >
                    Último mês
                  </div>
                </div>
              )}
            </div>
            
            <div className="filter-spacer"></div>
            
            <div className="search-input">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar solicitações" 
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
              />
            </div>
            
            {activeFilterCount > 0 && (
              <div className="filter-group filter-clear" onClick={clearAllFilters}>
                <span>Filtros ({activeFilterCount})</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>Nenhuma solicitação encontrada com os filtros atuais.</p>
              {activeFilterCount > 0 && (
                <button 
                  className="action-button" 
                  style={{ margin: '1rem auto', display: 'flex' }}
                  onClick={clearAllFilters}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                  </svg>
                  Limpar filtros
                </button>
              )}
              <button 
                className="action-button" 
                style={{ margin: '1rem auto', display: 'flex' }}
                onClick={() => navigate('/orders/new')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                </svg>
                Nova solicitação
              </button>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Veículo</th>
                    <th>Origem</th>
                    <th>Destino</th>
                    <th>Paradas</th>
                    <th>Status</th>
                    <th style={{textAlign: 'center'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="transport-type-cell">
                        <span className={`transport-badge ${order.transportType || 'unknown'}`}>
                          {translateTransportType(order.transportType)}
                        </span>
                      </td>
                      <td>{getVehicleDescription(order.vehicleType, order.transportType)}</td>
                      <td>
                        <div className="location-cell" title={order.routePoints?.[0]?.address || 'N/A'}>
                          {getOrigin(order.routePoints)}
                        </div>
                      </td>
                      <td>
                        <div className="location-cell" title={order.routePoints?.[order.routePoints.length - 1]?.address || 'N/A'}>
                          {getDestination(order.routePoints)}
                        </div>
                      </td>
                      <td>{order.routePoints?.length || 0}</td>
                      <td>
                        <div className="status-select">
                          <select 
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                            className={`status-${order.status}`}
                          >
                            <option value="pending">Pendente</option>
                            <option value="in_progress">Em andamento</option>
                            <option value="en_route">Em rota</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className="action-icons">
                          <button className="action-icon" onClick={() => navigate(`/orders/${order.id}`)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                            </svg>
                          </button>
                          <button 
                            className="action-icon" 
                            onClick={() => handleRemoveOrder(order.id)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderList; 