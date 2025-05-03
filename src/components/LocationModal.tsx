import React, { useState, useEffect } from 'react';
import { Location } from '../store/locationSlice';

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

  useEffect(() => {
    if (initialData) {
      setLocation(initialData);
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
    }
  }, [initialData, isOpen]);

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
      <div className="modal-content">
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
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="id">ID do Local</label>
            <input
              type="text"
              id="id"
              name="id"
              value={location.id}
              onChange={handleInputChange}
              placeholder="ex: nome-da-localidade"
              disabled={editMode}
              required
            />
            <small className="form-hint">ID único para identificar este local (sem espaços)</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Nome do Local</label>
            <input
              type="text"
              id="name"
              name="name"
              value={location.name}
              onChange={handleInputChange}
              placeholder="ex: Lenovo Sorocaba"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Endereço</label>
            <input
              type="text"
              id="address"
              name="address"
              value={location.address}
              onChange={handleInputChange}
              placeholder="ex: Av. Principal, 123"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Cidade</label>
              <input
                type="text"
                id="city"
                name="city"
                value={location.city}
                onChange={handleInputChange}
                placeholder="ex: São Paulo"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">Estado</label>
              <input
                type="text"
                id="state"
                name="state"
                value={location.state}
                onChange={handleInputChange}
                placeholder="ex: SP"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="zipCode">CEP</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={location.zipCode}
              onChange={handleInputChange}
              placeholder="ex: 00000-000"
            />
          </div>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isCompany"
              name="isCompany"
              checked={location.isCompany}
              onChange={handleInputChange}
            />
            <label htmlFor="isCompany">Este é um local da empresa (Lenovo)</label>
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
            >
              {editMode ? 'Atualizar Local' : 'Adicionar Local'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationModal; 