export interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  contact_number: string;
  safety_score: number;
  status: 'available' | 'on_trip' | 'off_duty' | 'suspended';
  is_license_expired: boolean;
  is_dispatchable: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverList {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry: string;
  safety_score: number;
  status: string;
  is_license_expired: boolean;
  is_dispatchable: boolean;
}
