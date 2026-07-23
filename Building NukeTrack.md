# Building NukeTrack

Use your own editor, your own workflow. AI assistants are allowed. Copilot, ChatGPT, Claude, whatever you'd use on a real workday. Ask us questions anytime.

## Setup

Spin up a **React + TypeScript** app however you prefer. We recommend **pnpm** and **Vite** but use whatever you're comfortable with. For reference:

```bash
pnpm create vite@latest nuketrack -- --template react-ts
cd nuketrack
pnpm install
pnpm dev
```

That's your starting point. The rest is up to you.

---

## The Data

We're sending you a `db.json` file with shipment, facility, material, and compliance data. The data should be served from an API and fetched by your frontend.

---

## The Request

Your company tracks nuclear material shipments. The data includes origins, destinations, statuses, material types, and compliance info.

**Build a shipments view.** Fetch the shipments, display them, and let the user filter by status.

That's the core. If you finish early, pick **one**:

- Add a detail panel when a shipment is clicked (manifest, compliance checks, facility names)
- Add a second filter (material type, priority, or text search)
- Visual indicators for compliance gaps (shipments where not all four checks are green)

Don't try to do all three. One finished thing beats three half-finished things.

---

## Data Shape (Quick Reference)

Each shipment looks like:

```json
{
  "id": "SHP-001",
  "origin_facility_id": "FAC-001",
  "destination_facility_id": "FAC-003",
  "material_type": "UF6",
  "material_description": "Uranium Hexafluoride - Enrichment Feedstock",
  "quantity_kg": 4500.0,
  "container_count": 12,
  "status": "delivered",
  "priority": "critical",
  "departure_date": "2025-11-15T08:00:00Z",
  "estimated_arrival": "2025-11-22T14:00:00Z",
  "actual_arrival": "2025-11-22T11:30:00Z",
  "carrier": "Nuclear Transport Solutions",
  "compliance": {
    "nrc_license_valid": true,
    "dot_hazmat_certified": true,
    "iaea_safeguards_reported": true,
    "security_plan_approved": true
  },
  "manifest": [
    {
      "description": "UF6 in 48Y Cylinder",
      "quantity_kg": 375.0,
      "enrichment_percent": 4.95,
      "serial_number": "CYL-48Y-20251115-001"
    }
  ],
  "notes": "Routine feedstock delivery."
}
```

**Other resources in the data:**

```
facilities       - facility names, locations, contacts
materials        - material type reference data
compliance_events - inspections, audits, incidents
```

Statuses in the data: `delivered`, `in_transit`, `pending_approval`, `delayed`, `cancelled`
