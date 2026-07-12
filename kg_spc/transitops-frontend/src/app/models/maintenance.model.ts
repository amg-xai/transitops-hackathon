export interface MaintenanceLog {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_registration: string;
  description: string;
  cost: number;
  status: 'active' | 'closed';
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface MaintenanceLogList {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_registration: string;
  description: string;
  cost: number;
  status: string;
  start_date: string;
  created_at: string;
}
