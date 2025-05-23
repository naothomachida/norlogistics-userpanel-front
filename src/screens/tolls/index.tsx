import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import './tolls.css';

interface RouteResponse {
  idRota: number;
  indiceRota: number;
  distancia: number;
  tempo: number;
  custo_combustivel: number;
  origem: string;
  destino: string;
  status: string;
  message?: string;
}

interface TollData {
  idRota: number;
  indiceRota: number;
  origem: string;
  destino: string;
  distancia: number;
  tempo: number;
  custo_combustivel: number;
  pedagios: Array<{
    nome: string;
    valor: number;
    valorTag?: number;
    tipo: string;
    localizacao: string;
    latitude?: number;
    longitude?: number;
    km?: number;
    rodovia?: string;
  }>;
  custo_total: number;
  status: string;
  message?: string;
}

const Tolls: React.FC = () => {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [loading, setLoading] = useState(false);
  const [tollData, setTollData] = useState<TollData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'https://way-hml.webrouter.com.br';
  const API_CALCULAR_URL = `${API_BASE_URL}/RouterService/router/api/calcular`;
  const API_PEDAGIOS_URL = `${API_BASE_URL}/router/rota/pedagios`;
  const API_TOKEN = 'ACWFAOEFOJINOFUTFJV3ECWFADWFAOEFOJW3AMWFGO';

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
      // ETAPA 1: Criar a rota
      console.log('ETAPA 1: Criando rota...');
      const routeData = await createRoute(origem.trim(), destino.trim());
      
      if (!routeData.idRota) {
        throw new Error('Não foi possível obter o ID da rota');
      }

      console.log('Rota criada com sucesso:', routeData);

      // ETAPA 2: Consultar pedágios da rota
      console.log('ETAPA 2: Consultando pedágios...');
      const tollsData = await getTollsByRouteId(routeData.idRota, routeData.indiceRota || 0);

      // Combinar dados da rota com dados dos pedágios
      const processedData: TollData = {
        idRota: routeData.idRota,
        indiceRota: routeData.indiceRota || 0,
        origem: routeData.origem || origem,
        destino: routeData.destino || destino,
        distancia: routeData.distancia || 0,
        tempo: routeData.tempo || 0,
        custo_combustivel: routeData.custo_combustivel || 0,
        pedagios: tollsData || [],
        custo_total: (routeData.custo_combustivel || 0) + getTotalTollValue(tollsData || []),
        status: 'success'
      };

      console.log('Dados finais processados:', processedData);
      setTollData(processedData);

    } catch (err: any) {
      console.error('Erro ao calcular pedágios:', err);
      
      let errorMessage = 'Erro ao calcular pedágios. ';
      
      if (err.message.includes('404')) {
        errorMessage += 'Serviço não encontrado. Verifique a URL da API.';
      } else if (err.message.includes('401') || err.message.includes('403')) {
        errorMessage += 'Erro de autenticação. Verifique as credenciais.';
      } else if (err.message.includes('500')) {
        errorMessage += 'Erro interno do servidor. Tente novamente em alguns minutos.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage += 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else {
        errorMessage += err.message || 'Verifique os endereços e tente novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async (origem: string, destino: string): Promise<RouteResponse> => {
    const requestData = {
      autenticacao: {
        chaveAcesso: API_TOKEN
      },
      rota: {
        codigo: `ROTA_${Date.now()}`,
        descricao: `Rota de ${origem} para ${destino}`,
        enderecos: [
          {
            ordemPassagem: 1,
            codigo: "01",
            logradouro: "",
            numero: "",
            cep: "",
            cidade: {
              pais: "Brasil",
              uf: "",
              cidade: origem,
              codigoIbge: ""
            },
            latLng: {
              latitude: 0,
              longitude: 0
            },
            informacaoParada: {
              peso: 0,
              volume: 0,
              descricao: "",
              dias: 0,
              horas: 0,
              minutos: 0
            }
          },
          {
            ordemPassagem: 2,
            codigo: "02",
            logradouro: "",
            numero: "",
            cep: "",
            cidade: {
              pais: "Brasil",
              uf: "",
              cidade: destino,
              codigoIbge: ""
            },
            latLng: {
              latitude: 0,
              longitude: 0
            },
            informacaoParada: {
              peso: 0,
              volume: 0,
              descricao: "",
              dias: 0,
              horas: 0,
              minutos: 0
            }
          }
        ],
        params: {
          dataHoraInicio: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          evitarBalsa: false,
          evitarPedagio: false,
          evitarRodovia: false,
          calcularVolta: false,
          calculaDistanciaUrbana: false,
          polylineSimplificada: false,
          ordenaRota: false,
          voltarPeloMesmoCaminho: false,
          valorCombustivel: 6.50,
          consumo: 17.00,
          capacidadeTanque: 50,
          litrosTanqueInicio: 20,
          categoriaVeiculo: "1",
          tipoCombustivel: "GASOLINA",
          alturaVeiculo: 0,
          raioPesquisaPosto: 0,
          perfilVeiculo: "CAMINHAO",
          tipoCaminho: "RAPIDA",
          priorizarRodovias: true,
          usaTrafego: false,
          ignorarRestricao: false
        }
      },
      salvarRota: true
    };

    console.log('Enviando dados para criar rota:', requestData);

    const response = await fetch(API_CALCULAR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    console.log('Status da resposta (criar rota):', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta (criar rota):', errorText);
      throw new Error(`Erro na API de criação de rota: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Dados recebidos (criar rota):', data);
    
    // Verificar erro específico de licença
    if (data.status === 'LICENCA_INVALIDA') {
      throw new Error(`LICENÇA INVÁLIDA: A chave de acesso "${API_TOKEN}" não é válida ou não possui licença ativa. Entre em contato com o suporte da AILOG (0800 580 0844) para verificar sua licença.`);
    }
    
    // Verificar outros erros
    if (data.status === 'error' || data.erro) {
      throw new Error(data.message || data.erro || 'Erro desconhecido ao criar rota');
    }

    // Verificar se retornou rotas
    if (!data.rotas || data.rotas.length === 0) {
      throw new Error('Nenhuma rota foi retornada pela API. Verifique os endereços informados.');
    }

    // Pegar a primeira rota
    const rota = data.rotas[0];
    
    return {
      idRota: rota.idRota || rota.id || data.idRota,
      indiceRota: data.indiceRota || 0,
      distancia: parseFloat(rota.distancia) || 0,
      tempo: parseInt(rota.tempo) || 0,
      custo_combustivel: parseFloat(rota.custo_combustivel) || parseFloat(rota.custoCombustivel) || 0,
      origem: rota.origem || origem,
      destino: rota.destino || destino,
      status: data.status || 'success',
      message: data.message
    };
  };

  const getTollsByRouteId = async (idRota: number, indiceRota: number = 0): Promise<any[]> => {
    const url = `${API_PEDAGIOS_URL}/${idRota}/${indiceRota}`;
    
    console.log('Consultando pedágios na URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'chaveAcesso': API_TOKEN
      }
    });

    console.log('Status da resposta (consultar pedágios):', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na resposta (consultar pedágios):', errorText);
      throw new Error(`Erro na API de consulta de pedágios: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Dados recebidos (consultar pedágios):', data);
    
    if (data.status === 'error' || data.erro) {
      throw new Error(data.message || data.erro || 'Erro desconhecido ao consultar pedágios');
    }

    return data.pedagios || data || [];
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

  const formatDistance = (value: number): string => {
    return `${value.toFixed(1)} km`;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getTotalTollValue = (pedagios: any[] = []): number => {
    return pedagios.reduce((total, pedagio) => total + (pedagio.valor || 0), 0);
  };

  return (
    <div className="tolls-page">
      <Header />
      <div className="tolls-content">
        <div className="tolls-header">
          <h1 className="tolls-title">Calculadora de Pedágios</h1>
          <p className="tolls-subtitle">
            Calcule os custos de pedágios para suas rotas usando a API WebRouter (Processo em 2 etapas)
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
                    placeholder="Ex: São Paulo, SP ou Araras, SP"
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="destino">Cidade de Destino</label>
                  <input
                    type="text"
                    id="destino"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Ex: Rio de Janeiro, RJ ou Franca, SP"
                    className="form-input"
                    disabled={loading}
                  />
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
                    Resultados dos Pedágios
                  </h2>
                </div>

                <div className="results-summary">
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="summary-icon distance">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 1.07V9H20.93C20.49 5.05 17.95 1.51 13 1.07ZM4 15C4 15.83 4.67 16.5 5.5 16.5C6.33 16.5 7 15.83 7 15C7 14.17 6.33 13.5 5.5 13.5C4.67 13.5 4 14.17 4 15ZM12.5 13.5C11.67 13.5 11 14.17 11 15C11 15.83 11.67 16.5 12.5 16.5C13.33 16.5 14 15.83 14 15C14 14.17 13.33 13.5 12.5 13.5ZM21 10.12H14.88C14.58 10.04 14.32 9.96 14.12 9.82L16.96 7L15.55 5.55L12.71 8.39C12.58 8.19 12.46 7.93 12.38 7.63V1.51C16.88 2.14 20.38 5.64 21 10.12Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="summary-content">
                        <h3>Distância</h3>
                        <p>{formatDistance(tollData.distancia)}</p>
                      </div>
                    </div>

                    <div className="summary-card">
                      <div className="summary-icon time">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM17 13H11V7H12.5V11.5H17V13Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="summary-content">
                        <h3>Tempo</h3>
                        <p>{formatTime(tollData.tempo)}</p>
                      </div>
                    </div>

                    <div className="summary-card">
                      <div className="summary-icon fuel">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.77 7.23L19.78 7.22L16.06 3.5L15 4.56L17.11 6.67C16.17 7.03 15.5 7.93 15.5 9V16.5C15.5 17.88 14.38 19 13 19H4C2.62 19 1.5 17.88 1.5 16.5V9C1.5 7.62 2.62 6.5 4 6.5H13C14.38 6.5 15.5 7.62 15.5 9H13.5V16.5H15.5V9C15.5 8.17 16.17 7.5 17 7.5C17.83 7.5 18.5 8.17 18.5 9V12.5C18.5 13.05 18.95 13.5 19.5 13.5S20.5 13.05 20.5 12.5V9C20.5 8.39 20.11 7.86 19.77 7.23Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="summary-content">
                        <h3>Combustível</h3>
                        <p>{formatCurrency(tollData.custo_combustivel)}</p>
                      </div>
                    </div>

                    <div className="summary-card total">
                      <div className="summary-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="summary-content">
                        <h3>Total Pedágios</h3>
                        <p>{formatCurrency(getTotalTollValue(tollData.pedagios))}</p>
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
                              {pedagio.km && ` - KM ${pedagio.km}`}
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

                  <div className="route-id-info">
                    <p><strong>ID da Rota:</strong> {tollData.idRota} | <strong>Índice:</strong> {tollData.indiceRota}</p>
                  </div>

                  {tollData.custo_total > 0 && (
                    <div className="route-summary">
                      <div className="cost-breakdown">
                        <h4>Resumo de Custos</h4>
                        <div className="cost-item">
                          <span>Pedágios:</span>
                          <span>{formatCurrency(getTotalTollValue(tollData.pedagios))}</span>
                        </div>
                        <div className="cost-item">
                          <span>Combustível:</span>
                          <span>{formatCurrency(tollData.custo_combustivel)}</span>
                        </div>
                        <div className="cost-item total-cost">
                          <span><strong>Total da Viagem:</strong></span>
                          <span><strong>{formatCurrency(tollData.custo_total)}</strong></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="api-info-section">
          <div className="api-info-card">
            <h3>Sobre a API WebRouter (Processo em 2 Etapas)</h3>
            <p>
              Esta calculadora utiliza o processo oficial da API WebRouter/AILOG em duas etapas para obter 
              informações precisas sobre pedágios e custos de combustível:
            </p>
            <ol>
              <li><code>POST /router/api/calcular</code> - Cria a rota e retorna o ID</li>
              <li><code>GET /router/rota/pedagios/{`{idRota}`}/{`{indiceRota}`}</code> - Consulta os pedágios da rota</li>
            </ol>
            
            <div className="api-credentials">
              <h4>📋 Credenciais Atuais:</h4>
              <div className="credential-item">
                <strong>Token:</strong> <code>{API_TOKEN}</code>
              </div>
              <div className="credential-item">
                <strong>Login:</strong> <code>naotho@letsgreen.com.br</code>
              </div>
              <div className="credential-item">
                <strong>Senha:</strong> <code>Brasil123@</code>
              </div>
            </div>

            <div className="api-details">
              <div className="api-detail">
                <strong>Ambiente:</strong> 
                <span>Homologação (way-hml.webrouter.com.br)</span>
              </div>
              <div className="api-detail">
                <strong>Suporte:</strong> 
                <a href="https://suporte.ailog.com.br/kb/" target="_blank" rel="noopener noreferrer">
                  Portal de Suporte AILOG
                </a>
              </div>
              <div className="api-detail">
                <strong>Telefone:</strong>
                <span>0800 580 0844</span>
              </div>
            </div>

            <div className="license-warning">
              <h4>⚠️ Problemas de Licença?</h4>
              <p>
                Se você receber erro de "LICENÇA INVÁLIDA", isso significa que:
              </p>
              <ul>
                <li>O token de acesso pode estar expirado</li>
                <li>A conta pode não ter licença ativa</li>
                <li>O ambiente de homologação pode estar com restrições</li>
              </ul>
              <p>
                <strong>Solução:</strong> Entre em contato com o suporte da AILOG no telefone 
                <strong>0800 580 0844</strong> ou pelo email <strong>suporte@ailog.com.br</strong> 
                para verificar o status da sua licença.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tolls; 