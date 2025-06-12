import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import './tolls.css';

// Nova interface baseada na resposta da API própria
interface NewTollStation {
  id: number;
  name: string;
  concessionaire: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  distanceFromRoute: number;
  cost: number;
  axleCount: number;
  category: string;
  tags: string[];
  highway: string;
  km: number;
}

interface NewApiResponse {
  status: string;
  data: {
    origin: string;
    destination: string;
    waypoints: any[];
    totalDistance: number;
    totalDuration: number;
    axleCount: number;
    tolls: NewTollStation[];
    totalCost: number;
    totalTollCost: number;
    googleMapsLink: {
      routeUrl: string;
      tolls: Array<{
        name: string;
        lat: number;
        lng: number;
        googleMapsLink: string;
        cost: string;
        axleCount: number;
      }>;
    };
    metadata: {
      processedIn: string;
      locationsProcessed: number;
      tollsFound: number;
      totalCost: number;
      timestamp: string;
    };
  };
}

interface TollData {
  origem: string;
  destino: string;
  pedagios: Array<{
    nome: string;
    valor: number;
    tipo: string;
    localizacao: string;
    rodovia?: string;
    estado?: string;
    concessionaria?: string;
    km?: number;
    googleMapsLink?: string;
  }>;
  custoTotal: number;
  totalPedagios: number;
  distanciaTotal: number;
  duracaoTotal: number;
  status: string;
  message?: string;
  routeUrl?: string;
}

const Tolls: React.FC = () => {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);
  const [tollData, setTollData] = useState<TollData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [axleCount, setAxleCount] = useState<number>(2);

  // Nova API própria
  const API_BASE_URL = 'http://localhost:3000/api/check-route';

  const axleOptions = [
    { value: 2, label: '2 eixos (Carro, Moto)' },
    { value: 3, label: '3 eixos' },
    { value: 4, label: '4 eixos' },
    { value: 5, label: '5 eixos' },
    { value: 6, label: '6 eixos' },
    { value: 7, label: '7 eixos' },
    { value: 8, label: '8 eixos' },
    { value: 9, label: '9 eixos' }
  ];

  const handleCalculateTolls = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origem.trim() || !destino.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError(null);
    setTollData(null);

    try {
      console.log('Calculando pedágios usando nossa API própria...');
      
      const requestBody = {
        locations: [origem.trim(), destino.trim()],
        axleCount: axleCount
      };

      console.log('Dados da requisição:', requestBody);
      console.log('URL da requisição:', API_BASE_URL);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Status da resposta:', response.status);
      
      const responseText = await response.text();
      console.log('Resposta raw da API:', responseText);

      let data: NewApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erro ao fazer parse JSON:', e);
        throw new Error(`Resposta inválida da API: ${responseText}`);
      }

      if (!response.ok) {
        console.error('Erro da API:', responseText);
        throw new Error(`Erro ${response.status}: ${responseText}`);
      }

      console.log('Resposta da API:', data);

      if (data.status !== 'success') {
        throw new Error('Erro na consulta da rota');
      }

      // Processar dados dos pedágios
      const pedagiosProcessados = data.data.tolls.map((toll: NewTollStation) => ({
        nome: toll.name,
        valor: toll.cost,
        tipo: toll.category,
        localizacao: toll.location.address,
        rodovia: toll.highway,
        estado: toll.location.state,
        concessionaria: toll.concessionaire,
        km: toll.km,
        googleMapsLink: data.data.googleMapsLink.tolls.find(t => t.name === toll.name)?.googleMapsLink
      }));

      const processedData: TollData = {
        origem: data.data.origin,
        destino: data.data.destination,
        pedagios: pedagiosProcessados,
        custoTotal: data.data.totalCost,
        totalPedagios: data.data.tolls.length,
        distanciaTotal: data.data.totalDistance,
        duracaoTotal: data.data.totalDuration,
        status: 'success',
        routeUrl: data.data.googleMapsLink.routeUrl
      };

      console.log('Dados processados:', processedData);
      setTollData(processedData);

    } catch (err: any) {
      console.error('Erro ao calcular pedágios:', err);
      
      let errorMessage = 'Erro ao calcular pedágios. ';
      
      if (err.message.includes('404')) {
        errorMessage += 'Rota não encontrada. Verifique os nomes das cidades.';
      } else if (err.message.includes('500')) {
        errorMessage += 'Erro interno do servidor. Tente novamente em alguns minutos.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage += 'Erro de conexão. Verifique se a API está rodando em localhost:3000.';
      } else {
        errorMessage += err.message || 'Verifique os nomes das cidades e tente novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setOrigem('');
    setDestino('');
    setTollData(null);
    setError(null);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDistance = (distance: number): string => {
    return `${distance.toFixed(1)} km`;
  };

  const formatDuration = (duration: number): string => {
    const hours = Math.floor(duration / 60);
    const minutes = Math.round(duration % 60);
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
  };

  const getAxleLabel = (): string => {
    const axleOption = axleOptions.find(a => a.value === axleCount);
    return axleOption ? axleOption.label : '2 eixos (Carro, Moto)';
  };

  return (
    <div className="tolls-page">
      <Header />
      <div className="tolls-content">
        <div className="tolls-header">
          <h1 className="tolls-title">Calculadora de Pedágios</h1>
          <p className="tolls-subtitle">
            Calcule os custos de pedágios para suas rotas usando nossa API própria
          </p>
        </div>

        <div className="tolls-main">
          <div className="tolls-form-section">
            <div className="tolls-card">
              <div className="tolls-card-header">
                <h2>
                  <span className="card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                    </svg>
                  </span>
                  Calcular Rota
                </h2>
              </div>

              <form onSubmit={handleCalculateTolls} className="tolls-form">
                <div className="form-group">
                  <label htmlFor="origem">Cidade de Origem</label>
                  <input
                    type="text"
                    id="origem"
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    placeholder="Ex: São Paulo, SP"
                    className="form-input"
                    disabled={loading}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Formato: Cidade, Estado
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="destino">Cidade de Destino</label>
                  <input
                    type="text"
                    id="destino"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Ex: Rio de Janeiro, RJ"
                    className="form-input"
                    disabled={loading}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Formato: Cidade, Estado
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="axleCount">Número de Eixos</label>
                  <select
                    id="axleCount"
                    value={axleCount}
                    onChange={(e) => setAxleCount(Number(e.target.value))}
                    className="form-select"
                    disabled={loading}
                  >
                    {axleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Calculando...' : 'Calcular Pedágios'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleClearForm}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Limpar
                  </button>
                </div>
              </form>

              {error && (
                <div className="error-message">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </div>

          {tollData && (
            <div className="tolls-results-section">
              <div className="tolls-card">
                <div className="tolls-card-header">
                  <h2>
                    <span className="card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="currentColor"/>
                      </svg>
                    </span>
                    Resultados dos Pedágios - {getAxleLabel()}
                  </h2>
                </div>

                <div className="results-summary">
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="summary-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="summary-content">
                        <h3>Total Praças</h3>
                        <p>{tollData.totalPedagios}</p>
                      </div>
                    </div>

                    <div className="summary-card">
                      <div className="summary-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="summary-content">
                        <h3>Total Dinheiro</h3>
                        <p>{formatCurrency(tollData.custoTotal)}</p>
                      </div>
                    </div>

                    <div className="summary-card total">
                      <div className="summary-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 17H22V19H2V17ZM1.15 12.95L4 15.47L9.62 9.85L12.5 12.73L22.84 2.39L21.43 0.97L12.5 9.9L9.62 7.02L3.29 13.35L1.15 12.95Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="summary-content">
                        <h3>Distância Total</h3>
                        <p>{formatDistance(tollData.distanciaTotal)}</p>
                      </div>
                    </div>

                    <div className="summary-card total">
                      <div className="summary-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 17H22V19H2V17ZM1.15 12.95L4 15.47L9.62 9.85L12.5 12.73L22.84 2.39L21.43 0.97L12.5 9.9L9.62 7.02L3.29 13.35L1.15 12.95Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="summary-content">
                        <h3>Duração Total</h3>
                        <p>{formatDuration(tollData.duracaoTotal)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {tollData.pedagios && tollData.pedagios.length > 0 && (
                  <div className="tolls-details">
                    <h3 className="details-title">Detalhes dos Pedágios ({tollData.pedagios.length} praças)</h3>
                    <div className="tolls-list">
                      {tollData.pedagios.map((pedagio, index) => (
                        <div key={index} className="toll-item">
                          <div className="toll-info">
                            <h4>{pedagio.nome}</h4>
                            <p className="toll-location">
                              {pedagio.localizacao}
                              {pedagio.rodovia && ` - ${pedagio.rodovia}`}
                              {pedagio.km && ` (KM ${pedagio.km})`}
                            </p>
                            {pedagio.concessionaria && (
                              <p className="toll-concessionaire">
                                <small>{pedagio.concessionaria}</small>
                              </p>
                            )}
                            <div className="toll-badges">
                              <span className="toll-type">{pedagio.tipo}</span>
                              {pedagio.estado && (
                                <span className="toll-state">{pedagio.estado}</span>
                              )}
                            </div>
                          </div>
                          <div className="toll-value">
                            <div>{formatCurrency(pedagio.valor)}</div>
                            {pedagio.googleMapsLink && (
                              <a 
                                href={pedagio.googleMapsLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="toll-maps-link"
                              >
                                Ver no Maps
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="route-info">
                  <div className="route-endpoints">
                    <div className="endpoint origin">
                      <div className="endpoint-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="3" fill="currentColor"/>
                        </svg>
                      </div>
                      <div>
                        <strong>Origem:</strong> {tollData.origem}
                      </div>
                    </div>
                    <div className="endpoint destination">
                      <div className="endpoint-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div>
                        <strong>Destino:</strong> {tollData.destino}
                      </div>
                    </div>
                  </div>

                  <div className="route-summary">
                    <div className="cost-breakdown">
                      <h4>Resumo de Custos para {getAxleLabel()}</h4>
                      <div className="cost-item">
                        <span>Total de Pedágios:</span>
                        <span>{formatCurrency(tollData.custoTotal)}</span>
                      </div>
                      <div className="cost-item">
                        <span>Distância Total:</span>
                        <span>{formatDistance(tollData.distanciaTotal)}</span>
                      </div>
                      <div className="cost-item">
                        <span>Duração Estimada:</span>
                        <span>{formatDuration(tollData.duracaoTotal)}</span>
                      </div>
                    </div>
                    
                    {tollData.routeUrl && (
                      <div className="route-actions">
                        <a 
                          href={tollData.routeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-maps"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                          </svg>
                          Ver Rota no Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };
  
  export default Tolls; 