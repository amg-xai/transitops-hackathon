export interface Trip {
  id: number;
  vehicle: number;
  driver: number;
  source: string;
  destination: string;
  cargo_weight: number;
  planned_distance: number;
  actual_distance: number | null;
  fuel_consumed: number | null;
  final_odometer: number | null;
  revenue: number;
  status: 'draft' | 'dispatched' | 'completed' | 'cancelled';
  vehicle_name: string;
  vehicle_registration: string;
  driver_name: string;
  created_by: number | null;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface TripList {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_registration: string;
  driver: number;
  driver_name: string;
  source: string;
  destination: string;
  cargo_weight: number;
  planned_distance: number;
  status: string;
  created_at: string;
}

export interface TripCompleteData {
  final_odometer: number;
  fuel_consumed: number;
  actual_distance: number;
  revenue: number;
}
