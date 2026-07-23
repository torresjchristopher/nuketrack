"use client";

import { useEffect, useMemo, useState } from "react";

type Status =
  | "delivered"
  | "in_transit"
  | "pending_approval"
  | "delayed"
  | "cancelled";

type Compliance = {
  nrc_license_valid: boolean;
  dot_hazmat_certified: boolean;
  iaea_safeguards_reported: boolean;
  security_plan_approved: boolean;
  last_inspection_date: string;
};

type ManifestItem = {
  item_id: string;
  description: string;
  quantity_kg: number;
  enrichment_percent: number | null;
  serial_number: string;
};

type Shipment = {
  id: string;
  origin_facility_id: string;
  destination_facility_id: string;
  material_type: string;
  material_description: string;
  quantity_kg: number;
  container_count: number;
  container_type: string;
  status: Status;
  priority: string;
  departure_date: string;
  estimated_arrival: string;
  actual_arrival: string | null;
  carrier: string;
  tracking_number: string;
  compliance: Compliance;
  manifest: ManifestItem[];
  notes: string;
};

type Facility = {
  id: string;
  name: string;
  city: string;
  state: string;
};

type ApiData = { shipments: Shipment[]; facilities: Facility[] };

const STATUS_OPTIONS: Array<{ value: "all" | Status; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "delivered", label: "Delivered" },
  { value: "in_transit", label: "In transit" },
  { value: "pending_approval", label: "Pending approval" },
  { value: "delayed", label: "Delayed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_LABELS: Record<Status, string> = {
  delivered: "Delivered",
  in_transit: "In transit",
  pending_approval: "Pending approval",
  delayed: "Delayed",
  cancelled: "Cancelled",
};

const CHECK_LABELS: Array<[keyof Compliance, string]> = [
  ["nrc_license_valid", "NRC license"],
  ["dot_hazmat_certified", "DOT hazmat"],
  ["iaea_safeguards_reported", "IAEA safeguards"],
  ["security_plan_approved", "Security plan"],
];

function Icon({ name }: { name: "search" | "bell" | "chevron" | "arrow" | "shield" }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    bell: <><path d="M7 10a5 5 0 0 1 10 0c0 5 2 5 2 6H5c0-1 2-1 2-6Z" /><path d="M10 19h4" /></>,
    chevron: <path d="m8 10 4 4 4-4" />,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    shield: <><path d="M12 3 5 6v5c0 4.5 3 7.5 7 10 4-2.5 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="icon">{paths[name]}</svg>;
}

function formatDate(value: string | null, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatMass(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

function allChecksPass(compliance: Compliance) {
  return CHECK_LABELS.every(([key]) => compliance[key] === true);
}

export default function Home() {
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/shipments")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load shipment data.");
        return response.json();
      })
      .then((payload: ApiData) => {
        setData(payload);
        setSelectedId(payload.shipments[0]?.id ?? null);
      })
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const facilities = useMemo(
    () => new Map(data?.facilities.map((facility) => [facility.id, facility]) ?? []),
    [data],
  );
  const filtered = useMemo(
    () =>
      data?.shipments.filter((shipment) => status === "all" || shipment.status === status) ?? [],
    [data, status],
  );
  const selected =
    data?.shipments.find((shipment) => shipment.id === selectedId) ?? filtered[0] ?? null;

  const facilityName = (id: string) => facilities.get(id)?.name ?? id;
  const facilityLocation = (id: string) => {
    const facility = facilities.get(id);
    return facility ? `${facility.city}, ${facility.state}` : "Location unavailable";
  };

  const activeCount =
    data?.shipments.filter((item) =>
      ["in_transit", "pending_approval", "delayed"].includes(item.status),
    ).length ?? 0;
  const inTransitCount = data?.shipments.filter((item) => item.status === "in_transit").length ?? 0;
  const reviewCount =
    data?.shipments.filter((item) => !allChecksPass(item.compliance)).length ?? 0;
  const compliantCount =
    data?.shipments.filter((item) => allChecksPass(item.compliance)).length ?? 0;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="NukeTrack home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>NukeTrack</span>
        </a>
        <div className="facility-context">
          <span className="building" aria-hidden="true">▥</span>
          National Transport Network
          <Icon name="chevron" />
        </div>
        <nav className="utilities" aria-label="Account utilities">
          <button aria-label="Search"><Icon name="search" /></button>
          <button aria-label="Notifications" className="notification"><Icon name="bell" /></button>
          <span className="divider" />
          <span className="avatar">CT</span>
          <span className="operator"><strong>Chris Torres</strong><small>Operations lead</small></span>
          <Icon name="chevron" />
        </nav>
      </header>

      <div className={`workspace ${selected ? "has-inspector" : ""}`}>
        <section className="shipments-pane" aria-label="Shipment operations">
          <div className="page-heading">
            <p className="eyebrow">Nuclear material logistics</p>
            <h1>Shipment Operations</h1>
            <p>Real-time overview of nuclear material shipments and compliance status.</p>
          </div>

          <section className="metrics" aria-label="Shipment summary">
            <Metric label="Active shipments" value={activeCount} note="Across all routes" tone="blue" symbol="▣" />
            <Metric label="In transit" value={inTransitCount} note="Currently moving" tone="blue" symbol="→" />
            <Metric label="Review required" value={reviewCount} note={reviewCount ? "Action needed" : "No action needed"} tone="red" symbol="!" />
            <Metric label="Compliant" value={compliantCount} note={`${data?.shipments.length ?? 0} total shipments`} tone="green" symbol="✓" />
          </section>

          <div className="filter-row">
            <label>
              <span className="sr-only">Filter shipments by status</span>
              <select
                aria-label="Filter shipments by status"
                value={status}
                onChange={(event) => setStatus(event.target.value as "all" | Status)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <p><strong>{filtered.length}</strong> of {data?.shipments.length ?? 0} shipments</p>
          </div>

          {error ? (
            <div className="state-card error" role="alert">
              <strong>Shipment data could not be loaded.</strong>
              <span>{error}</span>
            </div>
          ) : !data ? (
            <div className="state-card" aria-live="polite">
              <span className="loader" />
              Loading secure shipment data…
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Shipment</th>
                    <th>Origin / destination</th>
                    <th>Material / container</th>
                    <th>Quantity</th>
                    <th>ETA</th>
                    <th>Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((shipment) => {
                    const isSelected = selected?.id === shipment.id;
                    const compliant = allChecksPass(shipment.compliance);
                    return (
                      <tr
                        key={shipment.id}
                        className={isSelected ? "selected" : ""}
                        aria-selected={isSelected}
                        tabIndex={0}
                        onClick={() => setSelectedId(shipment.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId(shipment.id);
                          }
                        }}
                      >
                        <td>
                          <span className={`status-dot ${shipment.status}`} />
                          <span className="shipment-id">{shipment.id}</span>
                          <small>{STATUS_LABELS[shipment.status]}</small>
                        </td>
                        <td>
                          <span className="route">
                            <span><strong>{facilityName(shipment.origin_facility_id)}</strong><small>{facilityLocation(shipment.origin_facility_id)}</small></span>
                            <Icon name="arrow" />
                            <span><strong>{facilityName(shipment.destination_facility_id)}</strong><small>{facilityLocation(shipment.destination_facility_id)}</small></span>
                          </span>
                        </td>
                        <td><strong>{shipment.material_type}</strong><small>{shipment.container_type}</small></td>
                        <td><strong>{formatMass(shipment.quantity_kg)} kg</strong><small>{shipment.container_count} containers</small></td>
                        <td><strong>{formatDate(shipment.estimated_arrival)}</strong><small>{shipment.priority} priority</small></td>
                        <td>
                          <span className={`compliance-chip ${compliant ? "pass" : "review"}`}>
                            <Icon name="shield" />{compliant ? "Compliant" : "Review"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!filtered.length && (
                <div className="empty">
                  <strong>No matching shipments</strong>
                  <span>Choose another status to return to the manifest.</span>
                </div>
              )}
            </div>
          )}
        </section>

        {selected && (
          <aside className="inspector" aria-label={`Details for ${selected.id}`}>
            <div className="inspector-head">
              <div>
                <span className={`status-badge ${selected.status}`}>{STATUS_LABELS[selected.status]}</span>
                <h2>{selected.id}</h2>
                <p>{selected.material_description}</p>
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close shipment details">×</button>
            </div>

            <section className="route-cards" aria-label="Route summary">
              <InfoCard label="Origin" value={facilityName(selected.origin_facility_id)} detail={facilityLocation(selected.origin_facility_id)} />
              <InfoCard label="Destination" value={facilityName(selected.destination_facility_id)} detail={facilityLocation(selected.destination_facility_id)} />
              <InfoCard label={selected.actual_arrival ? "Arrived" : "ETA"} value={formatDate(selected.actual_arrival ?? selected.estimated_arrival)} detail={selected.carrier} />
            </section>

            <section className="detail-section">
              <h3>Shipment record</h3>
              <dl className="definition-list">
                <div><dt>Tracking</dt><dd>{selected.tracking_number}</dd></div>
                <div><dt>Material</dt><dd>{selected.material_type}</dd></div>
                <div><dt>Net quantity</dt><dd>{formatMass(selected.quantity_kg)} kg</dd></div>
                <div><dt>Containers</dt><dd>{selected.container_count} × {selected.container_type}</dd></div>
                <div><dt>Departure</dt><dd>{formatDate(selected.departure_date, true)}</dd></div>
                <div><dt>Last inspection</dt><dd>{formatDate(selected.compliance.last_inspection_date, true)}</dd></div>
              </dl>
            </section>

            <section className="detail-section">
              <div className="section-heading">
                <h3>Manifest</h3>
                <span>{selected.manifest.length} line items</span>
              </div>
              <div className="manifest">
                {selected.manifest.map((item) => (
                  <div key={item.item_id}>
                    <span><strong>{item.serial_number}</strong><small>{item.description}</small></span>
                    <span><strong>{formatMass(item.quantity_kg)} kg</strong><small>{item.enrichment_percent == null ? "Enrichment N/A" : `${item.enrichment_percent}% enrichment`}</small></span>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section compliance-section">
              <div className="section-heading">
                <h3>Compliance checks</h3>
                <span className={allChecksPass(selected.compliance) ? "verified" : "attention"}>
                  {allChecksPass(selected.compliance) ? "4 / 4 verified" : "Review required"}
                </span>
              </div>
              <ul>
                {CHECK_LABELS.map(([key, label]) => (
                  <li key={key} className={selected.compliance[key] ? "passed" : "failed"}>
                    <span>{selected.compliance[key] ? "✓" : "!"}</span>{label}
                  </li>
                ))}
              </ul>
            </section>

            {selected.notes && <p className="notes"><strong>Operations note</strong>{selected.notes}</p>}
          </aside>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value, note, tone, symbol }: { label: string; value: number; note: string; tone: string; symbol: string }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
      <i className={tone} aria-hidden="true">{symbol}</i>
    </article>
  );
}

function InfoCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}
