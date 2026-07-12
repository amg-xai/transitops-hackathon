export interface FuelLog {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_registration: string;
  trip: number | null;
  liters: number;
  cost: number;
  date: string;
  created_at: string;
}

export interface FuelLogList {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_registration: string;
  liters: number;
  cost: number;
  date: string;
  created_at: string;
}

export interface Expense {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_registration: string;
  trip: number | null;
  category: 'fuel' | 'toll' | 'maintenance' | 'other';
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface ExpenseList {
  id: number;
  vehicle: number;
  vehicle_name: string;
  vehicle_registration: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}
