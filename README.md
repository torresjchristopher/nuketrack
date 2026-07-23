# NukeTrack

NukeTrack is a responsive nuclear-material shipment operations dashboard. It
loads the supplied shipment, facility, manifest, and compliance records through
an application API and presents them as a filterable operational manifest.

## Features

- Shipment overview with live summary metrics
- Status filtering across all five shipment states
- Facility-aware origin and destination routes
- Responsive desktop, tablet, and mobile layouts
- Keyboard-accessible shipment selection
- Shipment detail inspector with:
  - route and carrier information
  - manifest line items
  - facility names and locations
  - all four compliance checks
  - operations notes
- Loading, empty, and API error states

## Technical approach

- React 19 and TypeScript
- Vinext / Vite full-stack runtime
- Server API route at `/api/shipments`
- Source data in `data/db.json`
- Accessible semantic table, controls, focus states, and reduced-motion support

## Local development

Prerequisite: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Then open the local URL printed by the development server.

## Verification

```bash
npm run lint
npm test
```

The production build emits a Cloudflare-compatible server entry point and
validates the hosted artifact before deployment.

## Product scope

The implementation intentionally completes the requested core shipment view
and one extension: the clickable detail inspector. It does not dilute that
scope with unrelated secondary-filter or visualization features.
