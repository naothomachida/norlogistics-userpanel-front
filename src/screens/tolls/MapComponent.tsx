import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TollData {
  key?: string;
  praca?: string;
  preco: number;
  precoComTag?: number;
  rodovia?: string;
  localizacao?: string;
  km?: number;
  concessionaria?: string;
  coordinates?: [number, number];
  city?: string;
  state?: string;
}

interface MapComponentProps {
  startLocation: string;
  endLocation: string;
  tolls: TollData[];
  routeCoordinates?: [number, number][];
}

// Coordenadas de fallback para cidades brasileiras comuns
const FALLBACK_COORDINATES: Record<string, [number, number]> = {
  // São Paulo
  'sao paulo': [-23.5505, -46.6333],
  'são paulo': [-23.5505, -46.6333],
  'sao paulo, sp': [-23.5505, -46.6333],
  'são paulo, sp': [-23.5505, -46.6333],
  'sao paulo/sp': [-23.5505, -46.6333],
  'são paulo/sp': [-23.5505, -46.6333],
  
  // Rio de Janeiro
  'rio de janeiro': [-22.9068, -43.1729],
  'rio de janeiro, rj': [-22.9068, -43.1729],
  'rio de janeiro/rj': [-22.9068, -43.1729],
  
  // Outras cidades importantes
  'belo horizonte': [-19.9167, -43.9345],
  'belo horizonte, mg': [-19.9167, -43.9345],
  'brasilia': [-15.7801, -47.9292],
  'brasília': [-15.7801, -47.9292],
  'salvador': [-12.9714, -38.5014],
  'fortaleza': [-3.7319, -38.5267],
  'recife': [-8.0476, -34.8770],
  'porto alegre': [-30.0346, -51.2177],
  'curitiba': [-25.4284, -49.2733],
  'campinas': [-22.9099, -47.0626],
  'sorocaba': [-23.5015, -47.4526],
  'sorocaba, sp': [-23.5015, -47.4526],
  'sorocaba/sp': [-23.5015, -47.4526],
  
  // Cidades da região metropolitana de SP
  'osasco': [-23.5329, -46.7918],
  'barueri': [-23.5106, -46.8761],
  'itapevi': [-23.5489, -46.9343],
  'itu': [-23.2644, -47.2997],
  'itu sp': [-23.2644, -47.2997],
  'castelinho': [-23.4117, -47.3422], // Aproximado para região de Itu
  'castello branco': [-23.5178, -46.8141], // Região da rodovia Castello Branco
};

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Criar ícone personalizado para pedágios
const createTollIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border: 3px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        font-size: 16px;
        color: white;
        font-weight: bold;
      ">
        💰
      </div>
    `,
    className: 'custom-toll-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const tollIcon = createTollIcon();

function MapBounds({ coordinates, shouldFit }: { coordinates: [number, number][], shouldFit: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    const fitMapBounds = () => {
      if (coordinates.length > 0) {
        console.log('🔍 MapBounds: Ajustando zoom para', coordinates.length, 'coordenadas');
        
        try {
          if (coordinates.length === 1) {
            // Se só tem um ponto, centraliza nele com zoom fixo
            map.setView(coordinates[0], 12);
            console.log('✅ MapBounds: Centralizado em ponto único');
          } else {
            // Calcular padding baseado nos painéis laterais (valores exatos do CSS)
            const mapContainer = map.getContainer();
            const mapWidth = mapContainer.offsetWidth;
            const mapHeight = mapContainer.offsetHeight;
            
            // Dimensões exatas dos painéis baseado no CSS:
            // .tolls-left-panel: width: 320px + left: 20px = 340px total
            // .tolls-right-panel: width: 350px + right: 20px = 370px total
            const leftPanelTotal = 340; // 320px + 20px margin
            const rightPanelTotal = 370; // 350px + 20px margin
            
            // Calcular padding em pixels com margem extra para segurança
            const leftPadding = leftPanelTotal + 30; // painel + margem extra
            const rightPadding = rightPanelTotal + 30; // painel + margem extra
            const topPadding = 100; // header (60px) + margem extra
            const bottomPadding = 50; // margem inferior
            
            console.log('📐 Dimensões do mapa:', { mapWidth, mapHeight });
            console.log('📐 Padding calculado:', { leftPadding, rightPadding, topPadding, bottomPadding });
            
            // Se tem múltiplos pontos, ajusta para mostrar todos
            const bounds = L.latLngBounds(coordinates);
            
            map.fitBounds(bounds, { 
              paddingTopLeft: [leftPadding, topPadding],
              paddingBottomRight: [rightPadding, bottomPadding],
              maxZoom: 10 // Reduzido mais um pouco para dar ainda mais espaço
            });
            console.log('✅ MapBounds: Ajustado para mostrar todos os pontos com padding correto dos painéis');
          }
        } catch (error) {
          console.error('❌ Erro ao ajustar bounds:', error);
        }
      }
    };

    if (shouldFit && coordinates.length > 0) {
      // Pequeno delay para garantir que todos os marcadores foram renderizados
      const timer = setTimeout(fitMapBounds, 300);
      
      // Listener para redimensionamento da janela
      const handleResize = () => {
        console.log('🔄 Janela redimensionada, reajustando mapa...');
        setTimeout(fitMapBounds, 100);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [coordinates, map, shouldFit]);
  
  return null;
}

// Função para extrair coordenadas do campo key da API
function extractCoordinatesFromKey(key: string): [number, number] | null {
  try {
    // O key tem formato "-23.509452_-46.817171"
    const parts = key.split('_');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log('✅ Coordenadas extraídas do key:', [lat, lng]);
        return [lat, lng];
      }
    }
  } catch (error) {
    console.error('❌ Erro ao extrair coordenadas do key:', error);
  }
  return null;
}

// Função para obter coordenadas de fallback
function getFallbackCoordinates(location: string): [number, number] | null {
  const normalizedLocation = location.toLowerCase().trim();
  
  // Tenta encontrar correspondência exata primeiro
  if (FALLBACK_COORDINATES[normalizedLocation]) {
    console.log('✅ Coordenadas de fallback encontradas para:', location);
    return FALLBACK_COORDINATES[normalizedLocation];
  }
  
  // Tenta encontrar correspondência parcial
  for (const [key, coords] of Object.entries(FALLBACK_COORDINATES)) {
    if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
      console.log('✅ Coordenadas de fallback (parcial) encontradas para:', location);
      return coords;
    }
  }
  
  console.log('❌ Nenhuma coordenada de fallback encontrada para:', location);
  return null;
}

async function geocodeLocation(location: string): Promise<[number, number] | null> {
  try {
    console.log('🌐 Fazendo geocoding para:', location);
    
    // Primeiro tenta coordenadas de fallback
    const fallbackCoords = getFallbackCoordinates(location);
    if (fallbackCoords) {
      return fallbackCoords;
    }
    
    // Delay para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Primeiro tenta com Brazil
    let response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}, Brazil&limit=1&countrycodes=br`
    );
    let data = await response.json();
    
    console.log('📡 Resposta do geocoding (com Brazil):', data);
    
    // Se não encontrou, tenta sem Brazil
    if (!data || data.length === 0) {
      console.log('🔄 Tentando geocoding sem Brazil...');
      await new Promise(resolve => setTimeout(resolve, 500));
      response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1&countrycodes=br`
      );
      data = await response.json();
      console.log('📡 Resposta do geocoding (sem Brazil):', data);
    }
    
    if (data && data.length > 0) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      console.log('✅ Coordenadas encontradas via geocoding:', coords);
      return coords;
    }
    
    console.log('❌ Nenhuma coordenada encontrada para:', location);
    return null;
  } catch (error) {
    console.error('❌ Erro no geocoding:', error);
    // Em caso de erro, tenta fallback novamente
    return getFallbackCoordinates(location);
  }
}

async function geocodeLocationWithCache(
  location: string, 
  cache: Map<string, [number, number] | null>,
  setCache: React.Dispatch<React.SetStateAction<Map<string, [number, number] | null>>>
): Promise<[number, number] | null> {
  // Verifica se já temos o resultado no cache
  if (cache.has(location)) {
    return cache.get(location) || null;
  }
  
  // Faz o geocoding
  const result = await geocodeLocation(location);
  
  // Salva no cache
  setCache(prev => new Map(prev).set(location, result));
  
  return result;
}

export default function MapComponent({ 
  startLocation, 
  endLocation, 
  tolls, 
  routeCoordinates = []
}: MapComponentProps) {
  const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);
  const [tollCoords, setTollCoords] = useState<Array<TollData & { coordinates: [number, number] }>>([]);
  const [allCoordinates, setAllCoordinates] = useState<[number, number][]>([]);
  const [shouldFitBounds, setShouldFitBounds] = useState(false);
  const [lastStartLocation, setLastStartLocation] = useState('');
  const [lastEndLocation, setLastEndLocation] = useState('');
  const [geocodeCache, setGeocodeCache] = useState<Map<string, [number, number] | null>>(new Map());

  // Só faz geocoding quando as localizações realmente mudaram
  useEffect(() => {
    const geocodeLocations = async () => {
      let hasChanges = false;
      
      if (startLocation && startLocation !== lastStartLocation) {
        console.log('🔍 Geocoding origem:', startLocation);
        const coords = await geocodeLocationWithCache(startLocation, geocodeCache, setGeocodeCache);
        console.log('📍 Coordenadas origem:', coords);
        setStartCoords(coords);
        setLastStartLocation(startLocation);
        hasChanges = true;
      }
      
      if (endLocation && endLocation !== lastEndLocation) {
        console.log('🔍 Geocoding destino:', endLocation);
        const coords = await geocodeLocationWithCache(endLocation, geocodeCache, setGeocodeCache);
        console.log('📍 Coordenadas destino:', coords);
        setEndCoords(coords);
        setLastEndLocation(endLocation);
        hasChanges = true;
      }
      
      if (hasChanges) {
        // Força o ajuste do zoom quando há mudanças nas localizações
        setShouldFitBounds(true);
      }
    };

    geocodeLocations();
  }, [startLocation, endLocation, lastStartLocation, lastEndLocation, geocodeCache]);

  // Processa pedágios com coordenadas do key ou geocoding
  useEffect(() => {
    const processTolls = async () => {
      if (tolls.length === 0) {
        console.log('📍 Nenhum pedágio para processar');
        setTollCoords([]);
        return;
      }

      console.log('🔍 Processando pedágios:', tolls.length, 'pedágios');

      const tollsWithCoords = await Promise.all(
        tolls.map(async (toll, index) => {
          // Primeiro tenta extrair coordenadas do key
          if (toll.key) {
            const keyCoords = extractCoordinatesFromKey(toll.key);
            if (keyCoords) {
              console.log(`✅ Pedágio ${index + 1} - coordenadas do key:`, keyCoords);
              return { ...toll, coordinates: keyCoords };
            }
          }
          
          // Se não conseguiu do key, tenta geocoding
          let location = '';
          
          if (toll.praca) {
            location = toll.praca;
          } else if (toll.localizacao) {
            location = toll.localizacao;
          } else if (toll.city && toll.state) {
            location = `${toll.city}, ${toll.state}`;
          }
          
          console.log(`🔍 Geocoding pedágio ${index + 1}:`, location);
          
          if (location) {
            const coords = await geocodeLocationWithCache(location, geocodeCache, setGeocodeCache);
            console.log(`📍 Coordenadas pedágio ${index + 1}:`, coords);
            if (coords) {
              return { ...toll, coordinates: coords };
            }
          }
          
          console.log(`❌ Falha no processamento do pedágio ${index + 1}`);
          return null;
        })
      );

      const validTolls = tollsWithCoords.filter(Boolean) as Array<TollData & { coordinates: [number, number] }>;
      console.log('✅ Pedágios com coordenadas válidas:', validTolls.length);
      setTollCoords(validTolls);
      
      // Força o ajuste do zoom quando há novos pedágios
      if (validTolls.length > 0) {
        setShouldFitBounds(true);
      }
    };

    processTolls();
  }, [tolls, geocodeCache]);

  // Atualiza coordenadas e força zoom quando há mudanças
  useEffect(() => {
    const coords: [number, number][] = [];
    
    if (startCoords) coords.push(startCoords);
    if (endCoords) coords.push(endCoords);
    
    tollCoords.forEach(toll => {
      if (toll.coordinates) coords.push(toll.coordinates);
    });
    
    setAllCoordinates(coords);
    
    // Se temos coordenadas e houve mudança, ajusta o zoom
    if (coords.length > 0) {
      console.log('🎯 Ajustando zoom para mostrar', coords.length, 'pontos');
      setShouldFitBounds(true);
    }
  }, [startCoords, endCoords, tollCoords]);

  // Reset shouldFitBounds após ajustar o zoom
  useEffect(() => {
    if (shouldFitBounds) {
      const timer = setTimeout(() => {
        setShouldFitBounds(false);
      }, 1500); // Aumentei o tempo para garantir que o ajuste seja feito
      
      return () => clearTimeout(timer);
    }
  }, [shouldFitBounds]);

  const defaultCenter: [number, number] = [-23.5505, -46.6333];
  const mapCenter = allCoordinates.length > 0 ? allCoordinates[0] : defaultCenter;

  console.log('🗺️ Renderizando mapa com:');
  console.log('- startCoords:', startCoords);
  console.log('- endCoords:', endCoords);
  console.log('- tollCoords:', tollCoords.length, 'pedágios');
  console.log('- allCoordinates:', allCoordinates.length, 'coordenadas');
  console.log('- shouldFitBounds:', shouldFitBounds);

  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        className="toll-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Linha de conexão origem-destino - renderizada primeiro para ficar atrás dos marcadores */}
        {startCoords && endCoords && (
          <Polyline
            positions={[startCoords, endCoords]}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
            dashArray="8, 12"
          />
        )}
        
        {/* Rota detalhada se disponível */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#2563eb"
            weight={5}
            opacity={0.9}
          />
        )}
        
        {/* Marcador de origem */}
        {startCoords && (
          <Marker position={startCoords} icon={startIcon}>
            <Popup>
              <div className="map-popup origin-popup">
                <h4>🏁 Origem</h4>
                <p><strong>{startLocation}</strong></p>
                <small>Coordenadas: {startCoords[0].toFixed(4)}, {startCoords[1].toFixed(4)}</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Marcador de destino */}
        {endCoords && (
          <Marker position={endCoords} icon={endIcon}>
            <Popup>
              <div className="map-popup destination-popup">
                <h4>🎯 Destino</h4>
                <p><strong>{endLocation}</strong></p>
                <small>Coordenadas: {endCoords[0].toFixed(4)}, {endCoords[1].toFixed(4)}</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Marcadores de pedágios */}
        {tollCoords.map((toll, index) => (
          <Marker key={toll.key || index} position={toll.coordinates} icon={tollIcon}>
            <Popup>
              <div className="map-popup toll-popup">
                <h4>💰 Pedágio #{index + 1}</h4>
                {toll.praca && <p><strong>Praça:</strong> {toll.praca}</p>}
                {toll.rodovia && <p><strong>Rodovia:</strong> {toll.rodovia}</p>}
                {toll.localizacao && <p><strong>Local:</strong> {toll.localizacao}</p>}
                {toll.km && <p><strong>KM:</strong> {toll.km}</p>}
                <div className="toll-prices">
                  <p><strong>Valor:</strong> R$ {toll.preco.toFixed(2)}</p>
                  {toll.precoComTag && toll.precoComTag !== toll.preco && (
                    <p><strong>Com TAG:</strong> R$ {toll.precoComTag.toFixed(2)}</p>
                  )}
                </div>
                {toll.concessionaria && (
                  <p><strong>Concessionária:</strong> {toll.concessionaria}</p>
                )}
                <small>Coordenadas: {toll.coordinates[0].toFixed(4)}, {toll.coordinates[1].toFixed(4)}</small>
              </div>
            </Popup>
          </Marker>
        ))}
        
        <MapBounds 
          coordinates={allCoordinates} 
          shouldFit={shouldFitBounds}
        />
      </MapContainer>
    </div>
  );
}