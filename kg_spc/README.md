TransitOps Backend
=================

Project purpose
---------------
Django REST backend for the TransitOps transport operations platform.

Key modules
-----------
- core: shared API/auth utilities
- drivers: driver management
- vehicles: vehicle registry
- trips: trip lifecycle and dispatching
- maintenance: maintenance workflow
- fueling: fuel and expense tracking
- dashboard: analytics and KPI endpoints

Run locally
-----------
1. Install dependencies: python -m pip install -r requirements.txt
2. Apply migrations: python manage.py migrate
3. Start server: python manage.py runserver 0.0.0.0:8000

Notes
-----
- The frontend is handled separately.
- This repository contains only the backend service.
