import type { PushResultRow, SanitizedRow } from "@/lib/types";

interface Props {
  results: Map<string, PushResultRow>;
  rows: SanitizedRow[];
  summary: { accepted: number; rejected: number; skippedManualReview: number } | null;
}

function rowFor(rows: SanitizedRow[], loadNumber: string): SanitizedRow | undefined {
  return rows.find((r) => r.loadNumber === loadNumber);
}

function outcomeLabel(outcome: PushResultRow["outcome"]): { text: string; badgeClass: string } {
  switch (outcome) {
    case "accepted":
      return { text: "✅ Accepted", badgeClass: "badge-success" };
    case "rejected":
      return { text: "❌ Rejected", badgeClass: "badge-error" };
    case "skipped_manual_review":
      return { text: "⚠️ Skipped (manual review)", badgeClass: "badge-warning" };
    case "not_selected":
      return { text: "⏭️ Not selected", badgeClass: "badge-muted" };
  }
}

export function PushResultsPanel({ results, rows, summary }: Props) {
  const pushed = [...results.values()].filter(
    (r) => r.outcome === "accepted" || r.outcome === "rejected" || r.outcome === "skipped_manual_review"
  );

  if (pushed.length === 0) return null;

  return (
    <details className="results-panel" open>
      <summary className="results-toggle">
        Push results ({pushed.length})
        {summary && (
          <span className="results-summary-inline">
            {" "}
            — {summary.accepted} accepted, {summary.rejected} rejected, {summary.skippedManualReview} skipped
          </span>
        )}
      </summary>
      <div className="results-body">
        <table className="rules-table">
          <thead>
            <tr>
              <th>Shipper</th>
              <th>Load Number</th>
              <th>Result</th>
              <th>Detail</th>
              <th>SHV Payload</th>
            </tr>
          </thead>
          <tbody>
            {pushed.map((r) => {
              const { text, badgeClass } = outcomeLabel(r.outcome);
              const row = rowFor(rows, r.loadNumber);
              return (
                <tr key={r.loadNumber}>
                  <td>{row?.raw.shipper_nm ?? "—"}</td>
                  <td>{r.loadNumber}</td>
                  <td>
                    <span className={`badge ${badgeClass}`}>{text}</span>
                  </td>
                  <td className="detail-cell">{r.errors?.join("; ") ?? ""}</td>
                  <td>
                    {row?.shvLoad ? (
                      <details className="payload-dropdown">
                        <summary>View payload</summary>
                        <pre>{JSON.stringify(row.shvLoad, null, 2)}</pre>
                      </details>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
