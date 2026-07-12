export interface Vehicle {
  id: number;
  registration_number: string;
  name: string;
  vehicle_type: 'van' | 'truck' | 'bus' | 'car' | 'motorcycle';
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: 'available' | 'on_trip' | 'in_shop' | 'retired';
  region: string;
  is_dispatchable: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleList {
  id: number;
  registration_number: string;
  name: string;
  vehicle_type: string;
  max_load_capacity: number;
  status: string;
  region: string;
  is_dispatchable: boolean;
}
