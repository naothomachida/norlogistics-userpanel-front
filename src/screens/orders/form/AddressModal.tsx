import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './address-modal.css';

// Configuration for CEP API
const CEP_API_CONFIG = {
  authBaseURL: 'https://auth.nuvemfiscal.com.br/oauth/token',
  cepBaseURL: 'https://api.nuvemfiscal.com.br/cep',
  
  getToken: async () => {
    try {
      // Check for environment variables
      const clientId = import.meta.env.VITE_NUVEN_FISCAL_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_NUVEN_FISCAL_CLIENT_SECRET;

      console.log('🔍 Authentication Attempt');
      console.log('Client ID:', clientId);
      console.log('Client Secret Length:', clientSecret?.length);

      if (!clientId || !clientSecret) {
        throw new Error('Missing Nuvem Fiscal API credentials');
      }

      // Prepare the request body
      const requestBody = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'cep'
      }).toString();

      console.log('Request URL:', CEP_API_CONFIG.authBaseURL);
      console.log('Request Body:', requestBody);

      // Request access token
      const tokenResponse = await axios.post(
        CEP_API_CONFIG.authBaseURL,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          timeout: 10000, // 10 seconds timeout
          validateStatus: function (status) {
            // Allow any status code for detailed error logging
            return status >= 200 && status < 600;
          }
        }
      );

      console.log('Token Response Status:', tokenResponse.status);
      console.log('Token Response Headers:', tokenResponse.headers);
      console.log('Token Response Data:', tokenResponse.data);

      // Check for successful authentication
      if (tokenResponse.status === 200) {
      return tokenResponse.data.access_token;
      } else {
        throw new Error(`Authentication failed with status ${tokenResponse.status}`);
      }
    } catch (error: unknown) {
      console.error('🚨 FULL Token Retrieval Error 🚨');
      
      // Type guard to check if error is an Error object
      if (error instanceof Error) {
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
      }
      
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('🔴 Axios Error Details:');
        console.error('Response Data:', error.response?.data);
        console.error('Response Status:', error.response?.status);
        console.error('Response Headers:', error.response?.headers);
        console.error('Request Config:', {
          method: error.config?.method,
          url: error.config?.url,
          headers: error.config?.headers
        });
      }
      
      throw error;
    }
  },

  fetchCEP: async (cep: string) => {
    try {
      // Get the access token
      const token = await CEP_API_CONFIG.getToken();

      // Perform CEP lookup
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
      
      // Detailed error logging
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

// Define the address type to match the expected structure
export interface DetailedAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  country: string;
  fullAddress: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: DetailedAddress) => void;
  initialAddress?: Partial<DetailedAddress>;
}

const AddressModal: React.FC<AddressModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialAddress = {} 
}) => {
  const [address, setAddress] = useState<DetailedAddress>({
    cep: initialAddress.cep || '',
    street: initialAddress.street || '',
    number: initialAddress.number || '',
    complement: initialAddress.complement || '',
    city: initialAddress.city || '',
    state: initialAddress.state || '',
    country: initialAddress.country || 'Brasil',
    fullAddress: initialAddress.fullAddress || ''
  });

  const [cepError, setCepError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Ref for number input
  const numberInputRef = useRef<HTMLInputElement>(null);

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
      
      setAddress(prev => ({
        ...prev,
        street: data.logradouro || '',
        city: data.municipio || '',  // Use 'municipio' instead of 'localidade'
        state: data.uf || '',
        cep: formatCEP(cleanCep)
      }));

      // Focus on number input after successful CEP lookup
      if (numberInputRef.current) {
        numberInputRef.current.focus();
      }
    } catch (error) {
      console.error('CEP lookup full error:', error);
      
      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Axios Error Details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          message: error.message,
          config: error.config
        });

        // More specific error handling
        if (error.response) {
          // The request was made and the server responded with a status code
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
          // The request was made but no response was received
          setCepError('Sem resposta do servidor. Verifique sua conexão.');
        } else {
          // Something happened in setting up the request
          setCepError('Erro ao configurar a busca de CEP.');
        }
      } else {
        // Non-Axios error
        setCepError('Erro desconhecido ao buscar CEP.');
      }

      // Reset address fields on error
      setAddress(prev => ({
        ...prev,
        street: '',
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

    // Update CEP immediately to ensure smooth typing experience
    setAddress(prev => ({
      ...prev,
      cep: formattedCep
    }));

    // Debounce CEP lookup to reduce unnecessary API calls
    if (formattedCep.length === 9) {
      // Clear any previous error
      setCepError('');

      // Use a slight delay to allow for smoother input
      const timeoutId = setTimeout(() => {
        fetchCEPDetails(formattedCep);
      }, 300);

      // Clean up the timeout if component unmounts or input changes
      return () => clearTimeout(timeoutId);
    } else if (formattedCep.length > 0 && formattedCep.length < 9) {
      // Reset address fields if CEP is incomplete
      setAddress(prev => ({
        ...prev,
        street: '',
        city: '',
        state: ''
      }));
      setCepError('CEP incompleto');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!address.cep || !address.street || !address.number || !address.city || !address.state) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Format the full address string
    const fullAddress = `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.city} - ${address.state}`;

    onSave({
      ...address,
      fullAddress
    });
    onClose();
  };

  // If modal is not open, return null
  if (!isOpen) return null;

  return (
    <div className="address-modal-overlay">
      <div className="address-modal-content">
        <h2>Adicionar Endereço</h2>
        <form className="address-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="cep">CEP</label>
            <div className="cep-input-container">
              <input
                type="text"
                id="cep"
                name="cep"
                value={address.cep}
                onChange={handleCepChange}
                placeholder="Digite o CEP"
                maxLength={9}
                ref={numberInputRef}
                disabled={isLoading}
              />
              {isLoading && <span className="loading-indicator">Buscando...</span>}
            </div>
            {cepError && <div className="error-message">{cepError}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="street">Rua</label>
              <input
                type="text"
                id="street"
                name="street"
                value={address.street}
                onChange={handleInputChange}
                placeholder="Nome da rua"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="number">Número</label>
              <input
                type="text"
                id="number"
                name="number"
                ref={numberInputRef}
                value={address.number}
                onChange={handleInputChange}
                placeholder="Número"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="complement">Complemento (opcional)</label>
            <input
              type="text"
              id="complement"
              name="complement"
              value={address.complement}
              onChange={handleInputChange}
              placeholder="Apartamento, bloco, etc."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Cidade</label>
              <input
                type="text"
                id="city"
                name="city"
                value={address.city}
                onChange={handleInputChange}
                placeholder="Cidade"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">Estado</label>
              <input
                type="text"
                id="state"
                name="state"
                value={address.state}
                onChange={handleInputChange}
                placeholder="Estado"
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="save-button" 
              onClick={handleSave}
              disabled={!address.cep || !address.street || !address.number || !address.city || !address.state}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;