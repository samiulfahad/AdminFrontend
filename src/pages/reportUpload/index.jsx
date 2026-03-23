import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SchemaRenderer from "./SchemaRenderer";
import Popup from "../../components/popup";
import schemaService from "../../api/schemaService";
import demoReportService from "../../api/demoReportService";
import LoadingScreen from "../../components/loadingPage";

function ReportUpload() {
  const { schemaId } = useParams();

  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState(null);

  const fetchSchema = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await schemaService.getById(schemaId);
      setSchema(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load schema.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, [schemaId]);

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      await demoReportService.save({
        schemaId,
        patientName: payload.patientName ?? "",
        patientAge: payload.patientAge ?? "",
        patientGender: payload.patientGender ?? "",
        sampleCollectionDate: payload.sampleCollectionDate ?? "",
        reportDate: payload.reportDate ?? "",
        report: payload.report, // ← just the section data, not the whole payload
      });
      setPopup({ type: "success", message: "Report submitted successfully" });
    } catch (e) {
      setPopup({ type: "error", message: e?.response?.data?.message || "Failed to submit report" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <p>{error}</p>;

  return (
    <>
      {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}
      <SchemaRenderer schema={schema} onSubmit={handleSubmit} loading={submitting} />
    </>
  );
}

export default ReportUpload;
