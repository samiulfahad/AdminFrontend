import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, RotateCcw } from "lucide-react";
import SchemaRenderer from "./SchemaRenderer";
import schemaService from "../../services/schemaService";
import reportService from "../../services/reportService";
import LoadingScreen from "../../components/loadingPage";
import Popup from "../../components/popup/Popup";

/**
 * RenderSchemaPage
 *
 * Supports two modes:
 *
 * 1. UPLOAD / CREATE mode (default)
 *    – Renders a blank form for the schema.
 *    – `invoice` prop provides patient context (optional).
 *    – Calls reportService.addReport(payload) on submit.
 *
 * 2. EDIT mode
 *    – Activated by passing `existingReport` prop (the full saved report object)
 *      AND `reportId` (the MongoDB _id string of that report).
 *    – OR by including `reportId` in the URL params (/:schemaId/:reportId).
 *    – Pre-fills every field from existingReport.
 *    – Changed fields are highlighted in purple.
 *    – Calls reportService.updateReport(reportId, payload) on submit.
 *
 * Props:
 *   invoice        {object?}  – patient/invoice context
 *   existingReport {object?}  – pre-populated report data (activates edit mode)
 *   reportId       {string?}  – _id of the existing report (required for edit mode)
 */
export default function RenderSchemaPage({ invoice, existingReport: existingReportProp, reportId: reportIdProp }) {
  const { schemaId, reportId: reportIdParam } = useParams();

  const [schema, setSchema] = useState(null);
  const [loadingSchema, setLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState(null);

  // When edit mode is triggered by URL param (/:schemaId/:reportId),
  // we also need to fetch the existing report if it wasn't passed as a prop.
  const [existingReport, setExistingReport] = useState(existingReportProp ?? null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState(null);

  // Resolve IDs — props take priority over URL params
  const reportId = reportIdProp ?? reportIdParam ?? null;
  const resolvedSchemaId = invoice?.tests?.find((t) => t.schemaId)?.schemaId ?? schemaId;

  const isEditMode = Boolean(existingReport);
  const loading = loadingSchema || loadingReport;

  // ── Fetch schema ──────────────────────────────────────────────────────────
  const fetchSchema = async () => {
    if (!resolvedSchemaId) {
      setSchemaError("No schema ID available.");
      setLoadingSchema(false);
      return;
    }
    setLoadingSchema(true);
    setSchemaError(null);
    try {
      const response = await schemaService.getById(resolvedSchemaId);
      setSchema(response.data);
    } catch (e) {
      setSchemaError(e?.response?.data?.message || e?.message || "Failed to load schema.");
    } finally {
      setLoadingSchema(false);
    }
  };

  // ── Fetch existing report (only needed when reportId is from URL param) ──
  const fetchReport = async () => {
    if (!reportId || existingReportProp) return; // skip if passed as prop
    setLoadingReport(true);
    setReportError(null);
    try {
      const response = await reportService.getById(reportId);
      setExistingReport(response.data);
    } catch (e) {
      setReportError(e?.response?.data?.message || e?.message || "Failed to load report.");
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, [resolvedSchemaId]);

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  // Keep in sync if parent passes a new existingReport prop
  useEffect(() => {
    if (existingReportProp !== undefined) setExistingReport(existingReportProp);
  }, [existingReportProp]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSubmit = async (payload) => {
    console.group(`📋 Lab Report Submitted: ${payload.name}`);
    console.log("Payload:", payload);
    console.groupEnd();

    try {
      setSubmitting(true);
      await reportService.addReport(payload);
      setPopup({ type: "success", message: "Report submitted successfully" });
    } catch (e) {
      setPopup({ type: "error", message: e?.response?.data?.message || "Could not submit report" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    if (!reportId) {
      setPopup({ type: "error", message: "Report ID is missing — cannot update." });
      return;
    }

    console.group(`✏️ Lab Report Updated: ${payload.name}`);
    console.log("Report ID:", reportId);
    console.log("Payload:", payload);
    console.groupEnd();

    try {
      setSubmitting(true);
      await reportService.updateReport(reportId, payload);
      // Optimistically refresh the local existingReport so the diff resets
      setExistingReport(payload);
      setPopup({ type: "success", message: "Report updated successfully" });
    } catch (e) {
      setPopup({ type: "error", message: e?.response?.data?.message || "Could not update report" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading spinner ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "2.5px solid #e8a020",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 0.75s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#9ea5b8", letterSpacing: "0.05em" }}>
            {loadingReport ? "Loading report…" : "Loading schema…"}
          </span>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  const error = schemaError || reportError;
  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            textAlign: "center",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#fdf0f0",
              border: "1.5px solid rgba(214,58,58,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle style={{ width: 22, height: 22, color: "#d63a3a" }} />
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#0b0f1a",
                marginBottom: 4,
              }}
            >
              {schemaError ? "Failed to load schema" : "Failed to load report"}
            </p>
            <p style={{ fontSize: 13, color: "#7a82a0" }}>{error}</p>
          </div>
          <button
            onClick={() => {
              if (schemaError) fetchSchema();
              else fetchReport();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 20px",
              background: "#0b0f1a",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              fontFamily: "'Syne', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(11,15,26,0.18)",
            }}
          >
            <RotateCcw style={{ width: 13, height: 13 }} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {submitting && <LoadingScreen />}
      {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}
      <SchemaRenderer
        schema={schema}
        invoice={invoice ?? null}
        onSubmit={handleSubmit}
        onUpdate={handleUpdate}
        loading={submitting}
        existingReport={existingReport}
      />
    </div>
  );
}
