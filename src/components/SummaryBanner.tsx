interface Props {
  fetchedCount: number;
  readyCount: number;
  manualReviewCount: number;
  pushSummary: { accepted: number; rejected: number; skippedManualReview: number } | null;
}

export function SummaryBanner({ fetchedCount, readyCount, manualReviewCount, pushSummary }: Props) {
  if (fetchedCount === 0 && !pushSummary) return null;

  return (
    <div className="summary-banner">
      {!pushSummary && (
        <span>
          {fetchedCount} fetched · {readyCount} ready · {manualReviewCount} need manual review
        </span>
      )}
      {pushSummary && (
        <span>
          Push complete: <strong>{pushSummary.accepted} accepted</strong>,{" "}
          <strong>{pushSummary.rejected} rejected</strong>,{" "}
          <strong>{pushSummary.skippedManualReview} skipped (manual review)</strong>
        </span>
      )}
    </div>
  );
}
