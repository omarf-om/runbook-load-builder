import type { SanitizedRow } from "@/lib/types";

interface Props {
  rows: SanitizedRow[];
  selected: Set<string>;
  onToggle: (loadNumber: string) => void;
}

function StatusBadge({ row }: { row: SanitizedRow }) {
  return row.status === "ready" ? (
    <span className="badge badge-success">✅ Ready</span>
  ) : (
    <span className="badge badge-warning">⚠️ Manual review</span>
  );
}

export function LoadsTable({ rows, selected, onToggle }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Load Number</th>
            <th>Shipper</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Ship Date</th>
            <th>Delivery Date</th>
            <th>Weight</th>
            <th>Mode</th>
            <th>Status</th>
            <th>Reason</th>
            <th>SHV Payload</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.loadNumber} className={row.status === "manual_review" ? "row-review" : ""}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.has(row.loadNumber)}
                  disabled={row.status === "manual_review"}
                  onChange={() => onToggle(row.loadNumber)}
                  title={row.status === "manual_review" ? "Cannot push: needs manual review" : undefined}
                />
              </td>
              <td>{row.loadNumber}</td>
              <td>{row.raw.shipper_nm}</td>
              <td>
                {row.raw.orig_city}, {row.raw.orig_st}
              </td>
              <td>
                {row.raw.dest_city}, {row.raw.dest_st}
              </td>
              <td>{row.raw.shp_dt}</td>
              <td>{row.raw.del_dt}</td>
              <td>{row.raw.wgt ?? "—"}</td>
              <td>{row.raw.mode || "—"}</td>
              <td>
                <StatusBadge row={row} />
              </td>
              <td className="detail-cell">{row.status === "manual_review" ? row.reasons.join("; ") : ""}</td>
              <td>
                {row.shvLoad ? (
                  <details className="payload-dropdown">
                    <summary>View payload</summary>
                    <pre>{JSON.stringify(row.shvLoad, null, 2)}</pre>
                  </details>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
