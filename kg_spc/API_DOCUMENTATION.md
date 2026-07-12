# TransitOps API Documentation

## Overview
TransitOps is a transport operations platform API built with Django REST Framework. It provides endpoints for managing vehicles, drivers, trips, maintenance, fuel logs, expenses, and analytics.

## Base URL
```
http://localhost:8000
```

## Authentication
The API uses Django's built-in session authentication. All endpoints (except auth endpoints) require authentication.

### Auth Endpoints

#### Login
```
POST /api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}
```

#### Register
```
POST /api/auth/register/
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "password123",
  "password_confirm": "password123",
  "role": "fleet_manager"
}
```

#### Logout
```
POST /api/auth/logout/
```

#### Profile
```
GET /api/auth/profile/
```

## Vehicles

### List Vehicles
```
GET /api/vehicles/
```
Filters: `status`, `vehicle_type`, `region`
Search: `registration_number`, `name`

### Get Available Vehicles
```
GET /api/vehicles/available/
```

### Get Dispatchable Vehicles
```
GET /api/vehicles/dispatchable/
```

### Create Vehicle
```
POST /api/vehicles/
{
  "registration_number": "Van-05",
  "name": "Delivery Van 5",
  "vehicle_type": "van",
  "max_load_capacity": 500.00,
  "odometer": 0,
  "acquisition_cost": 50000.00,
  "status": "available",
  "region": "North"
}
```

### Update Vehicle
```
PUT /api/vehicles/{id}/
PATCH /api/vehicles/{id}/
```

### Delete Vehicle
```
DELETE /api/vehicles/{id}/
```

## Drivers

### List Drivers
```
GET /api/drivers/
```
Filters: `status`, `license_category`
Search: `name`, `license_number`, `contact_number`

### Get Available Drivers
```
GET /api/drivers/available/
```

### Get Dispatchable Drivers
```
GET /api/drivers/dispatchable/
```

### Create Driver
```
POST /api/drivers/
{
  "name": "Alex",
  "license_number": "LIC123456",
  "license_category": "B",
  "license_expiry": "2025-12-31",
  "contact_number": "+1234567890",
  "safety_score": 9.5,
  "status": "available"
}
```

### Update Driver
```
PUT /api/drivers/{id}/
PATCH /api/drivers/{id}/
```

### Delete Driver
```
DELETE /api/drivers/{id}/
```

## Trips

### List Trips
```
GET /api/trips/
```
Filters: `status`, `vehicle`, `driver`
Search: `source`, `destination`, `vehicle__registration_number`, `driver__name`

### Create Trip
```
POST /api/trips/
{
  "vehicle": 1,
  "driver": 1,
  "source": "Warehouse A",
  "destination": "Store B",
  "cargo_weight": 450.00,
  "planned_distance": 50.00
}
```

### Dispatch Trip
```
POST /api/trips/{id}/dispatch/
```
Validates:
- Trip must be in draft status
- Vehicle must be available
- Driver must be available with valid license
- Cargo weight must not exceed vehicle capacity

### Complete Trip
```
POST /api/trips/{id}/complete/
{
  "final_odometer": 1050.00,
  "fuel_consumed": 10.00,
  "actual_distance": 52.00,
  "revenue": 500.00
}
```

### Cancel Trip
```
POST /api/trips/{id}/cancel/
```

## Maintenance

### List Maintenance Logs
```
GET /api/maintenance/
```
Filters: `status`, `vehicle`
Search: `description`, `vehicle__registration_number`, `vehicle__name`

### Create Maintenance Log
```
POST /api/maintenance/
{
  "vehicle": 1,
  "description": "Oil Change",
  "cost": 100.00,
  "status": "active",
  "start_date": "2024-01-15"
}
```
Note: Creating an active maintenance log automatically sets vehicle status to "in_shop"

### Close Maintenance
```
POST /api/maintenance/{id}/close/
```
Note: Closing maintenance restores vehicle to "available" (unless retired)

## Fuel & Expenses

### List Fuel Logs
```
GET /api/fueling/fuel/
```
Filters: `vehicle`, `trip`, `date`

### Create Fuel Log
```
POST /api/fueling/fuel/
{
  "vehicle": 1,
  "trip": 1,
  "liters": 10.00,
  "cost": 100.00,
  "date": "2024-01-15"
}
```

### List Expenses
```
GET /api/fueling/expenses/
```
Filters: `vehicle`, `trip`, `category`, `date`

### Create Expense
```
POST /api/fueling/expenses/
{
  "vehicle": 1,
  "trip": 1,
  "category": "toll",
  "amount": 25.00,
  "description": "Highway toll",
  "date": "2024-01-15"
}
```

### Get Expenses by Vehicle
```
GET /api/fueling/expenses/by_vehicle/?vehicle_id=1
```

## Dashboard

### Get Dashboard KPIs
```
GET /api/kpis/
```
Filters: `vehicle_type`, `vehicle_status`, `region`

Returns:
- Vehicle counts (total, available, on_trip, in_shop, retired)
- Trip counts (active, pending, completed, cancelled)
- Driver counts (total, on_duty, available, suspended, expired_licenses)
- Fleet utilization percentage

### Status Summaries
```
GET /api/summary/vehicles/
GET /api/summary/drivers/
GET /api/summary/trips/
```

## Reports & Analytics

### Fuel Efficiency Report
```
GET /api/reports/fuel-efficiency/?vehicle_id=1
```
Returns fuel efficiency (km/liter) per trip

### Operational Cost Report
```
GET /api/reports/operational-cost/?vehicle_id=1
```
Returns operational costs (fuel + maintenance + other) per vehicle

### Vehicle ROI Report
```
GET /api/reports/vehicle-roi/?vehicle_id=1
```
Returns ROI calculation: (Revenue - (Maintenance + Fuel)) / Acquisition Cost

### Fleet Utilization Report
```
GET /api/reports/fleet-utilization/
```
Returns fleet utilization metrics by vehicle type

## CSV Export

### Export Vehicles
```
GET /api/export/vehicles/
```

### Export Drivers
```
GET /api/export/drivers/
```

### Export Trips
```
GET /api/export/trips/
```

### Export Fuel Logs
```
GET /api/export/fuel-logs/
```

### Export Expenses
```
GET /api/export/expenses/
```

## Business Rules

1. **Vehicle Registration**: Registration number must be unique
2. **Dispatch Validation**: 
   - Retired or In Shop vehicles cannot be dispatched
   - Drivers with expired licenses or Suspended status cannot be assigned
   - A driver or vehicle already On Trip cannot be assigned to another trip
   - Cargo Weight must not exceed vehicle's maximum load capacity
3. **Automatic Status Transitions**:
   - Dispatching a trip → Vehicle and Driver status become "On Trip"
   - Completing a trip → Vehicle and Driver status become "Available"
   - Cancelling a dispatched trip → Vehicle and Driver status become "Available"
   - Creating active maintenance → Vehicle status becomes "In Shop"
   - Closing maintenance → Vehicle status becomes "Available" (unless retired)

## Running the Server

```bash
cd transitops-hackathon
python manage.py runserver
```

## Admin Panel

Access the Django admin panel at:
```
http://localhost:8000/admin/
```

Default superuser credentials:
- Username: admin
- Password: (set during setup)

## Testing the Example Workflow

1. Register a vehicle 'Van-05' with capacity 500 kg
```bash
POST /api/vehicles/
{
  "registration_number": "Van-05",
  "name": "Delivery Van 5",
  "vehicle_type": "van",
  "max_load_capacity": 500.00,
  "odometer": 0,
  "acquisition_cost": 50000.00,
  "status": "available"
}
```

2. Register driver 'Alex' with valid license
```bash
POST /api/drivers/
{
  "name": "Alex",
  "license_number": "LIC123456",
  "license_category": "B",
  "license_expiry": "2025-12-31",
  "contact_number": "+1234567890",
  "safety_score": 9.5,
  "status": "available"
}
```

3. Create a trip with Cargo Weight = 450 kg
```bash
POST /api/trips/
{
  "vehicle": 1,
  "driver": 1,
  "source": "Warehouse A",
  "destination": "Store B",
  "cargo_weight": 450.00,
  "planned_distance": 50.00
}
```

4. Dispatch the trip
```bash
POST /api/trips/1/dispatch/
```

5. Complete the trip
```bash
POST /api/trips/1/complete/
{
  "final_odometer": 1050.00,
  "fuel_consumed": 10.00,
  "actual_distance": 52.00,
  "revenue": 500.00
}
```

6. Create maintenance record
```bash
POST /api/maintenance/
{
  "vehicle": 1,
  "description": "Oil Change",
  "cost": 100.00,
  "status": "active",
  "start_date": "2024-01-15"
}
```

7. Check reports for updated operational cost and fuel efficiency
```bash
GET /api/reports/operational-cost/?vehicle_id=1
GET /api/reports/fuel-efficiency/?vehicle_id=1
```
