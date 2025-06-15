import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import './tolls.css';
import MapComponent from './MapComponent';

// Componente de Loading Circular
const CircularProgress: React.FC = () => (
  <div className="circular-progress">
    <svg className="circular-progress-svg" viewBox="0 0 40 40">
      <circle
        className="circular-progress-track"
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="4"
      />
      <circle
        className="circular-progress-bar"
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="#6b46c1"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="113"
        strokeDashoffset="28"
      />
    </svg>
  </div>
);

// Componente de Skeleton para os Cards de Resumo
const SummaryCardSkeleton: React.FC = () => (
  <div className="summary-card skeleton">
    <div className="summary-icon skeleton-icon"></div>
    <div className="summary-content">
      <div className="skeleton-text skeleton-title"></div>
      <div className="skeleton-text skeleton-value"></div>
    </div>
  </div>
);

// Componente de Skeleton para Item de Pedágio
const TollItemSkeleton: React.FC = () => (
  <div className="toll-item skeleton">
    <div className="toll-info">
      <div className="skeleton-text skeleton-toll-name"></div>
      <div className="skeleton-text skeleton-toll-location"></div>
      <div className="skeleton-badges">
        <div className="skeleton-badge"></div>
        <div className="skeleton-badge"></div>
      </div>
    </div>
    <div className="toll-value">
      <div className="skeleton-text skeleton-toll-value"></div>
    </div>
  </div>
);

// Componente de Loading para o Painel Direito
const LoadingSkeleton: React.FC = () => (
  <div className="right-panel-skeleton">
    <h3>📊 Resultados da Rota</h3>
    
    <div className="loading-content">
      <CircularProgress />
      <div className="loading-text">
        <h3>Calculando Pedágios...</h3>
        <p>Processando sua rota e localizando pedágios</p>
      </div>
    </div>
    
    {/* Skeleton dos cards de resumo */}
    <div className="results-summary-cards">
      <div className="results-summary-card skeleton">
        <div className="skeleton-icon"></div>
        <div className="skeleton-text skeleton-summary-title"></div>
        <div className="skeleton-text skeleton-summary-value"></div>
      </div>
      <div className="results-summary-card skeleton">
        <div className="skeleton-icon"></div>
        <div className="skeleton-text skeleton-summary-title"></div>
        <div className="skeleton-text skeleton-summary-value"></div>
      </div>
    </div>

    {/* Skeleton da lista de pedágios */}
    <div className="results-toll-list">
      <div className="skeleton-text skeleton-list-title"></div>
      {[1, 2, 3].map((item) => (
        <div key={item} className="results-toll-item skeleton">
          <div className="results-toll-header">
            <div className="skeleton-toll-number"></div>
            <div className="results-toll-prices">
              <div className="skeleton-text skeleton-price"></div>
            </div>
          </div>
          <div className="results-toll-info">
            <div className="skeleton-text skeleton-toll-name"></div>
            <div className="skeleton-text skeleton-toll-location"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Interface para API própria (localhost)
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

// Interface para API do calcularpedagio.com.br
interface CalcularPedagioTollStation {
  key: string;
  id: number;
  ladoCobranca: string;
  status: string;
  sistemasTag: string[];
  pais: string;
  estado: string;
  rodovia: string;
  nomeRodovia: string;
  dinheiro: string;
  localidade: string;
  moeda: string;
  custosDinheiro: {
    moto2eixos: number | null;
    auto2eixos: number;
    auto3eixos: number;
    auto4eixos: number;
    valorPorEixoCaminhao: number;
    onibus2Eixos: number;
    motorHome2eixos: number;
    motorHome3eixos: number;
    motorHome4eixos: number;
  };
  custoTag: {
    moto2eixos: number | null;
    auto2eixos: number;
    auto3eixos: number;
    auto4eixos: number;
    valorPorEixoCaminhao: number;
    onibus2Eixos: number;
    motorHome2eixos: number;
    motorHome3eixos: number;
    motorHome4eixos: number;
  };
  atualizado: string;
  ultimaAlteracao: string;
}

interface CalcularPedagioApiResponse {
  status: string;
  dados: {
    pais: string;
    moeda: string;
    pedagiosRota: CalcularPedagioTollStation[];
    custoTotalPedagiosDinheiro: {
      moto2eixos: number;
      auto2eixos: number;
      auto3eixos: number;
      auto4eixos: number;
      valorPorEixoCaminhao: number;
      onibus2Eixos: number;
      motorHome2eixos: number;
      motorHome3eixos: number;
      motorHome4eixos: number;
    };
    custoTotalPedagiosTag: {
      moto2eixos: number;
      auto2eixos: number;
      auto3eixos: number;
      auto4eixos: number;
      valorPorEixoCaminhao: number;
      onibus2Eixos: number;
      motorHome2eixos: number;
      motorHome3eixos: number;
      motorHome4eixos: number;
    };
  };
  polyline?: {
    coordinates: number[][];
    type: string;
  };
  usuario: string;
  distancia: string;
}

interface TollData {
  origem: string;
  destino: string;
  pedagios: Array<{
    key?: string; // Key da API que contém coordenadas
    nome: string;
    valor: number;
    valorTag?: number;
    tipo: string;
    localizacao: string;
    rodovia?: string;
    estado?: string;
    concessionaria?: string;
    km?: number;
    googleMapsLink?: string;
  }>;
  custoTotal: number;
  custoTotalTag?: number;
  totalPedagios: number;
  distanciaTotal?: number;
  duracaoTotal?: number;
  status: string;
  message?: string;
  routeUrl?: string;
  apiUsed: string;
}

type ApiProvider = 'localhost' | 'calcularpedagio';

const Tolls: React.FC = () => {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);
  const [tollData, setTollData] = useState<TollData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [axleCount, setAxleCount] = useState<number>(2);
  const [vehicleType, setVehicleType] = useState<string>('auto2eixos');
  const [apiProvider, setApiProvider] = useState<ApiProvider>('calcularpedagio');
  const [hoveredTollId, setHoveredTollId] = useState<string | null>(null);
  const [mapOrigem, setMapOrigem] = useState('');
  const [mapDestino, setMapDestino] = useState('');

  // URLs das APIs
  const API_URLS = {
    localhost: 'http://localhost:3000/api/check-route',
    calcularpedagio: 'https://www.calcularpedagio.com.br/api/pontos/v3'
  };

  const API_KEY_CALCULARPEDAGIO = 'cfadc738-1785-40a5-90b2-c6288457a587';

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

  const vehicleTypes = [
    { value: 'auto2eixos', label: 'Carro (2 eixos)' },
    { value: 'auto3eixos', label: 'Carro (3 eixos)' },
    { value: 'auto4eixos', label: 'Carro (4 eixos)' },
    { value: 'valorPorEixoCaminhao', label: 'Caminhão (por eixo)' },
    { value: 'onibus2Eixos', label: 'Ônibus (2 eixos)' },
    { value: 'moto2eixos', label: 'Moto (2 eixos)' },
    { value: 'motorHome2eixos', label: 'Motor Home (2 eixos)' },
    { value: 'motorHome3eixos', label: 'Motor Home (3 eixos)' },
    { value: 'motorHome4eixos', label: 'Motor Home (4 eixos)' }
  ];

  const apiOptions = [
    { value: 'localhost' as const, label: '🏠 API Própria (Localhost)', description: 'Nossa API desenvolvida internamente' },
    { value: 'calcularpedagio' as const, label: '🌐 CalcularPedagio.com.br', description: 'API externa com mais opções de veículos' }
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
    
    // Atualizar coordenadas do mapa imediatamente
    console.log('🔄 Atualizando coordenadas do mapa:', origem, '->', destino);
    setMapOrigem(origem.trim());
    setMapDestino(destino.trim());

    try {
      console.log(`Calculando pedágios usando ${apiProvider === 'localhost' ? 'API própria' : 'CalcularPedagio.com.br'}...`);
      
      // Tempo mínimo de loading para melhor UX
      const startTime = Date.now();
      const minLoadingTime = 2000; // 2 segundos mínimo

      let apiPromise;
      if (apiProvider === 'localhost') {
        apiPromise = handleLocalhostApi();
      } else {
        apiPromise = handleCalcularPedagioApi();
      }

      // Aguarda tanto a API quanto o tempo mínimo
      await Promise.all([
        apiPromise,
        new Promise(resolve => {
          const elapsed = Date.now() - startTime;
          const remainingTime = Math.max(0, minLoadingTime - elapsed);
          setTimeout(resolve, remainingTime);
        })
      ]);

    } catch (err: any) {
      console.error('Erro ao calcular pedágios:', err);
      
      let errorMessage = 'Erro ao calcular pedágios. ';
      
      if (err.message.includes('404')) {
        errorMessage += 'Rota não encontrada. Verifique os nomes das cidades.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage += 'Erro de autenticação. Chave API inválida.';
      } else if (err.message.includes('500')) {
        errorMessage += 'Erro interno do servidor. Tente novamente em alguns minutos.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage += apiProvider === 'localhost' 
          ? 'Erro de conexão. Verifique se a API está rodando em localhost:3000.'
          : 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else {
        errorMessage += err.message || 'Verifique os nomes das cidades e tente novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalhostApi = async () => {
    const requestBody = {
      locations: [origem.trim(), destino.trim()],
      axleCount: axleCount
    };

    console.log('Dados da requisição (localhost):', requestBody);

    const response = await fetch(API_URLS.localhost, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Resposta raw da API (localhost):', responseText);

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

    if (data.status !== 'success') {
      throw new Error('Erro na consulta da rota');
    }

    // Processar dados dos pedágios da API localhost
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
      routeUrl: data.data.googleMapsLink.routeUrl,
      apiUsed: 'localhost'
    };

    console.log('Dados processados (localhost):', processedData);
    setTollData(processedData);
  };

  const handleCalcularPedagioApi = async () => {
    // Normalizar formato das cidades para a API do calcularpedagio
    const normalizeCity = (city: string) => {
      let normalized = city.trim();
      
      // Converte formato "Cidade, Estado" para "Cidade/Estado"
      if (normalized.includes(',')) {
        normalized = normalized.replace(',', '/');
      }
      // Se não tem separador, mantém como está
      return normalized;
    };

    const requestBody = {
      pontos: [
        normalizeCity(origem),
        normalizeCity(destino)
      ]
    };

    console.log('Dados da requisição (calcularpedagio):', requestBody);

    const response = await fetch(API_URLS.calcularpedagio, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY_CALCULARPEDAGIO}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('Resposta raw da API (calcularpedagio):', responseText);

    let data: CalcularPedagioApiResponse;
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

    if (data.status !== 'OK') {
      throw new Error(data.status || 'Erro desconhecido da API');
    }

    // Processar dados dos pedágios da API calcularpedagio
    const pedagiosProcessados = data.dados.pedagiosRota.map((pedagio: CalcularPedagioTollStation) => ({
      key: pedagio.key, // Preservar o key original que contém as coordenadas
      nome: pedagio.localidade,
      valor: getVehicleValue(pedagio.custosDinheiro, vehicleType),
      valorTag: getVehicleValue(pedagio.custoTag, vehicleType),
      tipo: 'Pedágio',
      localizacao: `${pedagio.localidade}, ${pedagio.estado}`,
      rodovia: pedagio.nomeRodovia,
      estado: pedagio.estado
    }));

    // Extrair distância do campo "distancia" se disponível
    const distanciaStr = data.distancia || '';
    const distanciaMatch = distanciaStr.match(/(\d+)/);
    const distanciaTotal = distanciaMatch ? parseFloat(distanciaMatch[1]) : undefined;

    const custoTotalDinheiro = getVehicleValue(data.dados.custoTotalPedagiosDinheiro, vehicleType);
    const custoTotalTag = getVehicleValue(data.dados.custoTotalPedagiosTag, vehicleType);

    const processedData: TollData = {
      origem: origem.trim(),
      destino: destino.trim(),
      pedagios: pedagiosProcessados,
      custoTotal: custoTotalDinheiro,
      custoTotalTag: custoTotalTag !== custoTotalDinheiro ? custoTotalTag : undefined, // Só incluir se houver diferença
      totalPedagios: data.dados.pedagiosRota.length,
      distanciaTotal: distanciaTotal,
      status: 'success',
      apiUsed: 'calcularpedagio'
    };

    console.log('Dados processados (calcularpedagio):', processedData);
    setTollData(processedData);
  };

  const getVehicleValue = (costs: any, vehicleType: string): number => {
    const value = costs[vehicleType];
    return value !== null && value !== undefined ? value : 0;
  };

  const handleClearForm = () => {
    setOrigem('');
    setDestino('');
    setTollData(null);
    setError(null);
    setMapOrigem('');
    setMapDestino('');
  };

  const handleInputBlur = () => {
    // Removido updateMapLocations - agora só atualiza quando calcula
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

  const getVehicleLabel = (): string => {
    if (apiProvider === 'localhost') {
      const axleOption = axleOptions.find(a => a.value === axleCount);
      return axleOption ? axleOption.label : '2 eixos (Carro, Moto)';
      } else {
      const vehicleOption = vehicleTypes.find(v => v.value === vehicleType);
      return vehicleOption ? vehicleOption.label : 'Carro (2 eixos)';
    }
  };

  // Preparar dados dos pedágios para o mapa
  const mapTolls = tollData?.pedagios.map((pedagio, index) => ({
    key: pedagio.key || index.toString(), // Usar key da API se disponível, senão usar index
    praca: pedagio.nome,
    preco: pedagio.valor,
    precoComTag: pedagio.valorTag,
    rodovia: pedagio.rodovia,
    localizacao: pedagio.localizacao,
    km: pedagio.km,
    concessionaria: pedagio.concessionaria,
    city: pedagio.localizacao?.split(',')[0]?.trim(),
    state: pedagio.estado
  })) || [];

  console.log('🚗 Dados dos pedágios para o mapa:', mapTolls);
  console.log('📍 Origem para mapa:', mapOrigem);
  console.log('📍 Destino para mapa:', mapDestino);

  return (
    <div className="tolls-page-fullscreen">
      {/* Header with Menu */}
      <Header />
      

      
      {/* Left Panel - Route Configuration */}
      <div className="tolls-left-panel">
        {/* Route Configuration Card */}
        <div className="left-panel-card">
          <h3>📍 Configuração da Rota</h3>
          
          <form onSubmit={handleCalculateTolls}>
            <div className="form-group">
              <label className="form-label">Origem</label>
              <input
                type="text"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                onBlur={handleInputBlur}
                placeholder={apiProvider === 'localhost' ? "São Paulo, SP" : "São Paulo/SP"}
                className="panel-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Destino</label>
              <input
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                onBlur={handleInputBlur}
                placeholder={apiProvider === 'localhost' ? "Rio de Janeiro, RJ" : "Rio de Janeiro/RJ"}
                className="panel-input"
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className={`panel-btn primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Calculando...' : 'Calcular'}
              </button>
              <button 
                type="button" 
                onClick={handleClearForm}
                className="panel-btn secondary"
                disabled={loading}
              >
                Limpar
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message compact">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* API & Vehicle Configuration Card */}
        <div className="left-panel-card">
          <h3>⚙️ Configurações</h3>
          
          <div className="form-group">
            <label className="form-label">API Provider</label>
            <select
              value={apiProvider}
              onChange={(e) => setApiProvider(e.target.value as ApiProvider)}
              className="panel-input"
              disabled={loading}
            >
              {apiOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Veículo</label>
            {apiProvider === 'localhost' ? (
              <select
                value={axleCount}
                onChange={(e) => setAxleCount(Number(e.target.value))}
                className="panel-input"
                disabled={loading}
              >
                {axleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="panel-input"
                disabled={loading}
              >
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="tolls-right-panel">
        {loading ? (
          <div className="right-panel-card">
            <div className="right-panel-loading">
              <LoadingSkeleton />
            </div>
          </div>
        ) : tollData ? (
          <div className="right-panel-card">
            <h3>📊 Resultados da Rota</h3>
            
            <div className="results-summary-cards">
              <div className="results-summary-card">
                <span className="icon">💰</span>
                <h4>Total Pedágios</h4>
                <div className="value">R$ {tollData.custoTotal.toFixed(2)}</div>
                {tollData.custoTotalTag && tollData.custoTotalTag !== tollData.custoTotal && (
                  <div className="tag-info">
                    <span className="tag-price">Com TAG: R$ {tollData.custoTotalTag.toFixed(2)}</span>
                    <span className="economy">Economia: R$ {(tollData.custoTotal - tollData.custoTotalTag).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="results-summary-card">
                <span className="icon">🛣️</span>
                <h4>Pedágios</h4>
                <div className="value">{tollData.totalPedagios}</div>
              </div>

              {tollData.distanciaTotal && (
                <div className="results-summary-card">
                  <span className="icon">📏</span>
                  <h4>Distância</h4>
                  <div className="value">{tollData.distanciaTotal} km</div>
                </div>
              )}

              {tollData.duracaoTotal && (
                <div className="results-summary-card">
                  <span className="icon">⏱️</span>
                  <h4>Duração</h4>
                  <div className="value">{formatDuration(tollData.duracaoTotal)}</div>
                </div>
              )}
            </div>

            {mapTolls.length > 0 && (
              <div className="results-toll-list">
                <h4>📍 Pedágios na Rota</h4>
                {mapTolls.map((toll, index) => (
                  <div 
                    key={toll.key || index}
                    className={`results-toll-item ${hoveredTollId === (toll.key || index.toString()) ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredTollId(toll.key || index.toString())}
                    onMouseLeave={() => setHoveredTollId(null)}
                  >
                    <div className="results-toll-header">
                      <div className="results-toll-number">{index + 1}</div>
                      <div className="results-toll-prices">
                        <div className="price">R$ {toll.preco.toFixed(2)}</div>
                        {toll.precoComTag && toll.precoComTag !== toll.preco && (
                          <div className="tag-price">TAG: R$ {toll.precoComTag.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                    <div className="results-toll-info">
                      {toll.praca && <h5>{toll.praca}</h5>}
                      {toll.rodovia && <span className="highway">{toll.rodovia}</span>}
                      {toll.localizacao && <span className="location">{toll.localizacao}</span>}
                      {toll.km && <span className="km">KM {toll.km}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="results-api-badge">
              <span>API:</span>
              <span>{tollData.apiUsed === 'localhost' ? '🏠 API Própria' : '🌐 CalcularPedagio.com.br'}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Fullscreen Map */}
      <div className="map-section">
        <MapComponent
          startLocation={mapOrigem}
          endLocation={mapDestino}
          tolls={mapTolls}
        />
      </div>


    </div>
  );
};

export default Tolls; 