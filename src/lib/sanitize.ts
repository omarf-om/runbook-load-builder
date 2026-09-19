import type { EquipmentType, SanitizedRow, ShvLoad, WalmartTender } from "./types";

const STRING_FIELD_MAX_LEN = 200;

/** Walmart ships dates as 8-digit MMDDYYYY; SHV requires 8-digit DDMMYYYY. */
function convertDate(mmddyyyy: string): string | null {
  const digitsOnly = mmddyyyy.trim();
  if (!/^\d{8}$/.test(digitsOnly)) return null;
  const mm = digitsOnly.slice(0, 2);
  const dd = digitsOnly.slice(2, 4);
  const yyyy = digitsOnly.slice(4, 8);
  return `${dd}${mm}${yyyy}`;
}

/** Strips "lbs", commas, and whitespace from Walmart's weight string; returns whole-pound number. */
function parseWeight(wgt: string | null): number | null {
  if (wgt == null) return null;
  const cleaned = wgt.replace(/,/g, "").replace(/lbs?/gi, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

const KNOWN_MODES = ["AMBIENT", "REFRIGERATED", "FREEZER", "FRESH"];

/**
 * Ambient -> Dry Van 53', Refrigerated/Freezer -> Reefer 53', anything else -> null (manual review).
 * Real tender data can include vendor-prefixed/padded codes (e.g. " wmt freezer "), so this
 * matches by keyword rather than exact equality. "Fresh" and unrecognized modes stay ambiguous
 * per the walkthrough — they need a temperature range from Walmart before a load can be built.
 *
 * `exact` reports whether the raw value matched a known mode word-for-word; a keyword match on
 * a non-exact value (e.g. "wmt freezer") still resolves an equipment type, but is surfaced as a
 * caution rather than pushed silently, since we can't be certain the extra text is harmless.
 */
function mapEquipmentType(mode: string): { equipmentType: EquipmentType | null; exact: boolean } {
  const normalized = mode.trim().toUpperCase();
  const exact = KNOWN_MODES.includes(normalized);
  if (normalized.includes("FRESH")) return { equipmentType: null, exact };
  if (normalized.includes("AMBIENT")) return { equipmentType: "Dry Van 53'", exact };
  if (normalized.includes("REFRIGERATED") || normalized.includes("FREEZER")) {
    return { equipmentType: "Reefer 53'", exact };
  }
  return { equipmentType: null, exact };
}

function trimField(value: string): string {
  return value.trim().slice(0, STRING_FIELD_MAX_LEN);
}

function isBlank(value: string): boolean {
  return value.trim() === "";
}

/**
 * Applies the Walmart -> SHV field mapping and business rules to one tender.
 * Returns status "ready" with a populated shvLoad, or "manual_review" with reasons
 * and a null shvLoad when the record cannot be safely built.
 */
export function sanitizeTender(raw: WalmartTender): SanitizedRow {
  const reasons: string[] = [];

  const requiredStrings: Record<string, string> = {
    load_no: raw.load_no ?? "",
    frt_ord_no: raw.frt_ord_no ?? "",
    shipper_nm: raw.shipper_nm ?? "",
    orig_city: raw.orig_city ?? "",
    orig_st: raw.orig_st ?? "",
    dest_city: raw.dest_city ?? "",
    dest_st: raw.dest_st ?? "",
  };
  for (const [field, value] of Object.entries(requiredStrings)) {
    if (isBlank(value)) reasons.push(`Missing required field: ${field}`);
  }

  const shipDate = raw.shp_dt ? convertDate(raw.shp_dt) : null;
  if (!shipDate) reasons.push(`Malformed ship date: "${raw.shp_dt}"`);

  const deliveryDate = raw.del_dt ? convertDate(raw.del_dt) : null;
  if (!deliveryDate) reasons.push(`Malformed delivery date: "${raw.del_dt}"`);

  const weight = parseWeight(raw.wgt);
  if (weight == null) reasons.push(`Missing or unparseable weight: "${raw.wgt}"`);

  const { equipmentType, exact: modeIsExact } = mapEquipmentType(raw.mode ?? "");
  if (!equipmentType) {
    reasons.push(
      `Unrecognized or ambiguous mode "${raw.mode}" — contact Walmart for temperature range.`
    );
  }

  const cautions: string[] = [];
  if (equipmentType && !modeIsExact) {
    cautions.push(
      `Mode "${raw.mode}" doesn't exactly match a known value — mapped to ${equipmentType} by keyword match. Should be checked.`
    );
  }

  const loadNumber = raw.load_no ?? "";

  if (reasons.length > 0) {
    return { loadNumber, raw, status: "manual_review", reasons, cautions, shvLoad: null };
  }

  const shvLoad: ShvLoad = {
    load_number: trimField(requiredStrings.load_no),
    bol_number: trimField(requiredStrings.frt_ord_no),
    shipper_name: trimField(requiredStrings.shipper_nm),
    origin_city: trimField(requiredStrings.orig_city),
    origin_state: trimField(requiredStrings.orig_st),
    destination_city: trimField(requiredStrings.dest_city),
    destination_state: trimField(requiredStrings.dest_st),
    ship_date: shipDate as string,
    delivery_date: deliveryDate as string,
    weight: weight as number,
    equipment_type: equipmentType as EquipmentType,
  };

  return { loadNumber, raw, status: "ready", reasons: [], cautions, shvLoad };
}

export function sanitizeTenders(raws: WalmartTender[]): SanitizedRow[] {
  return raws.map(sanitizeTender);
}
