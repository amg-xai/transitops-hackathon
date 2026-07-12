export interface DashboardKPIs {
  vehicles: {
    total: number;
    available: number;
    on_trip: number;
    in_shop: number;
    retired: number;
  };
  trips: {
    active: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  drivers: {
    total: number;
    on_duty: number;
    available: number;
    suspended: number;
    expired_licenses: number;
  };
  fleet_utilization: number;
}

export interface StatusSummary {
  status: string;
  count: number;
}

export interface FuelEfficiencyReport {
  trip_id: number;
  vehicle: string;
  vehicle_name: string;
  distance: number;
  fuel_consumed: number;
  efficiency_km_per_liter: number;
  date: string;
}

export interface OperationalCostReport {
  vehicle_id: number;
  vehicle_registration: string;
  vehicle_name: string;
  fuel_cost: number;
  maintenance_cost: number;
  other_expenses: number;
  total_operational_cost: number;
}

export interface VehicleROIReport {
  vehicle_id: number;
  vehicle_registration: string;
  vehicle_name: string;
  acquisition_cost: number;
  total_revenue: number;
  total_fuel_cost: number;
  total_maintenance_cost: number;
  total_cost: number;
  roi_percentage: number;
}

export interface FleetUtilizationReport {
  overall_utilization_percentage: number;
  total_vehicles: number;
  vehicles_on_trip: number;
  by_vehicle_type: {
    vehicle_type: string;
    total: number;
    on_trip: number;
    utilization_percentage: number;
  }[];
}
