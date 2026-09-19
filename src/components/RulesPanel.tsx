"use client";

import { useState } from "react";

export function RulesPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rules-panel">
      <button className="rules-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? "▾" : "▸"} ℹ️ How sanitization works
      </button>
      {open && (
        <div className="rules-body">
          <table className="rules-table">
            <thead>
              <tr>
                <th>SHV field</th>
                <th>Walmart field</th>
                <th>Rule</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>load_number</td>
                <td>load_no</td>
                <td>Copy directly</td>
              </tr>
              <tr>
                <td>bol_number</td>
                <td>frt_ord_no</td>
                <td>Copy directly</td>
              </tr>
              <tr>
                <td>shipper_name</td>
                <td>shipper_nm</td>
                <td>Copy directly</td>
              </tr>
              <tr>
                <td>origin_city / origin_state</td>
                <td>orig_city / orig_st</td>
                <td>Copy directly</td>
              </tr>
              <tr>
                <td>destination_city / destination_state</td>
                <td>dest_city / dest_st</td>
                <td>Copy directly</td>
              </tr>
              <tr>
                <td>ship_date / delivery_date</td>
                <td>shp_dt / del_dt</td>
                <td>MMDDYYYY → DDMMYYYY (8-digit day/month swap)</td>
              </tr>
              <tr>
                <td>weight</td>
                <td>wgt</td>
                <td>Strip &quot;lbs&quot; and commas, parse to a whole-pound number</td>
              </tr>
              <tr>
                <td>equipment_type</td>
                <td>mode</td>
                <td>
                  AMBIENT → Dry Van 53&apos; · REFRIGERATED/FREEZER → Reefer 53&apos; · FRESH or
                  unrecognized → manual review
                </td>
              </tr>
            </tbody>
          </table>

          <p className="rules-note">
            <strong>Excluded from push (manual review):</strong> unmapped/ambiguous mode (e.g.
            &quot;Fresh&quot;), missing or unparseable weight, missing required field, or a
            malformed date. These loads can&apos;t form a valid SHV payload, so they&apos;re
            flagged with a reason instead of being sent.
          </p>
        </div>
      )}
    </div>
  );
}
