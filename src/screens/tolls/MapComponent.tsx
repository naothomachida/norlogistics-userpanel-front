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
  isLoading?: boolean;
}

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
    if (shouldFit && coordinates.length > 0) {
      // Pequeno delay para garantir que todos os marcadores foram renderizados
      const timer = setTimeout(() => {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [20, 20] });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [coordinates, map, shouldFit]);
  
  return null;
}

async function geocodeLocation(location: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}, Brazil&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
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
  routeCoordinates = [],
  isLoading = false 
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
        const coords = await geocodeLocationWithCache(startLocation, geocodeCache, setGeocodeCache);
        setStartCoords(coords);
        setLastStartLocation(startLocation);
        hasChanges = true;
      }
      
      if (endLocation && endLocation !== lastEndLocation) {
        const coords = await geocodeLocationWithCache(endLocation, geocodeCache, setGeocodeCache);
        setEndCoords(coords);
        setLastEndLocation(endLocation);
        hasChanges = true;
      }
      
      if (hasChanges) {
        setShouldFitBounds(true);
      }
    };

    geocodeLocations();
  }, [startLocation, endLocation, lastStartLocation, lastEndLocation, geocodeCache]);

  // Só faz geocoding dos pedágios quando a lista realmente muda
  useEffect(() => {
    const geocodeTolls = async () => {
      if (tolls.length === 0) {
        setTollCoords([]);
        return;
      }

      const tollsWithCoords = await Promise.all(
        tolls.map(async (toll) => {
          let location = '';
          
          if (toll.praca) {
            location = toll.praca;
          } else if (toll.localizacao) {
            location = toll.localizacao;
          } else if (toll.city && toll.state) {
            location = `${toll.city}, ${toll.state}`;
          }
          
          if (location) {
            const coords = await geocodeLocationWithCache(location, geocodeCache, setGeocodeCache);
            if (coords) {
              return { ...toll, coordinates: coords };
            }
          }
          
          return null;
        })
      );

      const validTolls = tollsWithCoords.filter(Boolean) as Array<TollData & { coordinates: [number, number] }>;
      setTollCoords(validTolls);
      
      if (validTolls.length > 0) {
        setShouldFitBounds(true);
      }
    };

    geocodeTolls();
  }, [tolls, geocodeCache]);

  // Atualiza coordenadas apenas quando necessário
  useEffect(() => {
    const coords: [number, number][] = [];
    
    if (startCoords) coords.push(startCoords);
    if (endCoords) coords.push(endCoords);
    
    tollCoords.forEach(toll => {
      if (toll.coordinates) coords.push(toll.coordinates);
    });
    
    setAllCoordinates(coords);
  }, [startCoords, endCoords, tollCoords]);

  // Reset shouldFitBounds após um tempo para evitar ajustes constantes
  useEffect(() => {
    if (shouldFitBounds) {
      const timer = setTimeout(() => {
        setShouldFitBounds(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [shouldFitBounds]);

  if (isLoading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando mapa...</p>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = [-23.5505, -46.6333];
  const mapCenter = allCoordinates.length > 0 ? allCoordinates[0] : defaultCenter;

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
        
        {startCoords && (
          <Marker position={startCoords} icon={startIcon}>
            <Popup>
              <div className="map-popup">
                <h4>🏁 Origem</h4>
                <p>{startLocation}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {endCoords && (
          <Marker position={endCoords} icon={endIcon}>
            <Popup>
              <div className="map-popup">
                <h4>🎯 Destino</h4>
                <p>{endLocation}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {tollCoords.map((toll, index) => (
          <Marker key={toll.key || index} position={toll.coordinates} icon={tollIcon}>
            <Popup>
              <div className="map-popup toll-popup">
                <h4>💰 Pedágio</h4>
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
              </div>
            </Popup>
          </Marker>
        ))}
        
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#2563eb"
            weight={4}
            opacity={0.8}
          />
        )}
        
        {routeCoordinates.length === 0 && startCoords && endCoords && (
          <Polyline
            positions={[startCoords, endCoords]}
            color="#dc2626"
            weight={3}
            opacity={0.6}
            dashArray="10, 10"
          />
        )}
        
        <MapBounds 
          coordinates={allCoordinates} 
          shouldFit={shouldFitBounds}
        />
      </MapContainer>
    </div>
  );
}