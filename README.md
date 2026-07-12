# TransitOps — Smart Transport Operations Platform

A centralized platform for managing vehicles, drivers, trips, maintenance,
and fuel/expense tracking, with role-based access and operational analytics.

## Tech Stack
Django 6.0 · SQLite · Bootstrap 5 · Chart.js — server-rendered, no build step required.

## Quick Start

```powershell
git clone https://github.com/amg-xai/transitops-hackathon.git
cd transitops-hackathon
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt

python manage.py migrate
python manage.py seed_demo      # creates demo users + sample fleet data
python manage.py runserver
```

Visit `http://127.0.0.1:8000` and log in with any account below.

## Demo Accounts

All seeded via `python manage.py seed_demo`. Password for all: **`demo1234`**

| Username | Role | Access |
|---|---|---|
| `fleet1` | Fleet Manager | Full access — vehicles, maintenance, all reports |
| `driver1` | Driver | Create/dispatch/complete trips |
| `safety1` | Safety Officer | Edit driver records, license/safety scores |
| `finance1` | Financial Analyst | Fuel & expense logging, reports, CSV export |

To create your own superuser instead: `python manage.py createsuperuser`

## Role-Based Access Control

| Feature | Fleet Manager | Driver | Safety Officer | Financial Analyst |
|---|:---:|:---:|:---:|:---:|
| Vehicles (CRUD) | ✅ | view only | view only | view only |
| Drivers (edit) | ✅ | view only | ✅ | view only |
| Drivers (delete) | ✅ | — | — | — |
| Trips (create/dispatch/complete) | ✅ | ✅ | view only | view only |
| Maintenance | ✅ | view only | view only | view only |
| Fuel & Expenses | ✅ | view only | view only | ✅ |
| Reports & CSV export | ✅ | — | — | ✅ |

## Business Rules Implemented

- Vehicle registration numbers and driver license numbers are enforced unique
- Retired / In Shop vehicles are excluded from trip dispatch
- Drivers with expired licenses or Suspended status cannot be assigned to trips
- Cargo weight is validated against vehicle max load capacity before dispatch
- Dispatching a trip auto-sets vehicle + driver to "On Trip"; completing or
  cancelling restores both to "Available"
- Opening a maintenance record auto-sets the vehicle to "In Shop"; closing it
  restores "Available" (unless the vehicle is Retired)

## Reports & Analytics

Per-vehicle Fuel Efficiency (km/L), Operational Cost (Fuel + Maintenance),
and ROI = `(Revenue − (Fuel + Maintenance)) / Acquisition Cost`, with bar
charts and CSV export at `/reports/export/`.

## Project Structure

```core/         custom User model, roles, RBAC decorators, demo data seeder
vehicles/     vehicle registry
drivers/      driver profiles, license/safety tracking
trips/        trip lifecycle (Draft → Dispatched → Completed/Cancelled)
maintenance/  maintenance logs, auto vehicle status transitions
fueling/      fuel logs and expenses
dashboard/    KPI dashboard, filters, reports & analytics ```

## Team

Built for Odoo Hackathon by Quartz.