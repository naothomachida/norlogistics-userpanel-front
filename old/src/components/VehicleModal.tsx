import React, { useState, useEffect } from 'react';
import { VehicleType } from '../store/vehicleTypesSlice';
import './modal.css';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: VehicleType) => void;
  vehicleType: 'person' | 'cargo';
  initialData?: VehicleType;
  editMode: boolean;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  vehicleType,
  initialData,
  editMode
}) => {
  const [vehicle, setVehicle] = useState<VehicleType>({
    id: '',
    name: '',
    description: '',
    capacity: 0,
    maxWeight: 0
  });

  useEffect(() => {
    if (initialData) {
      setVehicle(initialData);
    } else {
      // Reset form quando não há dados iniciais
      setVehicle({
        id: '',
        name: '',
        description: '',
        capacity: 0,
        maxWeight: 0
      });
    }
  }, [initialData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'capacity' || name === 'maxWeight') {
      // Converter para número ou deixar vazio
      setVehicle({
        ...vehicle,
        [name]: value ? parseInt(value, 10) : undefined
      });
    } else {
      setVehicle({
        ...vehicle,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle.id || !vehicle.name) {
      alert("ID e Nome são campos obrigatórios.");
      return;
    }
    
    onSave(vehicle);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-wide">
        <div className="modal-header">
          <h2>
            {editMode 
              ? `Editar Veículo de ${vehicleType === 'person' ? 'Passageiros' : 'Carga'}`
              : `Adicionar Novo Veículo de ${vehicleType === 'person' ? 'Passageiros' : 'Carga'}`
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
            {/* Primeira linha: ID do Veículo */}
            <div className="form-group">
              <label htmlFor="id">ID do Veículo</label>
              <input
                type="text"
                id="id"
                name="id"
                value={vehicle.id}
                onChange={handleInputChange}
                placeholder="suv-executivo"
                disabled={editMode}
                required
              />
              <small className="form-hint">ID único sem espaços ou caracteres especiais</small>
            </div>
            
            {/* Segunda linha: Nome do Veículo */}
            <div className="form-group">
              <label htmlFor="name">Nome do Veículo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={vehicle.name}
                onChange={handleInputChange}
                placeholder="SUV Executivo"
                required
              />
            </div>

            {/* Terceira linha: Descrição */}
            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={vehicle.description}
                onChange={handleInputChange}
                placeholder="Descreva as características do veículo..."
                rows={3}
              />
            </div>

            {/* Espaçamento */}
            <div style={{ height: '1rem' }}></div>

            {/* Campos específicos por tipo */}
            {vehicleType === 'person' ? (
              <div className="form-group">
                <label htmlFor="capacity">Capacidade de Passageiros</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={vehicle.capacity || ''}
                  onChange={handleInputChange}
                  placeholder="4"
                  min="1"
                  max="50"
                  style={{ maxWidth: '200px' }}
                />
                <small className="form-hint">Número máximo de passageiros</small>
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="maxWeight">Capacidade de Carga</label>
                <input
                  type="number"
                  id="maxWeight"
                  name="maxWeight"
                  value={vehicle.maxWeight || ''}
                  onChange={handleInputChange}
                  placeholder="3.5"
                  step="0.1"
                  min="0.1"
                  style={{ maxWidth: '200px' }}
                />
                <small className="form-hint">Capacidade máxima em toneladas</small>
              </div>
            )}
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
            {editMode ? 'Atualizar Veículo' : 'Adicionar Veículo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleModal; 