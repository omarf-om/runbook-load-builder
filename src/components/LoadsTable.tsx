import type { PushResultRow, SanitizedRow } from "@/lib/types";

interface Props {
  rows: SanitizedRow[];
  selected: Set<string>;
  onToggle: (loadNumber: string) => void;
  results: Map<string, PushResultRow> | null;
}

function StatusBadge({ row, result }: { row: SanitizedRow; result?: PushResultRow }) {
  if (result) {
    switch (result.outcome) {
      case "accepted":
        return <span className="badge badge-success">✅ Accepted</span>;
      case "rejected":
        return <span className="badge badge-error">❌ Rejected</span>;
      case "skipped_manual_review":
        return <span className="badge badge-warning">⚠️ Manual review</span>;
      case "not_selected":
        return <span className="badge badge-muted">⏭️ Not selected</span>;
    }
  }
  return row.status === "ready" ? (
    <span className="badge badge-success">✅ Ready</span>
  ) : (
    <span className="badge badge-warning">⚠️ Manual review</span>
  );
}

export function LoadsTable({ rows, selected, onToggle, results }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Load #</th>
            <th>Shipper</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Ship Date</th>
            <th>Delivery Date</th>
            <th>Weight (lbs)</th>
            <th>Equipment</th>
            <th>Status</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const result = results?.get(row.loadNumber);
            const detail =
              result?.errors?.join("; ") ?? (row.status === "manual_review" ? row.reasons.join("; ") : "");
            return (
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
                <td>
                  {row.shvLoad?.ship_date ?? "—"}
                  {row.shvLoad && <div className="raw-sub">was {row.raw.shp_dt}</div>}
                </td>
                <td>
                  {row.shvLoad?.delivery_date ?? "—"}
                  {row.shvLoad && <div className="raw-sub">was {row.raw.del_dt}</div>}
                </td>
                <td>
                  {row.shvLoad?.weight ?? "—"}
                  {row.shvLoad && <div className="raw-sub">was {row.raw.wgt ?? "null"}</div>}
                </td>
                <td>
                  {row.shvLoad?.equipment_type ?? "—"}
                  <div className="raw-sub">mode: {row.raw.mode || "—"}</div>
                </td>
                <td>
                  <StatusBadge row={row} result={result} />
                </td>
                <td className="detail-cell">{detail}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
