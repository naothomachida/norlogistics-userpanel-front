import React from 'react';
import { 
  FaPlane, 
  FaHotel, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaHome, 
  FaWarehouse,
  FaMoneyBillWave  // Adicionar ícone de pedágio
} from 'react-icons/fa';

// Keywords for location type detection
const AIRPORT_KEYWORDS = ['aeroporto', 'airport', 'gru', 'cgh', 'vcp', 'gig', 'sdu', 'confins', 'pinto martins'];
const HOTEL_KEYWORDS = ['hotel', 'pousada', 'resort', 'hostel', 'apart'];
const WAREHOUSE_KEYWORDS = ['galpão', 'armazém', 'depósito', 'centro de distribuição', 'cd ', 'warehouse'];

// Utility function to get initials from company name
const getInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return 'XX';
  
  const words = name.trim().split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return 'XX';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  
  // Get first letter of first word and first letter of last word
  const firstLetter = words[0].charAt(0).toUpperCase();
  const lastLetter = words[words.length - 1].charAt(0).toUpperCase();
  
  return `${firstLetter}${lastLetter}`;
};

// Centralized location icon selection
export const getLocationIcon = (
  point: {
    name?: string, 
    locationType?: 'airport' | 'hotel' | 'other', 
    isCompany?: boolean,
    isToll?: boolean  // Adicionar suporte para pedágio
  }, 
  options: {
    size?: number, 
    className?: string
  } = {}
) => {
  const { name = '', locationType, isCompany, isToll } = point;
  const { size = 12, className = '' } = options;

  const nameLower = (name || '').toLowerCase();

  // Pedágio tem prioridade
  if (isToll) {
    return <FaMoneyBillWave className={`text-orange-600 ${className}`} size={size} />;
  }

  // Specific type checks
  if (locationType === 'airport') {
    return <FaPlane className={`text-sky-600 ${className}`} size={size} />;
  }

  if (locationType === 'hotel') {
    return <FaHotel className={`text-purple-600 ${className}`} size={size} />;
  }

  // Keyword-based detection
  if (AIRPORT_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return <FaPlane className={`text-sky-600 ${className}`} size={size} />;
  }

  if (HOTEL_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return <FaHotel className={`text-purple-600 ${className}`} size={size} />;
  }

  if (WAREHOUSE_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return <FaWarehouse className={`text-green-600 ${className}`} size={size} />;
  }

  // Company handling
  if (isCompany) {
    const CompanyInitialsIcon = () => (
      <div 
        className={`
          w-5 h-5 rounded-full 
          bg-purple-100 text-purple-600 
          flex items-center justify-center 
          font-bold text-xs
          ${className}
        `}
      >
        {getInitials(name)}
      </div>
    );

    return <CompanyInitialsIcon />;
  }

  // Last resort: map pin
  return <FaMapMarkerAlt className={`text-gray-500 ${className}`} size={size} />;
};

// Utility to get location type badge
export const getLocationTypeBadge = (locationType?: 'airport' | 'hotel' | 'other') => {
  switch (locationType) {
    case 'airport':
      return {
        text: 'Aeroporto',
        className: 'bg-sky-100 text-sky-800'
      };
    case 'hotel':
      return {
        text: 'Hotel',
        className: 'bg-purple-100 text-purple-800'
      };
    case 'other':
      return {
        text: 'Outro Local',
        className: 'bg-gray-100 text-gray-800'
      };
    default:
      return null;
  }
}; 