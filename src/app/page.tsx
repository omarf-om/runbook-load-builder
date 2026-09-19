"use client";

import { useState } from "react";
import { WalmartLogo, ShvLogo } from "@/components/Logos";
import { LoadsTable } from "@/components/LoadsTable";
import { SummaryBanner } from "@/components/SummaryBanner";
import { CANDIDATE_EMAIL } from "@/lib/config";
import type { PushResultRow, SanitizedRow } from "@/lib/types";

interface PushSummary {
  accepted: number;
  rejected: number;
  skippedManualReview: number;
  notSelected: number;
}

export default function Home() {
  const [rows, setRows] = useState<SanitizedRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Map<string, PushResultRow> | null>(null);
  const [pushSummary, setPushSummary] = useState<PushSummary | null>(null);
  const [fetching, setFetching] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readyRows = rows.filter((r) => r.status === "ready");
  const manualReviewRows = rows.filter((r) => r.status === "manual_review");

  async function handleFetch() {
    setFetching(true);
    setError(null);
    setResults(null);
    setPushSummary(null);
    try {
      const res = await fetch("/api/fetch-loads");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch loads.");
      const fetchedRows: SanitizedRow[] = data.rows;
      setRows(fetchedRows);
      setSelected(new Set(fetchedRows.filter((r) => r.status === "ready").map((r) => r.loadNumber)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch loads.");
    } finally {
      setFetching(false);
    }
  }

  async function handlePush() {
    if (selected.size === 0) return;
    setPushing(true);
    setError(null);
    try {
      const res = await fetch("/api/sanitize-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loadNumbers: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to push loads.");
      setRows(data.rows);
      setResults(new Map(data.results.map((r: PushResultRow) => [r.loadNumber, r])));
      setPushSummary(data.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to push loads.");
    } finally {
      setPushing(false);
    }
  }

  function toggleRow(loadNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(loadNumber)) next.delete(loadNumber);
      else next.add(loadNumber);
      return next;
    });
  }

  function selectAllReady() {
    setSelected(new Set(readyRows.map((r) => r.loadNumber)));
  }

  function selectNone() {
    setSelected(new Set());
  }

  return (
    <div className="page">
      <header className="header">
        <WalmartLogo className="logo" />
        <span className="arrow">→</span>
        <ShvLogo className="logo" />
      </header>

      <p className="subtitle">Walmart Freight Tenders → SHV TMS Load Builder</p>

      <div className="email-row">
        <label>Account email (hardcoded)</label>
        <input type="text" value={CANDIDATE_EMAIL} readOnly />
      </div>

      <div className="button-row">
        <button onClick={handleFetch} disabled={fetching}>
          {fetching ? "Fetching…" : "📦 Fetch Loads"}
        </button>
        <button onClick={handlePush} disabled={pushing || selected.size === 0}>
          {pushing ? "Pushing…" : "🧼🚀 Sanitize & Push"}
        </button>
        {rows.length > 0 && (
          <>
            <button className="link-button" onClick={selectAllReady}>
              Select all ready
            </button>
            <button className="link-button" onClick={selectNone}>
              Select none
            </button>
          </>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <SummaryBanner
        fetchedCount={rows.length}
        readyCount={readyRows.length}
        manualReviewCount={manualReviewRows.length}
        pushSummary={pushSummary}
      />

      {rows.length > 0 && (
        <LoadsTable rows={rows} selected={selected} onToggle={toggleRow} results={results} />
      )}
    </div>
  );
}
