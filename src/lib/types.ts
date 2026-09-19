export interface WalmartTender {
  load_no: string;
  tender_id: string;
  frt_ord_no: string;
  carrier_scac: string;
  shipper_nm: string;
  vendor_nbr: string;
  orig_city: string;
  orig_st: string;
  dc_nbr: string;
  dest_city: string;
  dest_st: string;
  dept_nbr: string;
  shp_dt: string;
  del_dt: string;
  pallet_cnt: string;
  case_cnt: string;
  wgt: string | null;
  dist_mi: string;
  hazmat_flg: string;
  mode: string;
}

export interface WalmartLoadsResponse {
  source: string;
  count: number;
  loads: WalmartTender[];
}

export type EquipmentType = "Dry Van 53'" | "Reefer 53'";

export interface ShvLoad {
  load_number: string;
  bol_number: string;
  shipper_name: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  ship_date: string;
  delivery_date: string;
  weight: number;
  equipment_type: EquipmentType;
}

export type LoadStatus = "ready" | "manual_review";

/** One row in the UI table: raw tender + sanitized result + review reasons. */
export interface SanitizedRow {
  loadNumber: string;
  raw: WalmartTender;
  status: LoadStatus;
  reasons: string[];
  cautions: string[]; // non-blocking warnings on an otherwise "ready" row (e.g. fuzzy mode match)
  shvLoad: ShvLoad | null; // null when status = manual_review
}

export type PushOutcome = "accepted" | "rejected" | "not_selected" | "skipped_manual_review";

export interface PushResultRow {
  loadNumber: string;
  outcome: PushOutcome;
  errors?: string[];
}

export interface ShvPushResponse {
  status: "ok" | "rejected";
  message: string;
  accepted: string[];
  rejected: { load_number: string; errors: string[] }[];
}
