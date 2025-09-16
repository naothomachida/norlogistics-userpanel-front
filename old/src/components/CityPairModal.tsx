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
      <div className="modal-content modal-content-wide">
        <div className="modal-header">
          <h2>{editMode ? 'Editar Rota' : 'Adicionar Nova Rota'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Origem */}
            <div className="form-section">
              <h3>🛫 Origem</h3>
              <div className="form-row">
                <div className="form-group" style={{ flex: '2' }}>
                  <label htmlFor="fromCity">Cidade</label>
                  <input
                    type="text"
                    id="fromCity"
                    name="fromCity"
                    value={formData.fromCity}
                    onChange={handleChange}
                    required
                    placeholder="São Paulo"
                  />
                </div>
                
                <div className="form-group" style={{ flex: '1' }}>
                  <label htmlFor="fromState">Estado</label>
                  <select
                    id="fromState"
                    name="fromState"
                    value={formData.fromState}
                    onChange={handleChange}
                    required
                  >
                    <option value="">UF</option>
                    {states.map(state => (
                      <option key={`from-${state}`} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Destino */}
            <div className="form-section">
              <h3>🏁 Destino</h3>
              <div className="form-row">
                <div className="form-group" style={{ flex: '2' }}>
                  <label htmlFor="toCity">Cidade</label>
                  <input
                    type="text"
                    id="toCity"
                    name="toCity"
                    value={formData.toCity}
                    onChange={handleChange}
                    required
                    placeholder="Campinas"
                  />
                </div>
                
                <div className="form-group" style={{ flex: '1' }}>
                  <label htmlFor="toState">Estado</label>
                  <select
                    id="toState"
                    name="toState"
                    value={formData.toState}
                    onChange={handleChange}
                    required
                  >
                    <option value="">UF</option>
                    {states.map(state => (
                      <option key={`to-${state}`} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Preço Mínimo */}
            <div className="form-section">
              <h3>💰 Preço Mínimo</h3>
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
                  placeholder="150.00"
                  style={{ maxWidth: '200px' }}
                />
                <small className="form-hint">Valor mínimo para esta rota específica</small>
              </div>
            </div>
          </form>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-button"
            onClick={handleSubmit}
          >
            {editMode ? 'Atualizar Rota' : 'Salvar Rota'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityPairModal; 