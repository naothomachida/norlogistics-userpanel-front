import React, { useState, useEffect } from 'react';
import { CityPair } from '../store/pricingSlice';

interface CityPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cityPair: Omit<CityPair, 'id'>) => void;
  initialData?: CityPair;
  editMode?: boolean;
}

const CityPairModal: React.FC<CityPairModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  editMode = false
}) => {
  const [formData, setFormData] = useState<Omit<CityPair, 'id'>>({
    fromCity: '',
    fromState: '',
    toCity: '',
    toState: '',
    minimumPrice: 0
  });

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        fromCity: initialData.fromCity,
        fromState: initialData.fromState,
        toCity: initialData.toCity,
        toState: initialData.toState,
        minimumPrice: initialData.minimumPrice
      });
    } else {
      setFormData({
        fromCity: '',
        fromState: '',
        toCity: '',
        toState: '',
        minimumPrice: 0
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'minimumPrice') {
      // Validate and convert price to number
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  // List of Brazilian states
  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editMode ? 'Editar Rota' : 'Adicionar Nova Rota'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="city-pair-form">
          <div className="form-section">
            <h3>Origem</h3>
            <div className="form-row" style={{display: 'flex', gap: '15px'}}>
              <div style={{flex: '3'}}>
                <label htmlFor="fromCity">Cidade de Origem</label>
                <input
                  type="text"
                  id="fromCity"
                  name="fromCity"
                  value={formData.fromCity}
                  onChange={handleChange}
                  required
                  placeholder="Ex: São Paulo"
                  className="city-field"
                  style={{width: '100%'}}
                />
              </div>
              
              <div style={{flex: '1'}}>
                <label htmlFor="fromState">Estado</label>
                <select
                  id="fromState"
                  name="fromState"
                  value={formData.fromState}
                  onChange={handleChange}
                  required
                  className="state-field"
                  style={{width: '100%'}}
                >
                  <option value="">Selecione</option>
                  {states.map(state => (
                    <option key={`from-${state}`} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Destino</h3>
            <div className="form-row" style={{display: 'flex', gap: '15px'}}>
              <div style={{flex: '3'}}>
                <label htmlFor="toCity">Cidade de Destino</label>
                <input
                  type="text"
                  id="toCity"
                  name="toCity"
                  value={formData.toCity}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Campinas"
                  className="city-field"
                  style={{width: '100%'}}
                />
              </div>
              
              <div style={{flex: '1'}}>
                <label htmlFor="toState">Estado</label>
                <select
                  id="toState"
                  name="toState"
                  value={formData.toState}
                  onChange={handleChange}
                  required
                  className="state-field"
                  style={{width: '100%'}}
                >
                  <option value="">Selecione</option>
                  {states.map(state => (
                    <option key={`to-${state}`} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Preço Mínimo</h3>
            <div className="form-group">
              <label htmlFor="minimumPrice">Valor (R$)</label>
              <input
                type="number"
                id="minimumPrice"
                name="minimumPrice"
                value={formData.minimumPrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Ex: 150.00"
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
              type="submit" 
              className="save-button"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CityPairModal; 