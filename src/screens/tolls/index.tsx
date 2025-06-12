import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import './tolls.css';

interface TollStation {
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

interface ApiResponse {
  status: string;
  dados: {
    pais: string;
    moeda: string;
    pedagiosRota: TollStation[];
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
  };
}

interface TollData {
  origem: string;
  destino: string;
  pedagios: Array<{
    nome: string;
    valor: number;
    valorTag?: number;
    tipo: string;
    localizacao: string;
    rodovia?: string;
    estado?: string;
    moeda?: string;
  }>;
  custoTotalDinheiro: number;
  custoTotalTag: number;
  totalPedagios: number;
  status: string;
  message?: string;
}

const Tolls: React.FC = () => {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);
  const [tollData, setTollData] = useState<TollData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<string>('auto2eixos');

  // Nova API da calcularpedagio.com.br via proxy local do Vite
  const API_BASE_URL = '/api/pedagios';
  const API_KEY = 'cfadc738-1785-40a5-90b2-c6288457a587';

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
      console.log('Calculando pedágios usando API calcularpedagio.com.br...');
      
      // Normalizar formato das cidades
      const normalizeCity = (city: string) => {
        // Remove espaços extras
        let normalized = city.trim();
        
        // Se não tem separador, adiciona um formato padrão
        if (!normalized.includes('/') && !normalized.includes('-') && !normalized.includes(',')) {
          return normalized; // Deixa como está se não tem separador
        }
        
        // Converte diferentes separadores para o formato padrão
        if (normalized.includes('-')) {
          normalized = normalized.replace('-', '/');
        }
        if (normalized.includes(',')) {
          normalized = normalized.replace(',', '/');
        }
        
        return normalized;
      };
      
      console.log('Usando API real calcularpedagio.com.br...');
      
      const requestBody = {
        pontos: [
          normalizeCity(origem),
          normalizeCity(destino)
        ]
      };

      console.log('Dados da requisição:', requestBody);
      console.log('URL da requisição:', API_BASE_URL);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Status da resposta:', response.status);
      
      const responseText = await response.text();
      console.log('Resposta raw da API:', responseText);

      let data;
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

      if (data.status !== 'OK') {
        throw new Error(data.status || 'Erro desconhecido da API');
      }

      // Processar dados dos pedágios
      const pedagiosProcessados = data.dados.pedagiosRota.map((pedagio: TollStation) => ({
        nome: pedagio.localidade,
        valor: getVehicleValue(pedagio.custosDinheiro, vehicleType),
        valorTag: getVehicleValue(pedagio.custoTag, vehicleType),
        tipo: 'Pedágio',
        localizacao: `${pedagio.localidade}, ${pedagio.estado}`,
        rodovia: pedagio.nomeRodovia,
        estado: pedagio.estado,
        moeda: pedagio.moeda
      }));

      const processedData: TollData = {
        origem: origem.trim(),
        destino: destino.trim(),
        pedagios: pedagiosProcessados,
        custoTotalDinheiro: getVehicleValue(data.dados.custoTotalPedagiosDinheiro, vehicleType),
        custoTotalTag: getVehicleValue(data.dados.custoTotalPedagiosTag, vehicleType),
        totalPedagios: data.dados.pedagiosRota.length,
        status: 'success'
      };

      console.log('Dados processados:', processedData);
      setTollData(processedData);

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
        errorMessage += 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else {
        errorMessage += err.message || 'Verifique os nomes das cidades e tente novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getVehicleTypeLabel = (): string => {
    const vehicleTypeObj = vehicleTypes.find(v => v.value === vehicleType);
    return vehicleTypeObj ? vehicleTypeObj.label : 'Carro (2 eixos)';
  };

  // Função para testar a API diretamente com coordenadas geocode
  // Útil para testar se a API está funcionando corretamente
  const handleTestGeocode = async () => {
    setLoading(true);
    setError(null);
    setTollData(null);

    try {
      console.log('🧪 Teste direto com geocodes...');
      
      const testCoordinates = [
        '-28.2625,-52.4082', // Passo Fundo/RS
        '-23.5505,-46.6333'  // São Paulo/SP
      ];

      const requestBody = {
        pontos: testCoordinates
      };

      console.log('📍 Enviando coordenadas para teste:', requestBody);
      console.log('🌐 URL da requisição:', API_BASE_URL);

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📊 Status da resposta:', response.status);
      
      const responseText = await response.text();
      console.log('📋 Resposta raw da API:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Erro ao fazer parse JSON:', e);
        throw new Error(`Resposta inválida da API: ${responseText}`);
      }

      if (!response.ok) {
        console.error('❌ Erro da API:', responseText);
        throw new Error(`Erro ${response.status}: ${responseText}`);
      }

      console.log('✅ Resposta da API:', data);

      if (data.status !== 'OK') {
        throw new Error(data.status || 'Erro desconhecido da API');
      }

      // Processar dados dos pedágios
      const pedagiosProcessados = data.dados.pedagiosRota.map((pedagio: TollStation) => ({
        nome: pedagio.localidade,
        valor: getVehicleValue(pedagio.custosDinheiro, vehicleType),
        valorTag: getVehicleValue(pedagio.custoTag, vehicleType),
        tipo: 'Pedágio',
        localizacao: `${pedagio.localidade}, ${pedagio.estado}`,
        rodovia: pedagio.nomeRodovia,
        estado: pedagio.estado,
        moeda: pedagio.moeda
      }));

      const processedData: TollData = {
        origem: 'Passo Fundo/RS (Geocode)',
        destino: 'São Paulo/SP (Geocode)',
        pedagios: pedagiosProcessados,
        custoTotalDinheiro: getVehicleValue(data.dados.custoTotalPedagiosDinheiro, vehicleType),
        custoTotalTag: getVehicleValue(data.dados.custoTotalPedagiosTag, vehicleType),
        totalPedagios: data.dados.pedagiosRota.length,
        status: 'success'
      };

      console.log('✅ Dados processados:', processedData);
      setTollData(processedData);

    } catch (err: any) {
      console.error('❌ Erro no teste de geocodes:', err);
      
      let errorMessage = '🧪 Erro no teste de geocodes: ';
      
      if (err.message.includes('404')) {
        errorMessage += 'Rota não encontrada com as coordenadas fornecidas.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage += 'Erro de autenticação. Chave API inválida.';
      } else if (err.message.includes('500')) {
        errorMessage += 'Erro interno do servidor. Tente novamente em alguns minutos.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage += 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else {
        errorMessage += err.message || 'Erro desconhecido no teste.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tolls-page">
      <Header />
      <div className="tolls-content">
        <div className="tolls-header">
          <h1 className="tolls-title">Calculadora de Pedágios</h1>
          <p className="tolls-subtitle">
            Calcule os custos de pedágios para suas rotas usando a API calcularpedagio.com.br
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
                    placeholder="Ex: São Paulo/SP ou São Paulo-SP"
                    className="form-input"
                    disabled={loading}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Formato: Cidade/Estado ou Cidade-Estado ou apenas Cidade, Estado
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="destino">Cidade de Destino</label>
                  <input
                    type="text"
                    id="destino"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Ex: Rio de Janeiro/RJ ou Rio de Janeiro-RJ"
                    className="form-input"
                    disabled={loading}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Formato: Cidade/Estado ou Cidade-Estado ou apenas Cidade, Estado
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="vehicleType">Tipo de Veículo</label>
                  <select
                    id="vehicleType"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="error-message">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                    </svg>
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setOrigem('Tapejara/RS');
                      setDestino('Salvador/BA');
                    }}
                    className="btn-secondary"
                    disabled={loading}
                    style={{ marginRight: '8px' }}
                  >
                    Exemplo Docs
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrigem('Passo Fundo/RS');
                      setDestino('São Paulo/SP');
                    }}
                    className="btn-secondary"
                    disabled={loading}
                    style={{ marginRight: '8px' }}
                  >
                    Exemplo RS-SP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrigem('-28.2625,-52.4082'); // Passo Fundo/RS
                      setDestino('-23.5505,-46.6333'); // São Paulo/SP
                    }}
                    className="btn-secondary"
                    disabled={loading}
                    style={{ marginRight: '8px', backgroundColor: '#10b981', color: 'white', border: '1px solid #059669' }}
                  >
                    🧪 Preencher Geocodes
                  </button>
                  <button
                    type="button"
                    onClick={handleTestGeocode}
                    className="btn-secondary"
                    disabled={loading}
                    style={{ marginRight: '8px', backgroundColor: '#3b82f6', color: 'white', border: '1px solid #2563eb' }}
                  >
                    🚀 Teste Direto API
                  </button>
                  <button
                    type="button"
                    onClick={handleClearForm}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Limpar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !origem.trim() || !destino.trim()}
                  >
                    {loading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Calculando...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 11H7L12 6L17 11H15V16H9V11Z" fill="currentColor"/>
                        </svg>
                        Calcular Pedágios
                      </>
                    )}
                  </button>
                </div>
              </form>
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
                    Resultados dos Pedágios - {getVehicleTypeLabel()}
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
                        <p>{formatCurrency(tollData.custoTotalDinheiro)}</p>
                      </div>
                    </div>

                    <div className="summary-card total">
                      <div className="summary-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 17H22V19H2V17ZM1.15 12.95L4 15.47L9.62 9.85L12.5 12.73L22.84 2.39L21.43 0.97L12.5 9.9L9.62 7.02L3.29 13.35L1.15 12.95Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="summary-content">
                        <h3>Total TAG</h3>
                        <p>{formatCurrency(tollData.custoTotalTag)}</p>
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
                            </p>
                            <span className="toll-type">{pedagio.tipo}</span>
                          </div>
                          <div className="toll-value">
                            <div>{formatCurrency(pedagio.valor)}</div>
                            {pedagio.valorTag && pedagio.valorTag !== pedagio.valor && (
                              <div className="toll-tag-value">
                                TAG: {formatCurrency(pedagio.valorTag)}
                              </div>
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
                      <h4>Resumo de Custos para {getVehicleTypeLabel()}</h4>
                      <div className="cost-item">
                        <span>Pedágios (Dinheiro):</span>
                        <span>{formatCurrency(tollData.custoTotalDinheiro)}</span>
                      </div>
                      <div className="cost-item">
                        <span>Pedágios (TAG):</span>
                        <span>{formatCurrency(tollData.custoTotalTag)}</span>
                      </div>
                      <div className="cost-item total-cost">
                        <span><strong>Economia com TAG:</strong></span>
                        <span><strong>{formatCurrency(tollData.custoTotalDinheiro - tollData.custoTotalTag)}</strong></span>
                      </div>
                    </div>
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