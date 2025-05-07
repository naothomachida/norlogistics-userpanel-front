export type LocationId = 
  | string  // Existing location IDs
  | 'airport'  // New custom location types
  | 'hotel'
  | 'other'
  | 'last-passenger'; 