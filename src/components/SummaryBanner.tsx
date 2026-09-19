interface Props {
  fetchedCount: number;
  readyCount: number;
  manualReviewCount: number;
}

export function SummaryBanner({ fetchedCount, readyCount, manualReviewCount }: Props) {
  if (fetchedCount === 0) return null;

  return (
    <div className="summary-banner">
      {fetchedCount} fetched · {readyCount} ready · {manualReviewCount} need manual review
    </div>
  );
}
