export const sheetCSS = `
.ds-sheet{background:#fff;color:#111;padding:24mm 18mm;font-family:Georgia,'Times New Roman',serif;font-size:11.5pt;line-height:1.45;max-width:210mm;margin:0 auto}
.ds-head{text-align:center;margin-bottom:14px}
.ds-hosp{font-size:15pt;font-weight:700;letter-spacing:.4px}
.ds-sub{font-size:9.5pt;color:#444;margin-top:2px}
.ds-title{font-size:16pt;font-weight:700;margin:0 0 10px;padding-bottom:6px;border-bottom:2px solid #111}
.ds-ident{width:100%;border-collapse:collapse;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #111}
.ds-body{width:100%;border-collapse:collapse}
.ds-label{vertical-align:top;padding:3px 6px 3px 0;font-weight:700;white-space:nowrap;font-size:11pt}
.ds-colon{vertical-align:top;padding:3px 8px 3px 0;width:6px}
.ds-value{vertical-align:top;padding:3px 14px 3px 0}
.ds-advice{margin-top:14px}
.ds-advice-h{font-weight:700;margin-bottom:5px;font-size:11.5pt}
.ds-adv-line{padding:1.5px 0}
.ds-foot-table{margin-top:14px}
.ds-sign{display:flex;justify-content:space-between;align-items:flex-end;margin-top:42px}
.ds-doc{font-weight:700}
.ds-reg{font-size:10pt}
.ds-mo{font-size:10pt}
.ds-consent{margin-top:34px;font-size:10pt}
.ds-consent-sign{margin-top:22px;font-weight:700;font-size:10pt}
.ds-runfoot{display:none}

@media print{
  body *{visibility:hidden!important}
  #print-root,#print-root *{visibility:visible!important}
  #print-root{position:absolute;inset:0;width:100%}
  .ds-sheet{padding:0 0 14mm;box-shadow:none;max-width:none}
  .ds-ident,.ds-advice,.ds-sign,.ds-consent-block{break-inside:avoid;page-break-inside:avoid}
  .ds-body tr,.ds-adv-line{break-inside:avoid;page-break-inside:avoid}
  .ds-advice-h,.ds-title,.ds-head{break-after:avoid;page-break-after:avoid}
  .ds-value{orphans:3;widows:3}
  .ds-runfoot{display:block;position:fixed;bottom:0;left:0;right:0;
    border-top:.5pt solid #999;padding-top:3px;font-size:8.5pt;color:#444;text-align:center}
  @page{size:A4;margin:14mm 14mm 18mm}
}`;

export function downloadDoc(filename, innerHTML) {
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>Discharge Certificate</title><style>${sheetCSS}
@page{size:A4;margin:14mm}</style></head><body>${innerHTML}</body></html>`;
  const blob = new Blob(["\ufeff", doc], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
