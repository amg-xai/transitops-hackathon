<div align="center">
  <br />
  <h1>TransitOps</h1>
  <p>
    <strong>Run your fleet. Not your spreadsheets.</strong>
  </p>
  <br />
</div>

---

> TransitOps gives you a single command centre for vehicles, drivers, trips, fueling, and maintenance — with business rules baked in.

## ⚡ Design Philosophy

The TransitOps frontend is engineered to be **minimal, dark, and sophisticated**. We stripped away the noise of traditional fleet dashboards in favor of a sleek, high-contrast, grain-textured aesthetic (inspired by `impeccable.style`) that feels like a modern command center.

- **Deep Dark Mode** (`#080808` base)
- **Fluid Proportions** — Adaptive layout that stretches beautifully on ultra-wide viewports.
- **Built for Operations** — No generic CRUD. Every UI element exists to streamline fleet logistics.

## 🚀 Capabilities

| Module | Description |
| :--- | :--- |
| **Fleet Management** | Register every vehicle with capacity, region and status. View the entire fleet from one list. |
| **Driver Profiles** | Track license categories. Safety scores surface at-risk drivers before they create incidents. |
| **Trip Dispatch** | Dispatch trips in seconds. Business rules block overweight loads and expired licenses automatically. |
| **Live Analytics** | Fleet utilization rates, revenue summaries, and dispatch trends — visualized clearly without noise. |

## 🛡️ Built-in Safeguards
- Cargo weight validated against vehicle max capacity before every dispatch.
- Driver license expiry checked on every trip creation — expired = blocked.
- Vehicle and driver status locked during active trips.

---

## 🛠️ Getting Started

To spin up the TransitOps frontend locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

> **Note:** The application will run at `http://localhost:5173`. The project defaults to the Landing Page view, with seamless routing to the full App Dashboard shell.

<div align="center">
  <br />
  <p>Built for efficiency. Designed for clarity.</p>
</div>
