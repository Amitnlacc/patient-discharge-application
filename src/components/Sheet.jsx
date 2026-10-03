import React from "react";
import { fmtDate, asText, medLine } from "../data/schema.js";

function Row({ label, children }) {
  if (!children || (typeof children === "string" && !children.trim())) return null;
  return (
    <tr>
      <td className="ds-label">{label}</td>
      <td className="ds-colon">:</td>
      <td className="ds-value">{children}</td>
    </tr>
  );
}

export function Sheet({ r, hospital }) {
  const ml = (t) => t && String(t).split("\n").map((l, i) => <div key={i}>{l}</div>);
  return (
    <div className="ds-sheet">
      <div className="ds-head">
        <div className="ds-hosp">{hospital.name}</div>
        <div className="ds-sub">{hospital.line}</div>
      </div>
      <h1 className="ds-title">Discharge Certificate</h1>

      <table className="ds-ident">
        <tbody>
          <tr>
            <td className="ds-label">Name</td><td className="ds-colon">:</td><td className="ds-value">{r.patient_name}</td>
            <td className="ds-label">Age / Gender</td><td className="ds-colon">:</td><td className="ds-value">{r.age}Y / {r.gender}</td>
          </tr>
          <tr>
            <td className="ds-label">IPD No</td><td className="ds-colon">:</td><td className="ds-value">{r.ipd_no}</td>
            <td className="ds-label">Admit Date &amp; Time</td><td className="ds-colon">:</td><td className="ds-value">{fmtDate(r.admit_date)} {r.admit_time}</td>
          </tr>
          <tr>
            <td className="ds-label">Consultant</td><td className="ds-colon">:</td><td className="ds-value">{r.consultant}</td>
            <td className="ds-label">Discharge Date</td><td className="ds-colon">:</td><td className="ds-value">{fmtDate(r.discharge_date)}</td>
          </tr>
          <tr>
            <td className="ds-label">UHID</td><td className="ds-colon">:</td><td className="ds-value">{r.uhid}</td>
            <td className="ds-label">Contact No</td><td className="ds-colon">:</td><td className="ds-value">{r.contact_no}</td>
          </tr>
          <tr>
            <td className="ds-label">Address</td><td className="ds-colon">:</td><td className="ds-value" colSpan={4}>{r.address}</td>
          </tr>
        </tbody>
      </table>

      <table className="ds-body">
        <tbody>
          <Row label="Chief Complaint">{r.chief_complaint}</Row>
          <Row label="History of Illness">{ml(r.history_of_illness)}</Row>
          <Row label="On Examination">{ml(r.on_examination)}</Row>
          <Row label="Investigation">{asText(r.investigation)}</Row>
          <Row label="Diagnosis">{r.diagnosis}</Row>
          <Row label="Treatment Type">{asText(r.treatment_type)}</Row>
          <Row label="Date of Surgery">{fmtDate(r.date_of_surgery)}</Row>
          <Row label="Procedure">{r.procedure}</Row>
          <Row label="Post Operative">{ml(r.post_operative)}</Row>
          <Row label="Anesthesia">{r.anesthesia_type ? `${r.anesthesia_type}${r.anesthetist ? `   By: ${r.anesthetist}` : ""}` : ""}</Row>
          <Row label="Treatment Details">{ml(r.treatment_details)}</Row>
          <Row label="Condition on Discharge">{asText(r.condition_on_discharge)}</Row>
        </tbody>
      </table>

      {(r.diet_advice || r.medications?.length > 0) && (
        <div className="ds-advice">
          <div className="ds-advice-h">Advice on Discharge</div>
          {r.diet_advice && <div className="ds-adv-line">– {r.diet_advice}</div>}
          {(r.medications || []).map((m, i) => <div className="ds-adv-line" key={i}>– {medLine(m)}</div>)}
        </div>
      )}

      <table className="ds-body ds-foot-table">
        <tbody>
          <Row label="Follow-up">{ml(r.follow_up)}</Row>
          <Row label="Special Note">{r.special_note}</Row>
        </tbody>
      </table>

      <div className="ds-sign">
        <div>
          <div className="ds-doc">{r.signing_doctor}</div>
          <div className="ds-reg">{r.registration_no}</div>
        </div>
        <div className="ds-mo">(Medical Officer)</div>
      </div>

      <div className="ds-consent-block">
        <p className="ds-consent">
          I have been explained about the disease, drugs, investigations and need for close follow up in the
          language best known / understood by me.
        </p>
        <p className="ds-consent-sign">Signature (Patient / Patient Party) — if patient party, state relation</p>
      </div>

      <div className="ds-runfoot">{r.patient_name} · UHID {r.uhid} · discharged {fmtDate(r.discharge_date)}</div>
    </div>
  );
}
