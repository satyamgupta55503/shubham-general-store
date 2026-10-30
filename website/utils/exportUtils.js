/**
 * exportUtils.js — CRM Export Helpers
 * Supports: CSV download, Google Sheets URL open, Print/PDF
 * No external API needed — uses native browser capabilities.
 */

/* ── CSV Escape ── */
const escapeCSV = (val) => {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/* ── Convert array of objects → CSV string ── */
export function toCSV(rows, columns) {
  const header = columns.map(c => escapeCSV(c.label)).join(",");
  const body   = rows.map(row =>
    columns.map(c => {
      const val = typeof c.value === "function" ? c.value(row) : row[c.key];
      return escapeCSV(val);
    }).join(",")
  );
  return [header, ...body].join("\n");
}

/* ── Download CSV file ── */
export function downloadCSV(csvString, filename) {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ── Open Google Sheets with CSV data ─────────────────────────────────────────
 * Strategy: uploads CSV to a temporary data URI and opens Google Sheets import.
 * Since direct API auth is complex, we use the "open Sheets + copy CSV" approach:
 * 1. Download the CSV (user gets file)
 * 2. Open a blank Google Sheet so user can import it
 * This is the most reliable no-API approach.
 ── */
export function openInGoogleSheets(csvString, filename, sheetsId = "") {
  // Step 1: download the CSV
  downloadCSV(csvString, filename);

  // Step 2: open the Google Sheet (existing or new)
  const url = sheetsId
    ? `https://docs.google.com/spreadsheets/d/${sheetsId}/edit`
    : "https://docs.google.com/spreadsheets/create";
  window.open(url, "_blank");
}

/* ── Open in Google Docs (for proposals) ── */
export function openInGoogleDocs(text, title = "CRM Export") {
  // Download as .txt first, then open Google Docs
  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `${title}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  window.open("https://docs.google.com/document/create", "_blank");
}

/* ══════════════════════════════════════════
   QUOTATION COLUMNS
══════════════════════════════════════════ */
export const QUOTATION_COLUMNS = [
  { label: "Quotation No.",  key: "quotation_number" },
  { label: "Client",         value: r => r.client_name_snapshot || r.client?.full_name || "" },
  { label: "Project",        value: r => r.project?.title || "" },
  { label: "Status",         key: "status" },
  { label: "Subtotal (₹)",   value: r => Number(r.subtotal || 0).toFixed(2) },
  { label: "Discount (₹)",   value: r => Number(r.discount_amount || 0).toFixed(2) },
  { label: "CGST (₹)",       value: r => Number(r.cgst_amount || 0).toFixed(2) },
  { label: "SGST (₹)",       value: r => Number(r.sgst_amount || 0).toFixed(2) },
  { label: "IGST (₹)",       value: r => Number(r.igst_amount || 0).toFixed(2) },
  { label: "Grand Total (₹)",value: r => Number(r.grand_total || 0).toFixed(2) },
  { label: "Valid Until",    value: r => r.valid_until ? new Date(r.valid_until).toLocaleDateString("en-IN") : "" },
  { label: "Created At",     value: r => r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "" },
  { label: "Notes",          key: "notes" },
];

/* ══════════════════════════════════════════
   INVOICE COLUMNS
══════════════════════════════════════════ */
export const INVOICE_COLUMNS = [
  { label: "Invoice No.",     key: "invoice_number" },
  { label: "Client",          value: r => r.client_name_snapshot || "" },
  { label: "Project",         value: r => r.project?.title || "" },
  { label: "Type",            key: "invoice_type" },
  { label: "Status",          key: "status" },
  { label: "Invoice Date",    value: r => r.invoice_date ? new Date(r.invoice_date).toLocaleDateString("en-IN") : "" },
  { label: "Due Date",        value: r => r.due_date ? new Date(r.due_date).toLocaleDateString("en-IN") : "" },
  { label: "Subtotal (₹)",    value: r => Number(r.subtotal || 0).toFixed(2) },
  { label: "CGST (₹)",        value: r => Number(r.cgst_amount || 0).toFixed(2) },
  { label: "SGST (₹)",        value: r => Number(r.sgst_amount || 0).toFixed(2) },
  { label: "IGST (₹)",        value: r => Number(r.igst_amount || 0).toFixed(2) },
  { label: "Grand Total (₹)", value: r => Number(r.grand_total || 0).toFixed(2) },
  { label: "Amount Paid (₹)", value: r => Number(r.amount_paid || 0).toFixed(2) },
  { label: "Balance Due (₹)", value: r => Number((r.grand_total || 0) - (r.amount_paid || 0)).toFixed(2) },
  { label: "Place of Supply", key: "place_of_supply" },
  { label: "GSTIN",           key: "client_gstin_snapshot" },
  { label: "Notes",           key: "notes" },
];

/* ══════════════════════════════════════════
   PROPOSAL COLUMNS
══════════════════════════════════════════ */
export const PROPOSAL_COLUMNS = [
  { label: "Proposal No.",  key: "prop_number" },
  { label: "Title",         key: "title" },
  { label: "Client",        value: r => r.client_name_snapshot || r.client?.full_name || "" },
  { label: "Project",       value: r => r.project?.title || "" },
  { label: "Status",        key: "status" },
  { label: "Valid Until",   value: r => r.valid_until ? new Date(r.valid_until).toLocaleDateString("en-IN") : "" },
  { label: "Created At",    value: r => r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "" },
  { label: "Notes",         key: "notes" },
];

/* ══════════════════════════════════════════
   FOLLOW-UP COLUMNS
══════════════════════════════════════════ */
export const FOLLOWUP_COLUMNS = [
  { label: "Title",           key: "title" },
  { label: "Contact",         key: "contact_name" },
  { label: "Email",           key: "contact_email" },
  { label: "Phone",           key: "contact_phone" },
  { label: "Channel",         key: "channel" },
  { label: "Status",          key: "status" },
  { label: "Priority",        key: "priority" },
  { label: "Deal Value (₹)",  value: r => Number(r.deal_value || 0).toFixed(2) },
  { label: "Next Follow-Up",  value: r => r.follow_up_date ? new Date(r.follow_up_date).toLocaleDateString("en-IN") : "" },
  { label: "Last Contacted",  value: r => r.last_contacted ? new Date(r.last_contacted).toLocaleDateString("en-IN") : "" },
  { label: "Remarks",         key: "remarks" },
  { label: "Tags",            value: r => (r.tags || []).join("; ") },
  { label: "Created At",      value: r => r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : "" },
];

/* ── Generic export menu component data ── */
export function getExportFilename(type, ext = "csv") {
  const date = new Date().toISOString().split("T")[0];
  return `DKS_CRM_${type}_${date}.${ext}`;
}
