import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Location } from '../store/locationSlice';
import './modal.css';

// Configuration for CEP API
const CEP_API_CONFIG = {
  authBaseURL: 'https://auth.nuvemfiscal.com.br/oauth/token',
  cepBaseURL: 'https://api.nuvemfiscal.com.br/cep',
  
  getToken: async () => {
    try {
      const clientId = import.meta.env.VITE_NUVEN_FISCAL_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_NUVEN_FISCAL_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('Missing Nuvem Fiscal API credentials');
      }

      const requestBody = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'cep'
      }).toString();

      const tokenResponse = await axios.post(
        CEP_API_CONFIG.authBaseURL,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 10000,
          validateStatus: function (status) {
            return status >= 200 && status < 600;
          }
        }
      );

      if (tokenResponse.status === 200) {
        return tokenResponse.data.access_token;
      } else {
        throw new Error(`Authentication failed with status ${tokenResponse.status}`);
      }
    } catch (error: unknown) {
      console.error('🚨 FULL Token Retrieval Error 🚨');
      
      if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
      }
      
      if (axios.isAxiosError(error)) {
        console.error('🔴 Axios Error Details:');
        console.error('Response Data:', error.response?.data);
        console.error('Response Status:', error.response?.status);
        console.error('Response Headers:', error.response?.headers);
      }
      
      throw error;
    }
  },

  fetchCEP: async (cep: string) => {
    try {
      const token = await CEP_API_CONFIG.getToken();

      const response = await axios.get(
        `${CEP_API_CONFIG.cepBaseURL}/${cep}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('CEP lookup error:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          message: error.message,
          config: error.config
        });
      }
      
      throw error;
    }
  }
};

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: Location) => void;
  initialData?: Location;
  editMode: boolean;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  editMode
}) => {
  const [location, setLocation] = useState<Location>({
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    isCompany: false
  });

  // Campos separados para endereço
  const [addressFields, setAddressFields] = useState({
    street: '',
    number: '',
    complement: '',
  });

  // Estados para CEP
  const [cepError, setCepError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const numberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setLocation(initialData);
      // Se há endereço inicial, tentar separar os campos
      const addressParts = initialData.address.split(',');
      setAddressFields({
        street: addressParts[0]?.trim() || '',
        number: addressParts[1]?.trim() || '',
        complement: addressParts[2]?.trim() || '',
      });
    } else {
      // Reset form quando não há dados iniciais
      setLocation({
        id: '',
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        isCompany: false
      });
      setAddressFields({
        street: '',
        number: '',
        complement: '',
      });
    }
  }, [initialData, isOpen]);

  // Atualizar endereço completo quando campos mudam
  useEffect(() => {
    // Combinar todos os campos de endereço
    const addressParts = [];
    
    // Rua e número (sempre juntos)
    if (addressFields.street) {
      if (addressFields.number) {
        addressParts.push(`${addressFields.street}, ${addressFields.number}`);
      } else {
        addressParts.push(addressFields.street);
      }
    }
    
    // Complemento
    if (addressFields.complement) {
      addressParts.push(addressFields.complement);
    }
    
    // Cidade e Estado
    if (location.city && location.state) {
      addressParts.push(`${location.city} - ${location.state}`);
    } else if (location.city) {
      addressParts.push(location.city);
    } else if (location.state) {
      addressParts.push(location.state);
    }
    
    // CEP
    if (location.zipCode) {
      addressParts.push(`CEP: ${location.zipCode}`);
    }
    
    const fullAddress = addressParts.join(', ');
    
    setLocation(prev => ({
      ...prev,
      address: fullAddress
    }));
  }, [addressFields, location.city, location.state, location.zipCode]);

  const formatCEP = (cep: string) => {
    // Remove non-numeric characters
    const cleanedCep = cep.replace(/\D/g, '');
    
    // Format as 00000-000
    if (cleanedCep.length > 5) {
      return `${cleanedCep.slice(0, 5)}-${cleanedCep.slice(5, 8)}`;
    }
    return cleanedCep;
  };

  const fetchCEPDetails = async (cep: string) => {
    // Remove formatting for API call
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      setCepError('CEP inválido');
      return;
    }

    // Prevent multiple simultaneous requests
    if (isLoading) return;

    setIsLoading(true);
    setCepError('');

    try {
      // Perform CEP lookup
      const data = await CEP_API_CONFIG.fetchCEP(cleanCep);
      
      setAddressFields(prev => ({
        ...prev,
        street: data.logradouro || ''
      }));
      
      setLocation(prev => ({
        ...prev,
        city: data.municipio || '',
        state: data.uf || '',
        zipCode: formatCEP(cleanCep)
      }));

      // Focus on number input after successful CEP lookup
      if (numberInputRef.current) {
        numberInputRef.current.focus();
      }
    } catch (error) {
      console.error('CEP lookup full error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 401:
              setCepError('Erro de autenticação. Verifique as credenciais.');
              break;
            case 404:
              setCepError('CEP não encontrado.');
              break;
            case 500:
              setCepError('Erro interno do servidor. Tente novamente mais tarde.');
              break;
            default:
              setCepError('Erro ao buscar CEP. Tente novamente.');
          }
        } else if (error.request) {
          setCepError('Sem resposta do servidor. Verifique sua conexão.');
        } else {
          setCepError('Erro ao configurar a busca de CEP.');
        }
      } else {
        setCepError('Erro desconhecido ao buscar CEP.');
      }

      // Reset address fields on error
      setAddressFields(prev => ({
        ...prev,
        street: ''
      }));
      setLocation(prev => ({
        ...prev,
        city: '',
        state: ''
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedCep = formatCEP(inputValue);
    
    // Update state with the formatted CEP
    setLocation(prev => ({
      ...prev,
      zipCode: formattedCep
    }));

    // Debounce CEP lookup to reduce unnecessary API calls
    if (formattedCep.length === 9) {
      setCepError('');

      const timeoutId = setTimeout(() => {
        fetchCEPDetails(formattedCep);
      }, 300);

      // Clean up the timeout if component unmounts or input changes
      return () => clearTimeout(timeoutId);
    } else if (formattedCep.length > 0 && formattedCep.length < 9) {
      // Reset address fields if CEP is incomplete
      setAddressFields(prev => ({
        ...prev,
        street: ''
      }));
      setLocation(prev => ({
        ...prev,
        city: '',
        state: ''
      }));
      setCepError('CEP incompleto');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setLocation({
        ...location,
        [name]: checked
      });
    } else {
      setLocation({
        ...location,
        [name]: value
      });
    }
  };

  const handleAddressFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressFields({
      ...addressFields,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.id || !location.name || !location.address || !location.city || !location.state) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    
    onSave(location);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-wide">
        <div className="modal-header">
          <h2>
            {editMode 
              ? 'Editar Local'
              : 'Adicionar Novo Local'
            }
          </h2>
          <button 
            className="modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Primeira linha: ID do Local */}
            <div className="form-group">
              <label htmlFor="id">ID do Local</label>
              <input
                type="text"
                id="id"
                name="id"
                value={location.id}
                onChange={handleInputChange}
                placeholder="lenovo-sorocaba"
                disabled={editMode}
                required
              />
              <small className="form-hint">ID único para identificar este local (sem espaços)</small>
            </div>
            
            {/* Segunda linha: Nome do Local */}
            <div className="form-group">
              <label htmlFor="name">Nome do Local</label>
              <input
                type="text"
                id="name"
                name="name"
                value={location.name}
                onChange={handleInputChange}
                placeholder="Lenovo Sorocaba"
                required
              />
            </div>

            {/* Espaçamento */}
            <div style={{ height: '1rem' }}></div>

            {/* CEP */}
            <div className="form-group">
              <label htmlFor="zipCode">CEP</label>
              <div className="cep-input-container" style={{ position: 'relative', maxWidth: '200px' }}>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={location.zipCode}
                  onChange={handleCepChange}
                  placeholder="18087-220"
                  maxLength={9}
                  autoComplete="off"
                  spellCheck={false}
                  className={isLoading ? 'input-loading' : ''}
                />
                {isLoading && (
                  <div className="loading-overlay">
                    <div className="loading-spinner">
                      ⏳
                    </div>
                    <span className="sr-only">Carregando dados do CEP...</span>
                  </div>
                )}
              </div>
              {cepError && <div className="error-message" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.375rem' }}>{cepError}</div>}
            </div>

            {/* Campos de endereço */}
            <div className="form-row">
              <div className="form-group" style={{ flex: '2' }}>
                <label htmlFor="street">Rua/Avenida</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={addressFields.street}
                  onChange={handleAddressFieldChange}
                  placeholder="Av. Jerome Case"
                  required
                />
              </div>
              
              <div className="form-group" style={{ flex: '1' }}>
                <label htmlFor="number">Número</label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={addressFields.number}
                  onChange={handleAddressFieldChange}
                  placeholder="2600"
                  ref={numberInputRef}
                  required
                />
              </div>
              
              <div className="form-group" style={{ flex: '1' }}>
                <label htmlFor="complement">Complemento</label>
                <input
                  type="text"
                  id="complement"
                  name="complement"
                  value={addressFields.complement}
                  onChange={handleAddressFieldChange}
                  placeholder="Sala 101"
                />
              </div>
            </div>

            {/* Cidade e Estado */}
            <div className="form-row">
              <div className="form-group" style={{ flex: '2' }}>
                <label htmlFor="city">Cidade</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={location.city}
                  onChange={handleInputChange}
                  placeholder="Sorocaba"
                  required
                />
              </div>
              
              <div className="form-group" style={{ flex: '1' }}>
                <label htmlFor="state">Estado</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={location.state}
                  onChange={handleInputChange}
                  placeholder="SP"
                  required
                />
              </div>
            </div>

            {/* Endereço completo (calculado automaticamente) */}
            <div className="form-group">
              <label htmlFor="address">Endereço Completo</label>
              <input
                type="text"
                id="address"
                name="address"
                value={location.address}
                disabled
                style={{ 
                  backgroundColor: '#f3f4f6', 
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}
                placeholder="Será preenchido automaticamente"
              />
              <small className="form-hint">Este campo é preenchido automaticamente com base nos campos acima</small>
            </div>

            {/* Checkbox empresa */}
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isCompany"
                name="isCompany"
                checked={location.isCompany}
                onChange={handleInputChange}
              />
              <label htmlFor="isCompany">Este é um local da empresa (Lenovo)</label>
            </div>
          </form>
        </div>
        
        <div className="form-actions">
          <button 
            type="button"
            onClick={onClose}
            className="cancel-button"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-button"
            onClick={handleSubmit}
          >
            {editMode ? 'Atualizar Local' : 'Adicionar Local'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal; 