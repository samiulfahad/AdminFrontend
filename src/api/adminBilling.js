import api from "./baseAPI";

const adminBillingService = {
  getAll: (params) => api.get("/billing/all", { params }),
  getRuns: (params) => api.get("/billing/runs", { params }),
  pay: (billingId, labId) => api.post(`/billing/pay/${billingId}`, { labId: String(labId) }),
  generate: (body) => api.post("/billing/generate", body),
  retryRun: (runId) => api.post(`/billing/runs/${runId}/retry-failed`),
  updateDueDate: (billingId, dueDate) => api.patch(`/billing/${billingId}/due-date`, { dueDate }),
};

export default adminBillingService;
