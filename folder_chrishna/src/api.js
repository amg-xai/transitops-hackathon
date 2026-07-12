/**
 * TransitOps API client — communicates with the Django backend.
 * Automatically falls back to a fully-functional local storage / mock backend
 * if the real backend is unreachable or not running (e.g. when deployed to Vercel).
 */

const BASE = '/api';

// ── Mock Local Database (for Vercel / Offline mode) ─────────────────────────
const MOCK_DB_VERSION = 'v1';

const DEFAULT_USERS = [
  { id: 1, username: 'fleet1', role: 'fleet_manager', first_name: 'Fiona', last_name: 'Fleet' },
  { id: 2, username: 'driver1', role: 'driver', first_name: 'Dinesh', last_name: 'Driver' },
  { id: 3, username: 'safety1', role: 'safety_officer', first_name: 'Suresh', last_name: 'Safety' },
  { id: 4, username: 'finance1', role: 'financial_analyst', first_name: 'Farhan', last_name: 'Finance' },
];

const DEFAULT_VEHICLES = [
  { id: 1, registration_number: 'MH-04-AB-1234', name: 'Tata Ace', vehicle_type: 'van', max_load_capacity: 750, odometer: 12000, acquisition_cost: 550000, status: 'available', region: 'West' },
  { id: 2, registration_number: 'MH-04-CD-5678', name: 'Ashok Leyland Truck', vehicle_type: 'truck', max_load_capacity: 5000, odometer: 45000, acquisition_cost: 2200000, status: 'available', region: 'West' },
  { id: 3, registration_number: 'KA-01-EF-9012', name: 'Force Traveller', vehicle_type: 'van', max_load_capacity: 1200, odometer: 30000, acquisition_cost: 900000, status: 'on_trip', region: 'South' },
  { id: 4, registration_number: 'DL-03-GH-3456', name: 'Mahindra Bolero Pickup', vehicle_type: 'truck', max_load_capacity: 1500, odometer: 60000, acquisition_cost: 1100000, status: 'in_shop', region: 'North' },
  { id: 5, registration_number: 'MH-04-IJ-7890', name: 'Maruti Eeco', vehicle_type: 'car', max_load_capacity: 400, odometer: 8000, acquisition_cost: 450000, status: 'available', region: 'West' },
  { id: 6, registration_number: 'KA-01-KL-2345', name: 'Volvo Bus', vehicle_type: 'bus', max_load_capacity: 0, odometer: 90000, acquisition_cost: 6000000, status: 'retired', region: 'South' },
];

const DEFAULT_DRIVERS = [
  { id: 1, name: 'Ravi Kumar', license_number: 'KA1420190001234', license_category: 'HMV', license_expiry: '2027-05-15', contact_number: '9876543210', email: 'ravi@transitops.com', safety_score: 9.2, status: 'on_trip', is_license_expired: false },
  { id: 2, name: 'Amit Sharma', license_number: 'MH0220200005678', license_category: 'LMV', license_expiry: '2028-10-22', contact_number: '9876543211', email: 'amit@transitops.com', safety_score: 8.5, status: 'available', is_license_expired: false },
  { id: 3, name: 'Rajesh Patel', license_number: 'GJ0120150009999', license_category: 'HMV', license_expiry: '2026-02-10', contact_number: '9876543212', email: 'rajesh@transitops.com', safety_score: 6.8, status: 'available', is_license_expired: false },
  { id: 4, name: 'Vikram Singh', license_number: 'DL0320180004321', license_category: 'HGMV', license_expiry: '2023-12-31', contact_number: '9876543213', email: 'vikram@transitops.com', safety_score: 5.5, status: 'available', is_license_expired: true },
];

const DEFAULT_TRIPS = [
  { id: 1, vehicle_id: 3, vehicle_name: 'Force Traveller', vehicle_reg: 'KA-01-EF-9012', driver_id: 1, driver_name: 'Ravi Kumar', source: 'Bangalore', destination: 'Chennai', cargo_weight: 800, planned_distance: 350, actual_distance: null, fuel_consumed: null, revenue: 45000, status: 'dispatched', created_at: new Date().toISOString() },
];

const DEFAULT_FUEL = [
  { id: 1, vehicle_id: 1, vehicle_name: 'Tata Ace', vehicle_reg: 'MH-04-AB-1234', trip_id: null, liters: 40, cost: 4000, date: '2026-07-10' },
];

const DEFAULT_EXPENSES = [
  { id: 1, vehicle_id: 1, vehicle_name: 'Tata Ace', vehicle_reg: 'MH-04-AB-1234', trip_id: null, category: 'toll', amount: 350, description: 'NH4 Toll', date: '2026-07-10' },
];

const DEFAULT_MAINTENANCE = [
  { id: 1, vehicle_id: 4, vehicle_name: 'Mahindra Bolero Pickup', vehicle_reg: 'DL-03-GH-3456', description: 'Engine oil change and brake pad replacement', cost: 4500, status: 'active', start_date: '2026-07-11', end_date: null },
];

function getStored(key, defaultVal) {
  const data = localStorage.getItem(`transitops_${MOCK_DB_VERSION}_${key}`);
  if (!data) {
    localStorage.setItem(`transitops_${MOCK_DB_VERSION}_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
}

function setStored(key, val) {
  localStorage.setItem(`transitops_${MOCK_DB_VERSION}_${key}`, JSON.stringify(val));
}

// Check if we are running in pure client-side mock mode
const isMockMode = () => {
  return window.location.hostname.includes('vercel.app') || localStorage.getItem('transitops_force_mock') === 'true';
};

// ── Mock Implementation Functions ──────────────────────────────────────────
const mockApi = {
  auth: {
    login: async (username, password) => {
      const user = DEFAULT_USERS.find(u => u.username === username);
      if (user && password === 'demo1234') {
        localStorage.setItem('transitops_session_user', JSON.stringify(user));
        return user;
      }
      throw { error: 'Invalid credentials' };
    },
    logout: async () => {
      localStorage.removeItem('transitops_session_user');
      return { ok: true };
    },
    me: async () => {
      const user = localStorage.getItem('transitops_session_user');
      if (user) return JSON.parse(user);
      throw { error: 'Not authenticated' };
    }
  },
  dashboard: {
    stats: async () => {
      const vehicles = getStored('vehicles', DEFAULT_VEHICLES);
      const drivers = getStored('drivers', DEFAULT_DRIVERS);
      const trips = getStored('trips', DEFAULT_TRIPS);
      const maint = getStored('maintenance', DEFAULT_MAINTENANCE);

      const total_vehicles = vehicles.length;
      const available_vehicles = vehicles.filter(v => v.status === 'available').length;
      const on_trip_vehicles = vehicles.filter(v => v.status === 'on_trip').length;
      const in_shop_vehicles = vehicles.filter(v => v.status === 'in_shop').length;
      const retired_vehicles = vehicles.filter(v => v.status === 'retired').length;

      const total_drivers = drivers.length;
      const available_drivers = drivers.filter(d => d.status === 'available').length;
      const drivers_on_duty = drivers.filter(d => d.status === 'on_trip').length;

      const active_trips = trips.filter(t => t.status === 'dispatched').length;
      const pending_trips = trips.filter(t => t.status === 'draft').length;
      const completed = trips.filter(t => t.status === 'completed');
      const completed_trips_count = completed.length;
      const revenue = completed.reduce((sum, t) => sum + (t.revenue || 0), 0);

      const fleet_utilization = total_vehicles ? Math.round((on_trip_vehicles / total_vehicles) * 100) : 0;

      return {
        total_vehicles, available_vehicles, on_trip_vehicles, in_shop_vehicles, retired_vehicles,
        total_drivers, available_drivers, drivers_on_duty, active_trips, pending_trips,
        completed_trips_count, revenue, fleet_utilization
      };
    }
  },
  vehicles: {
    list: async (params = {}) => {
      let list = getStored('vehicles', DEFAULT_VEHICLES);
      if (params.q) {
        const q = params.q.toLowerCase();
        list = list.filter(v => v.name.toLowerCase().includes(q) || v.registration_number.toLowerCase().includes(q) || (v.region || '').toLowerCase().includes(q));
      }
      if (params.status) list = list.filter(v => v.status === params.status);
      if (params.vehicle_type) list = list.filter(v => v.vehicle_type === params.vehicle_type);
      return list;
    },
    create: async (data) => {
      const list = getStored('vehicles', DEFAULT_VEHICLES);
      const newV = {
        id: list.length ? Math.max(...list.map(v => v.id)) + 1 : 1,
        ...data,
        status: data.status || 'available'
      };
      list.push(newV);
      setStored('vehicles', list);
      return newV;
    },
    update: async (id, data) => {
      const list = getStored('vehicles', DEFAULT_VEHICLES);
      const idx = list.findIndex(v => v.id === Number(id));
      if (idx === -1) throw { error: 'Vehicle not found' };
      list[idx] = { ...list[idx], ...data };
      setStored('vehicles', list);
      return list[idx];
    },
    remove: async (id) => {
      let list = getStored('vehicles', DEFAULT_VEHICLES);
      list = list.filter(v => v.id !== Number(id));
      setStored('vehicles', list);
      return { ok: true };
    }
  },
  drivers: {
    list: async (params = {}) => {
      let list = getStored('drivers', DEFAULT_DRIVERS);
      if (params.q) {
        const q = params.q.toLowerCase();
        list = list.filter(d => d.name.toLowerCase().includes(q) || d.license_number.toLowerCase().includes(q));
      }
      if (params.status) list = list.filter(d => d.status === params.status);
      return list;
    },
    create: async (data) => {
      const list = getStored('drivers', DEFAULT_DRIVERS);
      const newD = {
        id: list.length ? Math.max(...list.map(d => d.id)) + 1 : 1,
        ...data,
        safety_score: Number(data.safety_score) || 10.0,
        status: data.status || 'available',
        is_license_expired: new Date(data.license_expiry) < new Date()
      };
      list.push(newD);
      setStored('drivers', list);
      return newD;
    },
    update: async (id, data) => {
      const list = getStored('drivers', DEFAULT_DRIVERS);
      const idx = list.findIndex(d => d.id === Number(id));
      if (idx === -1) throw { error: 'Driver not found' };
      list[idx] = { ...list[idx], ...data, is_license_expired: new Date(data.license_expiry || list[idx].license_expiry) < new Date() };
      setStored('drivers', list);
      return list[idx];
    },
    remove: async (id) => {
      let list = getStored('drivers', DEFAULT_DRIVERS);
      list = list.filter(d => d.id !== Number(id));
      setStored('drivers', list);
      return { ok: true };
    }
  },
  trips: {
    list: async (params = {}) => {
      let list = getStored('trips', DEFAULT_TRIPS);
      if (params.q) {
        const q = params.q.toLowerCase();
        list = list.filter(t => t.source.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q) || (t.vehicle_reg || '').toLowerCase().includes(q));
      }
      if (params.status) list = list.filter(t => t.status === params.status);
      return list;
    },
    create: async (data) => {
      const list = getStored('trips', DEFAULT_TRIPS);
      const vehicles = getStored('vehicles', DEFAULT_VEHICLES);
      const drivers = getStored('drivers', DEFAULT_DRIVERS);

      const vehicle = vehicles.find(v => v.id === Number(data.vehicle_id));
      const driver = drivers.find(d => d.id === Number(data.driver_id));

      const newT = {
        id: list.length ? Math.max(...list.map(t => t.id)) + 1 : 1,
        vehicle_id: Number(data.vehicle_id),
        vehicle_name: vehicle ? vehicle.name : '',
        vehicle_reg: vehicle ? vehicle.registration_number : '',
        driver_id: Number(data.driver_id),
        driver_name: driver ? driver.name : '',
        source: data.source,
        destination: data.destination,
        cargo_weight: Number(data.cargo_weight) || 0,
        planned_distance: Number(data.planned_distance) || 0,
        actual_distance: null,
        fuel_consumed: null,
        revenue: Number(data.revenue) || 0,
        status: 'draft',
        created_at: new Date().toISOString()
      };
      list.push(newT);
      setStored('trips', list);
      return newT;
    },
    dispatch: async (id) => {
      const list = getStored('trips', DEFAULT_TRIPS);
      const idx = list.findIndex(t => t.id === Number(id));
      if (idx === -1) throw { error: 'Trip not found' };

      // Update vehicle & driver status
      const vehicles = getStored('vehicles', DEFAULT_VEHICLES);
      const drivers = getStored('drivers', DEFAULT_DRIVERS);

      const vIdx = vehicles.findIndex(v => v.id === list[idx].vehicle_id);
      const dIdx = drivers.findIndex(d => d.id === list[idx].driver_id);

      if (vIdx !== -1) vehicles[vIdx].status = 'on_trip';
      if (dIdx !== -1) drivers[dIdx].status = 'on_trip';

      setStored('vehicles', vehicles);
      setStored('drivers', drivers);

      list[idx].status = 'dispatched';
      setStored('trips', list);
      return list[idx];
    },
    complete: async (id, data) => {
      const list = getStored('trips', DEFAULT_TRIPS);
      const idx = list.findIndex(t => t.id === Number(id));
      if (idx === -1) throw { error: 'Trip not found' };

      const vehicles = getStored('vehicles', DEFAULT_VEHICLES);
      const drivers = getStored('drivers', DEFAULT_DRIVERS);

      const vIdx = vehicles.findIndex(v => v.id === list[idx].vehicle_id);
      const dIdx = drivers.findIndex(d => d.id === list[idx].driver_id);

      if (vIdx !== -1) {
        vehicles[vIdx].status = 'available';
        vehicles[vIdx].odometer = Number(data.final_odometer) || vehicles[vIdx].odometer;
      }
      if (dIdx !== -1) drivers[dIdx].status = 'available';

      setStored('vehicles', vehicles);
      setStored('drivers', drivers);

      list[idx].status = 'completed';
      list[idx].actual_distance = Number(data.actual_distance) || list[idx].planned_distance;
      list[idx].fuel_consumed = Number(data.fuel_consumed) || 0;
      list[idx].revenue = Number(data.revenue) || list[idx].revenue;

      // Add to fuel logs
      if (Number(data.fuel_consumed) > 0) {
        const fuel = getStored('fuel', DEFAULT_FUEL);
        fuel.push({
          id: fuel.length ? Math.max(...fuel.map(f => f.id)) + 1 : 1,
          vehicle_id: list[idx].vehicle_id,
          vehicle_name: list[idx].vehicle_name,
          vehicle_reg: list[idx].vehicle_reg,
          trip_id: list[idx].id,
          liters: Number(data.fuel_consumed),
          cost: Number(data.fuel_consumed) * 100, // rough estimate
          date: new Date().toISOString().split('T')[0]
        });
        setStored('fuel', fuel);
      }

      setStored('trips', list);
      return list[idx];
    },
    cancel: async (id) => {
      const list = getStored('trips', DEFAULT_TRIPS);
      const idx = list.findIndex(t => t.id === Number(id));
      if (idx === -1) throw { error: 'Trip not found' };

      const vehicles = getStored('vehicles', DEFAULT_VEHICLES);
      const drivers = getStored('drivers', DEFAULT_DRIVERS);

      const vIdx = vehicles.findIndex(v => v.id === list[idx].vehicle_id);
      const dIdx = drivers.findIndex(d => d.id === list[idx].driver_id);

      if (vIdx !== -1 && vehicles[vIdx].status === 'on_trip') vehicles[vIdx].status = 'available';
      if (dIdx !== -1 && drivers[dIdx].status === 'on_trip') drivers[dIdx].status = 'available';

      setStored('vehicles', vehicles);
      setStored('drivers', drivers);

      list[idx].status = 'cancelled';
      setStored('trips', list);
      return list[idx];
    }
  },
  fueling: {
    list: async () => getStored('fuel', DEFAULT_FUEL),
    create: async (data) => {
      const fuel = getStored('fuel', DEFAULT_FUEL);
      const vehicles = getStored('vehicles', DEFAULT_VEHICLES);
      const vehicle = vehicles.find(v => v.id === Number(data.vehicle_id));

      const newF = {
        id: fuel.length ? Math.max(...fuel.map(f => f.id)) + 1 : 1,
        vehicle_id: Number(data.vehicle_id),
        vehicle_name: vehicle ? vehicle.name : '',
        vehicle_reg: vehicle ? vehicle.registration_number : '',
        trip_id: data.trip_id ? Number(data.trip_id) : null,
        liters: Number(data.liters) || 0,
        cost: Number(data.cost) || 0,
        date: data.date
      };
      fuel.push(newF);
      setStored('fuel', fuel);
      return newF;
    }
  },
  expenses: {
    list: async () => getStored('expenses', DEFAULT_EXPENSES),
    create: async (data) => {
      const expenses = getStored('expenses', DEFAULT_EXPENSES);
      const vehicles = getStored('vehicles', DEFAULT_VEHICLES);
      const vehicle = vehicles.find(v => v.id === Number(data.vehicle_id));

      const newE = {
        id: expenses.length ? Math.max(...expenses.map(e => e.id)) + 1 : 1,
        vehicle_id: Number(data.vehicle_id),
        vehicle_name: vehicle ? vehicle.name : '',
        vehicle_reg: vehicle ? vehicle.registration_number : '',
        trip_id: data.trip_id ? Number(data.trip_id) : null,
        category: data.category || 'other',
        amount: Number(data.amount) || 0,
        description: data.description || '',
        date: data.date
      };
      expenses.push(newE);
      setStored('expenses', expenses);
      return newE;
    }
  },
  maintenance: {
    list: async () => getStored('maintenance', DEFAULT_MAINTENANCE),
    create: async (data) => {
      const maint = getStored('maintenance', DEFAULT_MAINTENANCE);
      const vehicles = getStored('vehicles', DEFAULT_VEHICLES);
      const vIdx = vehicles.findIndex(v => v.id === Number(data.vehicle_id));

      if (vIdx !== -1) {
        vehicles[vIdx].status = 'in_shop';
        setStored('vehicles', vehicles);
      }

      const newM = {
        id: maint.length ? Math.max(...maint.map(m => m.id)) + 1 : 1,
        vehicle_id: Number(data.vehicle_id),
        vehicle_name: vehicles[vIdx] ? vehicles[vIdx].name : '',
        vehicle_reg: vehicles[vIdx] ? vehicles[vIdx].registration_number : '',
        description: data.description,
        cost: Number(data.cost) || 0,
        status: 'active',
        start_date: data.start_date,
        end_date: null
      };
      maint.push(newM);
      setStored('maintenance', maint);
      return newM;
    },
    close: async (id) => {
      const maint = getStored('maintenance', DEFAULT_MAINTENANCE);
      const idx = maint.findIndex(m => m.id === Number(id));
      if (idx === -1) throw { error: 'Maintenance record not found' };

      const vehicles = getStored('vehicles', DEFAULT_VEHICLES);
      const vIdx = vehicles.findIndex(v => v.id === maint[idx].vehicle_id);

      if (vIdx !== -1) {
        vehicles[vIdx].status = 'available';
        setStored('vehicles', vehicles);
      }

      maint[idx].status = 'closed';
      maint[idx].end_date = new Date().toISOString().split('T')[0];
      setStored('maintenance', maint);
      return maint[idx];
    }
  }
};

// ── Generic Request Wrapper ──────────────────────────────────────────────────
async function request(path, options = {}) {
  // If we are in mock mode, route directly to the mock implementation
  if (isMockMode()) {
    return routeMock(path, options);
  }

  const url = `${BASE}${path}`;
  const config = {
    credentials: 'include',   // send session cookies
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  } catch (err) {
    // If the network call failed, or we got a 404, fall back to mock client-side DB
    console.warn(`API call failed: ${path}. Falling back to client-side storage.`, err);
    localStorage.setItem('transitops_force_mock', 'true');
    return routeMock(path, options);
  }
}

// Helper to route requests to mock handlers
function routeMock(path, options) {
  const method = options.method || 'GET';
  const data = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

  // Parse path and query params
  const [cleanPath, queryString] = path.split('?');
  const params = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((val, key) => {
      params[key] = val;
    });
  }

  // Auth routing
  if (cleanPath === '/auth/login/') return mockApi.auth.login(data.username, data.password);
  if (cleanPath === '/auth/logout/') return mockApi.auth.logout();
  if (cleanPath === '/auth/me/') return mockApi.auth.me();

  // Dashboard routing
  if (cleanPath === '/dashboard/stats/') return mockApi.dashboard.stats();

  // Vehicles routing
  if (cleanPath === '/vehicles/') {
    if (method === 'GET') return mockApi.vehicles.list(params);
  }
  if (cleanPath === '/vehicles/create/') return mockApi.vehicles.create(data);
  const vehicleMatch = cleanPath.match(/^\/vehicles\/(\d+)\/$/);
  if (vehicleMatch) {
    const id = vehicleMatch[1];
    if (method === 'PUT') return mockApi.vehicles.update(id, data);
    if (method === 'DELETE') return mockApi.vehicles.remove(id);
  }

  // Drivers routing
  if (cleanPath === '/drivers/') {
    if (method === 'GET') return mockApi.drivers.list(params);
  }
  if (cleanPath === '/drivers/create/') return mockApi.drivers.create(data);
  const driverMatch = cleanPath.match(/^\/drivers\/(\d+)\/$/);
  if (driverMatch) {
    const id = driverMatch[1];
    if (method === 'PUT') return mockApi.drivers.update(id, data);
    if (method === 'DELETE') return mockApi.drivers.remove(id);
  }

  // Trips routing
  if (cleanPath === '/trips/') {
    if (method === 'GET') return mockApi.trips.list(params);
  }
  if (cleanPath === '/trips/create/') return mockApi.trips.create(data);
  const dispatchMatch = cleanPath.match(/^\/trips\/(\d+)\/dispatch\/$/);
  if (dispatchMatch) return mockApi.trips.dispatch(dispatchMatch[1]);
  const completeMatch = cleanPath.match(/^\/trips\/(\d+)\/complete\/$/);
  if (completeMatch) return mockApi.trips.complete(completeMatch[1], data);
  const cancelMatch = cleanPath.match(/^\/trips\/(\d+)\/cancel\/$/);
  if (cancelMatch) return mockApi.trips.cancel(cancelMatch[1]);

  // Fueling routing
  if (cleanPath === '/fueling/') return mockApi.fueling.list();
  if (cleanPath === '/fueling/create/') return mockApi.fueling.create(data);

  // Expenses routing
  if (cleanPath === '/expenses/') return mockApi.expenses.list();
  if (cleanPath === '/expenses/create/') return mockApi.expenses.create(data);

  // Maintenance routing
  if (cleanPath === '/maintenance/') return mockApi.maintenance.list();
  if (cleanPath === '/maintenance/create/') return mockApi.maintenance.create(data);
  const closeMaintMatch = cleanPath.match(/^\/maintenance\/(\d+)\/close\/$/);
  if (closeMaintMatch) return mockApi.maintenance.close(closeMaintMatch[1]);

  throw { error: `Endpoint mock not found: ${method} ${cleanPath}` };
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const auth = {
  login:  (username, password) => request('/auth/login/',  { method: 'POST', body: { username, password } }),
  logout: ()                   => request('/auth/logout/', { method: 'POST' }),
  me:     ()                   => request('/auth/me/'),
};

// ── Dashboard ───────────────────────────────────────────────────────────────
export const dashboard = {
  stats: () => request('/dashboard/stats/'),
};

// ── Vehicles ────────────────────────────────────────────────────────────────
export const vehicles = {
  list:   (params = {})   => { const q = new URLSearchParams(params).toString(); return request(`/vehicles/${q ? '?' + q : ''}`); },
  create: (data)          => request('/vehicles/create/', { method: 'POST', body: data }),
  update: (id, data)      => request(`/vehicles/${id}/`,  { method: 'PUT', body: data }),
  remove: (id)            => request(`/vehicles/${id}/`,  { method: 'DELETE' }),
};

// ── Drivers ─────────────────────────────────────────────────────────────────
export const drivers = {
  list:   (params = {})   => { const q = new URLSearchParams(params).toString(); return request(`/drivers/${q ? '?' + q : ''}`); },
  create: (data)          => request('/drivers/create/', { method: 'POST', body: data }),
  update: (id, data)      => request(`/drivers/${id}/`,  { method: 'PUT', body: data }),
  remove: (id)            => request(`/drivers/${id}/`,  { method: 'DELETE' }),
};

// ── Trips ───────────────────────────────────────────────────────────────────
export const trips = {
  list:     (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/trips/${q ? '?' + q : ''}`); },
  create:   (data)        => request('/trips/create/',         { method: 'POST', body: data }),
  dispatch: (id)          => request(`/trips/${id}/dispatch/`, { method: 'POST' }),
  complete: (id, data)    => request(`/trips/${id}/complete/`, { method: 'POST', body: data }),
  cancel:   (id)          => request(`/trips/${id}/cancel/`,   { method: 'POST' }),
};

// ── Fueling ─────────────────────────────────────────────────────────────────
export const fueling = {
  list:   () => request('/fueling/'),
  create: (data) => request('/fueling/create/', { method: 'POST', body: data }),
};

// ── Expenses ────────────────────────────────────────────────────────────────
export const expenses = {
  list:   () => request('/expenses/'),
  create: (data) => request('/expenses/create/', { method: 'POST', body: data }),
};

// ── Maintenance ─────────────────────────────────────────────────────────────
export const maintenance = {
  list:   () => request('/maintenance/'),
  create: (data) => request('/maintenance/create/', { method: 'POST', body: data }),
  close:  (id) => request(`/maintenance/${id}/close/`, { method: 'POST' }),
};
