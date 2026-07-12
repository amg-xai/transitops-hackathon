# TransitOps — Smart Transport Operations Platform

<p align="center">
  <img src="docs/images/transitops_hero_banner.png" alt="TransitOps Banner" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/SQLite-3.0-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
  <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

---

## 🌟 Introduction

**TransitOps** is a centralized, enterprise-grade operations and fleet management platform. It streamlines vehicle management, driver tracking, trip logistics, automated maintenance workflows, and expense monitoring into one platform. With built-in **Role-Based Access Control (RBAC)**, automated state machine transitions, compliance document tracking, and real-time dashboard analytics, TransitOps ensures a safe, efficient, and cost-effective fleet environment.

### Key Capabilities
*   **Asset Management**: Register vehicles with unique identifiers, tracking load limits, status, and locations.
*   **Compliance Document Vault**: Manage RC, insurance, permits, and pollution certificates with automatic expiration alerts.
*   **Driver Operations**: Profile licenses, contact details, track safety scores, and trigger automated renewal reminders.
*   **Lifecycle Trip Logistics**: Manage trips from Draft to Dispatched, through to Completion or Cancellation.
*   **Workshop Automation**: Schedule vehicle repairs, auto-transitioning assets to downtime states and tracking total costs.
*   **Analytics Dashboard**: Visual charts tracking fleet utilization, per-vehicle fuel efficiency, operational costs, and ROI.

---

## 🏗️ Architecture & Core Components

TransitOps is built with a decoupled architecture featuring a **Django 6.0 Backend** and a **React Frontend** workspace:

```text
D:\TRANSIT\
├── core/             # Auth settings, Custom User, RBAC decorators, context processors, and seeders
├── vehicles/         # Vehicle inventory database and compliance documents vault
├── drivers/          # Driver directories, license checks, and email reminder command scripts
├── trips/            # Operations state machine (Draft ➔ Dispatched ➔ Completed/Cancelled)
├── maintenance/      # Repair logs, costs, and workshop routing rules
├── fueling/          # Fuel and expense transactions logs
├── dashboard/        # Operational KPIs aggregates, Chart.js backend configurations, and CSV export
├── folder_chrishna/  # React single page frontend workspace (Vite build system)
└── templates/        # Global layout templates and dashboard pages (Bootstrap 5)
```

---

## 📊 Analytics & Reporting

TransitOps runs calculations across logged data to output real-time intelligence tables and graphs:
*   **Fuel Efficiency**: $\text{Fuel Efficiency (km/L)} = \frac{\text{Total Actual Distance (km)}}{\text{Total Fuel Consumed (L)}}$
*   **Operational Cost**: $\text{Operational Cost} = \text{Fuel Costs} + \text{Maintenance Costs}$
*   **Return on Investment (ROI)**: $\text{ROI (\%)} = \frac{\text{Completed Trips Revenue} - \text{Operational Costs}}{\text{Vehicle Acquisition Cost}} \times 100$

<p align="center">
  <img src="docs/images/transitops_telemetry_ui.png" alt="TransitOps Telemetry" width="80%">
</p>

---

## 🔐 Role-Based Access Control (RBAC)

The system restricts CRUD views based on user roles, preventing unauthorized access through custom decorators.

| Feature Area | Fleet Manager | Driver | Safety Officer | Financial Analyst |
| :--- | :---: | :---: | :---: | :---: |
| **Vehicles (CRUD)** | ✅ Full Access | 👁️ View Only | 👁️ View Only | 👁️ View Only |
| **Vehicle Documents (Upload/Delete)**| ✅ Full Access | ❌ No Access | ❌ No Access | ❌ No Access |
| **Drivers (CRUD / Edit)** | ✅ Full Access | 👁️ View Only | ✅ Edit Profiles | 👁️ View Only |
| **Drivers (Delete)** | ✅ Full Access | ❌ No Access | ❌ No Access | ❌ No Access |
| **Trips (Create/Dispatch/Complete)** | ✅ Full Access | ✅ Execute & Log | 👁️ View Only | 👁️ View Only |
| **Maintenance Logs (Add/Close)** | ✅ Full Access | 👁️ View Only | 👁️ View Only | 👁️ View Only |
| **Fueling & Expenses (Add)** | ✅ Full Access | 👁️ View Only | ❌ No Access | ✅ Add Logs |
| **Financial Reports & CSV Export** | ✅ Full Access | ❌ No Access | ❌ No Access | ✅ Full Access |

---

## ⚙️ Automated Business Rules

*   **Weight Enforcement**: Prevents trip creation or dispatch if cargo weight exceeds the vehicle's `max_load_capacity`.
*   **Asset Locking**: Setting a trip to `dispatched` automatically updates both vehicle and driver status to `on_trip`. Completion or cancellation restores both to `available`.
*   **Safety Compliance**: Drivers with expired licenses or a `suspended` status cannot be assigned to trips.
*   **Workshop Downtime**: Creating an `active` maintenance log sets vehicle status to `in_shop`. Closing the record returns the status to `available` (unless retired).
*   **Retired Exclusions**: Permanently retired vehicles stay locked in `retired` status and cannot be returned to service.
*   **Automated Email Reminders**: A cron command polls driver license records and automatically alerts drivers via email if their license is expiring soon (within 30 days).

---

## 🚀 Quick Start

### Prerequisites
*   Python 3.12+ (Python 3.13 recommended)
*   Node.js (for React frontend)

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/amg-xai/transitops-hackathon.git
    cd transitops-hackathon
    ```

2.  **Set up Virtual Environment**:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\Activate.ps1
    # Unix/macOS:
    source venv/bin/activate
    ```

3.  **Install backend dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run Migrations**:
    ```bash
    python manage.py migrate
    ```

5.  **Seed Database (Demo Users & Fleet)**:
    ```bash
    python manage.py seed_demo
    ```

6.  **Run Development Server**:
    ```bash
    python manage.py runserver
    ```

---

## 👥 Demo Logins

All accounts share the default password: **`demo1234`**

*   **Fleet Manager**: `fleet1`
*   **Driver**: `driver1`
*   **Safety Officer**: `safety1`
*   **Financial Analyst**: `finance1`

---

## 🧪 Running tests

Execute all backend RBAC and state machine validation tests:
```bash
python manage.py test
```