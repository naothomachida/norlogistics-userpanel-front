import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { removeOrder } from '../../../store/ordersSlice';
import Header from '../../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import './order-list.css';
import { 
  FaPlane, 
  FaHotel, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaHome, 
  FaCity,
  FaUser,
  FaUserSlash,
  FaCheck,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEllipsisV,
  FaEye,
  FaCopy,
  FaTrash,
  FaBox,
  FaUserTie,
  FaRoad,
  FaClock,
  FaMoneyBillWave
} from 'react-icons/fa';

// Add type definition for Order with comprehensive index signature
type Order = {
  id: string;
  status: string;
  transportType?: string;
  vehicleType?: string;
  routePoints?: any[];
  userId: string;
  driverId?: string;
  [key: string]: any;
};

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

// Modify the existing type definitions
type SortConfig = {
  key: keyof Order;
  direction: 'asc' | 'desc';
  type: 'auto' | 'alphabetic' | 'numeric' | 'date';
};

// Modify the OrderFilters type to include sorting
type OrderFilters = {
  status: string;
  type: string;
  dateRange: string;
  searchQuery: string;
  sortKey: keyof Order | string;
  sortDirection: 'asc' | 'desc';
  sortType: 'auto' | 'alphabetic' | 'numeric' | 'date';
};

// Function to generate company initials
const getCompanyInitials = (name: string): string => {
  // Split the name into words and take first letters
  const words = name.split(/\s+/);
  
  // If only one word, take first two letters
  if (words.length === 1) {
    return name.slice(0, 2).toUpperCase();
  }
  
  // Take first letter of first two words
  return words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

// Map Pin Icon Component
const MapPinIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#6b46c1" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" fill="#6b46c1" />
  </svg>
);

// Function to get location icon (moved up in the file)
const getLocationDetails = (point: any) => {
  // Convert point name to lowercase for case-insensitive matching
  const pointNameLower = (point.name || '').toLowerCase();

  console.log('Location Details Debug', {
    pointName: point.name,
    pointNameLower,
    pointType: point.type,
    isCompany: point.isCompany,
    isLastPassenger: point.isLastPassenger,
    pointDetails: point
  });

  // Specific airport check
  const airportKeywords = ['aeroporto', 'airport', 'congonhas', 'internacional'];
  if (airportKeywords.some(keyword => pointNameLower.includes(keyword))) {
    return { 
      icon: <FaPlane />, 
      label: 'Aeroporto' 
    };
  }

  // Specific hotel check
  const hotelKeywords = ['hotel', 'mercure', 'pullman', 'renaissance'];
  if (hotelKeywords.some(keyword => pointNameLower.includes(keyword))) {
    return { 
      icon: <FaHotel />, 
      label: 'Hotel' 
    };
  }

  // Predefined locations from settings (placeholder - replace with actual settings logic)
  const predefinedLocations = [
    'centro de distribuição',
    'depósito central',
    'centro de convenções',
    'shopping ibirapuera',
    'aeroporto de congonhas'
  ];

  // Check if the location is in predefined locations
  const isPredefinedLocation = predefinedLocations.some(loc => 
    pointNameLower.includes(loc)
  );

  // If it's a predefined location, use purple initials
  if (isPredefinedLocation) {
    // Custom component for location initials with purple styling
    const LocationInitialsIcon = () => (
      <div 
        style={{
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(107, 70, 193, 0.1)', // Light purple background
          color: '#6b46c1', // Purple text color
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.7rem'
        }}
      >
        {getCompanyInitials(point.name || 'LO')}
      </div>
    );

    return { 
      icon: <LocationInitialsIcon />, 
      label: point.name || 'Local Predefinido' 
    };
  }

  // Check for company locations
  if (point.isCompany) {
    // Custom component for company initials with purple styling
    const CompanyInitialsIcon = () => (
      <div 
        style={{
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(107, 70, 193, 0.1)', // Light purple background
          color: '#6b46c1', // Purple text color
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.7rem'
        }}
      >
        {getCompanyInitials(point.name || 'CO')}
      </div>
    );

    return { 
      icon: <CompanyInitialsIcon />, 
      label: `Empresa: ${point.name || 'Empresa'}` 
    };
  }

  // Check for last passenger destination
  if (point.isLastPassenger) {
    return { 
      icon: <FaHome />, 
      label: 'Destino Final' 
    };
  }

  // Fallback to map pin for other locations
  return { 
    icon: <MapPinIcon />, 
    label: point.name || 'Outro Local' 
  };
};

const OrderList: React.FC = () => {
  const orders = useSelector((state: RootState) => state.orders.orders);
  const { userProfile, users } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  // Add items per page state
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Update initial state to include sorting
  const [filters, setFilters] = useState<OrderFilters>({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    searchQuery: '',
    sortKey: 'id',
    sortDirection: 'desc',
    sortType: 'auto'
  });

  // State to manage which order's dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Refs for managing dropdowns
  const dropdownRef = useRef<HTMLDivElement>(null);
  const actionsDropdownRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const dropdownTriggerRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Function to position dropdown
  const positionDropdown = useCallback((triggerEl: HTMLButtonElement) => {
    console.log('Position Dropdown Called', {
      triggerEl,
      dropdownRef: dropdownRef.current
    });

    if (!dropdownRef.current) {
      console.error('Dropdown ref is null');
      return;
    }

    if (!triggerEl) {
      console.error('Trigger element is null');
      return;
    }

    try {
      const triggerRect = triggerEl.getBoundingClientRect();
      const dropdownEl = dropdownRef.current;

      // Ensure dropdown element is visible
      dropdownEl.style.display = 'block';
      dropdownEl.style.visibility = 'hidden';

      console.log('Dropdown Positioning Details', {
        triggerRect,
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        dropdownHeight: dropdownEl.offsetHeight,
        dropdownWidth: dropdownEl.offsetWidth
      });

      // Calculate position
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      let top, bottom;
      if (spaceBelow > dropdownEl.offsetHeight + 20) {
        // Dropdown fits below (added extra space for arrow)
        top = triggerRect.bottom + window.scrollY + 10;
        bottom = 'auto';
      } else if (spaceAbove > dropdownEl.offsetHeight + 20) {
        // Dropdown fits above (added extra space for arrow)
        top = triggerRect.top + window.scrollY - dropdownEl.offsetHeight - 10;
        bottom = 'auto';
      } else {
        // Fallback: center of screen
        top = (window.innerHeight - dropdownEl.offsetHeight) / 2 + window.scrollY;
        bottom = 'auto';
      }

      // Horizontal positioning (adjust to align arrow with trigger)
      const left = triggerRect.right - dropdownEl.offsetWidth + window.scrollX - 10;

      console.log('Calculated Dropdown Position', {
        top,
        left,
        bottom
      });

      // Apply styles
      dropdownEl.style.position = 'fixed';
      dropdownEl.style.top = `${top}px`;
      dropdownEl.style.left = `${left}px`;
      dropdownEl.style.bottom = bottom === 'auto' ? 'auto' : `${bottom}px`;
      dropdownEl.style.visibility = 'visible';
    } catch (error) {
      console.error('Error positioning dropdown', error);
    }
  }, []);

  // Função para atualizar os filtros
  const updateFilter = (
    filterType: keyof OrderFilters, 
    value: string | keyof Order
  ) => {
    setFilters(prevFilters => {
      // Special handling for sorting
      if (filterType === 'sortKey') {
        // Cycle through sort types when same key is selected
        const newSortType = 
          prevFilters.sortKey === value && prevFilters.sortKey === filters.sortKey
            ? (prevFilters.sortType === 'auto' ? 'alphabetic' :
               prevFilters.sortType === 'alphabetic' ? 'numeric' :
               prevFilters.sortType === 'numeric' ? 'date' : 
               'auto')
            : 'auto';

        // Determine new direction
        const newDirection = 
          prevFilters.sortKey === value && prevFilters.sortDirection === 'desc' 
            ? 'asc' 
            : 'desc';

        return {
          ...prevFilters,
          sortKey: value as keyof Order,
          sortDirection: newDirection,
          sortType: newDirection === 'desc' ? newSortType : 'auto'
        };
      }

      // Normal filter update
      return {
        ...prevFilters,
      [filterType]: value
      };
    });
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
      searchQuery: '',
      sortKey: 'id',
      sortDirection: 'desc',
      sortType: 'auto'
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

  // Primeiro filtramos as ordens com base na role do usuário
  const roleFilteredOrders = useMemo(() => {
    if (!userProfile) return [];

    // Para admin, mostrar todas as ordens
    if (userProfile.role === 'admin') {
      return orders;
    }

    // Para user, mostrar apenas ordens criadas por esse usuário
    if (userProfile.role === 'user') {
      return orders.filter(order => order.userId === userProfile.id);
    }

    // Para manager, mostrar ordens criadas pelo gerente ou por usuários gerenciados por ele
    if (userProfile.role === 'manager') {
      // Identificar IDs de usuários gerenciados por este gerente
      const managedUserIds = userProfile.managedUsers || [];
      
      return orders.filter(order => 
        // Ordens criadas pelo próprio gerente
        order.userId === userProfile.id || 
        // Ordens criadas por usuários gerenciados pelo gerente
        managedUserIds.includes(order.userId)
      );
    }

    // Para motoristas (driver), mostrar apenas ordens em que ele está atribuído
    if (userProfile.role === 'driver') {
      return orders.filter(order => order.driverId === userProfile.id);
    }

    // Para outros roles, mostrar apenas suas próprias ordens
    return orders.filter(order => order.userId === userProfile.id);
  }, [orders, userProfile]);

  // Depois aplicamos os filtros adicionais
  const filteredOrders = useMemo(() => {
    return roleFilteredOrders.filter(order => {
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
  }, [roleFilteredOrders, filters]);

  // Modify the sorting logic in sortedOrders to handle pagination
  const sortedOrders = useMemo(() => {
    let ordersToSort = [...filteredOrders];
    
    ordersToSort.sort((a, b) => {
      // Helper function to safely get nested property values
      const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => 
          acc && acc[part] !== undefined ? acc[part] : undefined, obj);
      };

      // Check if the sort key includes a dot (indicating nested property)
      const isNestedKey = typeof filters.sortKey === 'string' && filters.sortKey.includes('.');

      const aValue = isNestedKey 
        ? getNestedValue(a, filters.sortKey as string) 
        : a[filters.sortKey as keyof typeof a];
      const bValue = isNestedKey 
        ? getNestedValue(b, filters.sortKey as string) 
        : b[filters.sortKey as keyof typeof b];

      // Handle null or undefined values
      if (aValue === null || aValue === undefined) return filters.sortDirection === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return filters.sortDirection === 'asc' ? -1 : 1;

      // Determine sort type
      let effectiveSortType = filters.sortType;
      if (effectiveSortType === 'auto') {
        if (typeof aValue === 'number' || !isNaN(Number(aValue))) {
          effectiveSortType = 'numeric';
        } else if (aValue instanceof Date || (!isNaN(Date.parse(String(aValue))))) {
          effectiveSortType = 'date';
        } else {
          effectiveSortType = 'alphabetic';
        }
      }

      // Sorting logic based on type
      let comparison = 0;
      switch (effectiveSortType) {
        case 'numeric':
          comparison = Number(aValue) - Number(bValue);
          break;
        case 'date':
          comparison = new Date(String(aValue)).getTime() - new Date(String(bValue)).getTime();
          break;
        case 'alphabetic':
        default:
          comparison = String(aValue).localeCompare(String(bValue));
      }

      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });

    return ordersToSort;
  }, [filteredOrders, filters]);

  // Pagination logic
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedOrders.slice(startIndex, endIndex);
  }, [sortedOrders, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  
  // Debug log
  console.log('Pagination Debug:', {
    sortedOrdersLength: sortedOrders.length,
    itemsPerPage,
    totalPages,
    currentPage,
    paginatedOrdersLength: paginatedOrders.length
  });

  // Pagination change handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Helper function to get sort type label
  const getSortTypeLabel = () => {
    switch (filters.sortType) {
      case 'auto': return 'Auto';
      case 'alphabetic': return 'A-Z';
      case 'numeric': return '0-9';
      case 'date': return 'Data';
      default: return 'Auto';
    }
  };

  // Traduzir status para português
  const translateStatus = (status: string) => {
    const translations: Record<string, string> = {
      'all': 'Todos',
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

  // Traduzir título da página baseado na role
  const pageTitle = useMemo(() => {
    if (!userProfile) return 'Solicitações';

    const roleTitles = {
      'admin': 'Solicitações - Administrador',
      'user': 'Solicitações - Usuário',
      'manager': 'Solicitações - Gerente',
      'driver': 'Solicitações - Motorista'
    };

    return roleTitles[userProfile.role] || 'Solicitações';
  }, [userProfile]);

  // Function to toggle dropdown for a specific order
  const toggleDropdown = (orderId: string, event: React.MouseEvent) => {
    // Prevent event from propagating to parent elements
    event.stopPropagation();
    
    console.log('Toggle Dropdown Called', {
      orderId, 
      currentTarget: event.currentTarget,
      openDropdownId: openDropdownId
    });
    
    // Store the trigger element ref
    const triggerEl = event.currentTarget as HTMLButtonElement;
    dropdownTriggerRef.current[orderId] = triggerEl;
    
    // Toggle dropdown
    setOpenDropdownId(prev => {
      const newOpenId = prev === orderId ? null : orderId;
      
      console.log('New Open Dropdown ID', {
        prevId: prev,
        newId: newOpenId
      });
      
      // Timeout to ensure DOM is updated
      if (newOpenId !== null) {
        setTimeout(() => {
          console.log('Positioning Dropdown', {
            triggerEl,
            dropdownRef: dropdownRef.current
          });
          positionDropdown(triggerEl);
        }, 0);
      }
      
      return newOpenId;
    });
  };

  // Function to handle order actions
  const handleOrderAction = (
    action: 'view' | 'duplicate' | 'delete', 
    orderId: string, 
    event: React.MouseEvent
  ) => {
    // Prevent event from propagating
    event.stopPropagation();

    switch (action) {
      case 'view':
        navigate(`/orders/${orderId}`);
        break;
      case 'duplicate':
        // TODO: Implement order duplication logic
        console.log(`Duplicating order ${orderId}`);
        break;
      case 'delete':
        // TODO: Implement order deletion logic
        dispatch(removeOrder(orderId));
        break;
    }
    // Close dropdown after action
    setOpenDropdownId(null);
  };

  // Modify the table row rendering to use the new refs
  <tbody>
    {paginatedOrders.map((order) => (
      <tr key={order.id} className={order.driverId ? 'has-driver' : ''}>
        <td className="origin-badge-cell">
          {order.routePoints && order.routePoints.length > 0 && (
            <div className="origin-badge-icon">
              {getLocationDetails(order.routePoints[0]).icon}
            </div>
          )}
        </td>
        <td>
          <span className={`status-${order.status}`}>
            {translateStatus(order.status)}
          </span>
        </td>
        <td className="transport-type-cell">
          <span className={`transport-badge ${order.transportType || 'unknown'}`}>
            {order.transportType === 'person' ? <FaUserTie /> : <FaBox />}
            {translateTransportType(order.transportType)}
          </span>
        </td>
        <td className="vehicle-type-cell">
          {getVehicleDescription(order.vehicleType, order.transportType)}
        </td>
        <td>
          <div className="route-cell">
            <div className="route-origin" title={order.routePoints?.[0]?.address || 'N/A'}>
            {getOrigin(order.routePoints)}
          </div>
            <div className="route-separator">→</div>
            <div className="route-destination" title={order.routePoints?.[order.routePoints.length - 1]?.address || 'N/A'}>
            {getDestination(order.routePoints)}
            </div>
          </div>
        </td>
        <td>
          <div className="route-info-cell">
            <div className="route-info-item">
              <FaRoad style={{marginRight: '0.5rem'}} />
              {order.routeDistance ? 
                `${order.routeDistance.totalDistance.toFixed(2)} km` : 
                'N/A'
              }
            </div>
            <div className="route-info-item">
              <FaClock style={{marginRight: '0.5rem'}} />
              {order.routeDistance ? 
                `${order.routeDistance.totalDuration.toFixed(1)} min` : 
                'N/A'
              }
            </div>
          </div>
        </td>
        <td>
          <div className="value-cell">
            <div className="total-value">
              <FaMoneyBillWave style={{marginRight: '0.5rem'}} />
              {order.pricing?.finalPrice ? 
                `R$ ${order.pricing.finalPrice.toFixed(2)}` : 
                'N/A'
              }
            </div>
            <div className="km-rate">
              <FaRoad style={{marginRight: '0.5rem'}} />
              {order.pricing?.kmRate ? 
                `R$ ${order.pricing.kmRate.toFixed(2)}/km` : 
                'N/A'
              }
            </div>
          </div>
        </td>
        {userProfile?.role !== 'driver' && (
          <td>
            {order.driverId ? (
              <div className="driver-assigned">
                <div className="driver-assigned-icon">
                  <FaCheck />
                </div>
              </div>
            ) : (
              <div className="driver-assigned">
                <div className="driver-assigned-icon not-assigned">
                  <FaUserSlash />
                </div>
              </div>
            )}
          </td>
        )}
        <td>
          <div 
            className="order-actions-container" 
            ref={(el) => {
              if (el) {
                actionsDropdownRef.current[order.id] = el;
              }
            }}
          >
            <button 
              ref={(el) => {
                if (el) {
                  dropdownTriggerRef.current[order.id] = el;
                }
              }}
              className="order-actions-dropdown-btn"
              onClick={(e) => toggleDropdown(order.id, e)}
            >
              <FaEllipsisV />
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>

  // Modify the click outside effect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('Click Outside Dropdown', {
        openDropdownId,
        target: event.target,
        dropdownContainer: actionsDropdownRef.current[openDropdownId || ''],
        dropdownEl: dropdownRef.current,
        triggerEl: dropdownTriggerRef.current[openDropdownId || '']
      });

      if (openDropdownId) {
        const dropdownContainer = actionsDropdownRef.current[openDropdownId];
        const dropdownEl = dropdownRef.current;
        const triggerEl = dropdownTriggerRef.current[openDropdownId];

        if (
          dropdownContainer && 
          dropdownEl &&
          triggerEl &&
          !dropdownContainer.contains(event.target as Node) &&
          !dropdownEl.contains(event.target as Node) &&
          !triggerEl.contains(event.target as Node)
        ) {
          console.log('Closing Dropdown due to outside click');
          setOpenDropdownId(null);
        }
      }
    };

    // Add event listener when dropdown is open
    if (openDropdownId) {
      console.log('Adding click outside listener');
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener
    return () => {
      console.log('Removing click outside listener');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  return (
    <div className="orders-page">
      <Header />
      <div className="orders-content">
        <div className="orders-main">
          <div className="orders-layout">
            <div className="orders-filters-sidebar">
              {(userProfile?.role === 'admin' || userProfile?.role === 'user') && (
                <div style={{ marginBottom: '1rem' }}>
                <button 
                    className="new-order-btn outlined-purple-btn"
                  onClick={() => navigate('/orders/new')}
                >
                    Nova solicitação
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
                  </svg>
              </button>
            </div>
              )}

              <div className="filter-section">
                <h3>Status</h3>
                {/* Status filter dropdown */}
                <div className="filter-dropdown">
                  <select 
                    value={filters.status} 
                    onChange={(e) => updateFilter('status', e.target.value)}
              >
                    <option value="all">Todos</option>
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="en_route">Em Rota</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
              </div>
                  </div>

              <div className="filter-section">
                <h3>Tipo</h3>
                {/* Type filter dropdown */}
                <div className="filter-dropdown">
                  <select 
                    value={filters.type} 
                    onChange={(e) => updateFilter('type', e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="person">Passageiro</option>
                    <option value="cargo">Carga</option>
                  </select>
                  </div>
                  </div>

              <div className="filter-section">
                <h3>Data</h3>
                {/* Date filter dropdown */}
                <div className="filter-dropdown">
                  <select 
                    value={filters.dateRange} 
                    onChange={(e) => updateFilter('dateRange', e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="today">Hoje</option>
                    <option value="week">Última Semana</option>
                    <option value="month">Último Mês</option>
                  </select>
                  </div>
            </div>
            
              {/* New section for items per page */}
              <div className="filter-section">
                <h3>Itens por Página</h3>
                <div className="filter-dropdown">
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => {
                      const newItemsPerPage = Number(e.target.value);
                      setItemsPerPage(newItemsPerPage);
                      // Reset to first page when changing items per page
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10 itens</option>
                    <option value={25}>25 itens</option>
                    <option value={50}>50 itens</option>
                    <option value={100}>100 itens</option>
                  </select>
              </div>
                  </div>

              {/* New sorting section */}
              <div className="filter-section">
                <h3>Ordenação</h3>
                <div className="filter-dropdown">
                  <select 
                    value={filters.sortKey} 
                    onChange={(e) => updateFilter('sortKey', e.target.value as keyof Order | string)}
                  >
                    <option value="status">Status</option>
                    <option value="transportType">Tipo</option>
                    <option value="vehicleType">Veículo</option>
                    <option value="routeDistance.totalDistance">Distância</option>
                    <option value="pricing.finalPrice">Valor Total</option>
                  </select>
                  </div>

                <div className="sort-direction-toggle">
                  <button 
                    onClick={(e) => updateFilter('sortDirection', filters.sortDirection === 'asc' ? 'desc' : 'asc')}
                    className="sort-direction-btn"
                  >
                    {filters.sortDirection === 'asc' ? '▲ Crescente' : '▼ Decrescente'}
                  </button>
            </div>
            
                <div className="sort-type-toggle">
                  <button 
                    onClick={(e) => updateFilter('sortKey', filters.sortKey)}
                    className="sort-type-btn"
                  >
                    Tipo: {getSortTypeLabel()}
                  </button>
              </div>
                  </div>

              {activeFilterCount > 0 && (
                <div className="filter-clear-section">
                  <button onClick={clearAllFilters} className="clear-filters-btn">
                    Limpar Filtros ({activeFilterCount})
                  </button>
                </div>
              )}
            </div>
            
            <div className="orders-table-container">
              <div className="orders-title-row">
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    width: '100%', 
                    marginBottom: '1rem' 
                  }}>
                    <h1 className="orders-title">{pageTitle}</h1>
                    <div className="action-buttons">
                      <button className="outlined-export-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
              </svg>
                        Exportar
                      </button>
                    </div>
                  </div>
                  <div className="search-filter-section" style={{ width: '100%' }}>
              <input 
                type="text" 
                      placeholder="Buscar solicitação" 
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                      className="search-input-sidebar"
                      style={{ width: '100%' }}
              />
            </div>
              </div>
          </div>

              <table className="orders-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Status</th>
                    <th>Tipo</th>
                    <th>Veículo</th>
                    <th>Rota</th>
                    <th>Rota Info</th>
                    <th>Valor</th>
                    {userProfile?.role !== 'driver' && <th>Motorista</th>}
                    <th style={{textAlign: 'center'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className={order.driverId ? 'has-driver' : ''}>
                      <td className="origin-badge-cell">
                        {order.routePoints && order.routePoints.length > 0 && (
                          <div className="origin-badge-icon">
                            {getLocationDetails(order.routePoints[0]).icon}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`status-${order.status}`}>
                          {translateStatus(order.status)}
                        </span>
                      </td>
                      <td className="transport-type-cell">
                        <span className={`transport-badge ${order.transportType || 'unknown'}`}>
                          {order.transportType === 'person' ? <FaUserTie /> : <FaBox />}
                          {translateTransportType(order.transportType)}
                        </span>
                      </td>
                      <td className="vehicle-type-cell">
                        {getVehicleDescription(order.vehicleType, order.transportType)}
                      </td>
                      <td>
                        <div className="route-cell">
                          <div className="route-origin" title={order.routePoints?.[0]?.address || 'N/A'}>
                          {getOrigin(order.routePoints)}
                        </div>
                          <div className="route-separator">→</div>
                          <div className="route-destination" title={order.routePoints?.[order.routePoints.length - 1]?.address || 'N/A'}>
                          {getDestination(order.routePoints)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="route-info-cell">
                          <div className="route-info-item">
                            <FaRoad style={{marginRight: '0.5rem'}} />
                            {order.routeDistance ? 
                              `${order.routeDistance.totalDistance.toFixed(2)} km` : 
                              'N/A'
                            }
                          </div>
                          <div className="route-info-item">
                            <FaClock style={{marginRight: '0.5rem'}} />
                            {order.routeDistance ? 
                              `${order.routeDistance.totalDuration.toFixed(1)} min` : 
                              'N/A'
                            }
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="value-cell">
                          <div className="total-value">
                            <FaMoneyBillWave style={{marginRight: '0.5rem'}} />
                            {order.pricing?.finalPrice ? 
                              `R$ ${order.pricing.finalPrice.toFixed(2)}` : 
                              'N/A'
                            }
                          </div>
                          <div className="km-rate">
                            <FaRoad style={{marginRight: '0.5rem'}} />
                            {order.pricing?.kmRate ? 
                              `R$ ${order.pricing.kmRate.toFixed(2)}/km` : 
                              'N/A'
                            }
                          </div>
                        </div>
                      </td>
                      {userProfile?.role !== 'driver' && (
                        <td>
                          {order.driverId ? (
                            <div className="driver-assigned">
                              <div className="driver-assigned-icon">
                                <FaCheck />
                              </div>
                            </div>
                          ) : (
                            <div className="driver-assigned">
                              <div className="driver-assigned-icon not-assigned">
                                <FaUserSlash />
                              </div>
                            </div>
                          )}
                        </td>
                      )}
                      <td>
                        <div 
                          className="order-actions-container" 
                          ref={(el) => {
                            if (el) {
                              actionsDropdownRef.current[order.id] = el;
                            }
                          }}
                        >
                          <button 
                            ref={(el) => {
                              if (el) {
                                dropdownTriggerRef.current[order.id] = el;
                              }
                            }}
                            className="order-actions-dropdown-btn"
                            onClick={(e) => toggleDropdown(order.id, e)}
                          >
                            <FaEllipsisV />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination container */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-page-info">
                    {paginatedOrders.length} de {sortedOrders.length} 
                    {` (Página ${currentPage} de ${totalPages})`}
                  </div>
                  <div className="pagination-controls">
                    {/* First page button */}
                    <button 
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={`pagination-btn first-page ${currentPage === 1 ? 'disabled' : ''}`}
                      title="Primeira página"
                    >
                      «
                    </button>

                    {/* Previous page button */}
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`pagination-btn prev-page ${currentPage === 1 ? 'disabled' : ''}`}
                      title="Página anterior"
                    >
                      ‹
                    </button>

                    {/* Page number buttons */}
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`pagination-btn page-number ${currentPage === index + 1 ? 'active' : ''}`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    {/* Next page button */}
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`pagination-btn next-page ${currentPage === totalPages ? 'disabled' : ''}`}
                      title="Próxima página"
                    >
                      ›
                    </button>

                    {/* Last page button */}
                    <button 
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`pagination-btn last-page ${currentPage === totalPages ? 'disabled' : ''}`}
                      title="Última página"
                    >
                      »
                    </button>
                  </div>
            </div>
          )}

              {/* Fallback for single page or no results */}
              {totalPages <= 1 && (
                <div className="pagination-container">
                  <div className="pagination-page-info">
                    {paginatedOrders.length} de {sortedOrders.length} 
                    {` (Página ${currentPage} de ${totalPages})`}
      </div>
                  <div className="pagination-controls">
                    <button 
                      className="pagination-btn page-number active"
                      disabled
                    >
                      {currentPage}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dropdown rendered outside of table for proper positioning */}
      {openDropdownId && (
        <div 
          ref={dropdownRef} 
          className="order-actions-dropdown"
          style={{ 
            display: 'none', 
            position: 'fixed', 
            zIndex: 1000 
          }}
        >
          <button 
            onClick={(e) => handleOrderAction('view', openDropdownId, e)}
            className="order-action-item"
          >
            <FaEye /> Ver detalhes
          </button>
          <button 
            onClick={(e) => handleOrderAction('duplicate', openDropdownId, e)}
            className="order-action-item"
          >
            <FaCopy /> Duplicar
          </button>
          <button 
            onClick={(e) => handleOrderAction('delete', openDropdownId, e)}
            className="order-action-item delete"
          >
            <FaTrash /> Excluir
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList; 