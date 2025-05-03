import React, { useState, useEffect } from 'react';
import { VehicleType } from '../store/vehicleTypesSlice';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicle({
      ...vehicle,
      [name]: value
    });
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
      <div className="modal-content">
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
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="id">ID do Veículo</label>
            <input
              type="text"
              id="id"
              name="id"
              value={vehicle.id}
              onChange={handleInputChange}
              placeholder="ex: suv, van, truck_large"
              disabled={editMode}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Nome do Veículo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={vehicle.name}
              onChange={handleInputChange}
              placeholder="ex: SUV, Van, Caminhão grande"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descrição</label>
            <input
              type="text"
              id="description"
              name="description"
              value={vehicle.description}
              onChange={handleInputChange}
              placeholder="ex: Veículo robusto para até 5 pessoas"
            />
          </div>
          
          {vehicleType === 'person' ? (
            <div className="form-group">
              <label htmlFor="capacity">Capacidade (passageiros)</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={vehicle.capacity}
                onChange={handleInputChange}
                min="1"
                placeholder="ex: 5"
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="maxWeight">Capacidade (toneladas)</label>
              <input
                type="number"
                id="maxWeight"
                name="maxWeight"
                value={vehicle.maxWeight}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
                placeholder="ex: 3.5"
              />
            </div>
          )}
          
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
              {editMode ? 'Atualizar Veículo' : 'Adicionar Veículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleModal; 