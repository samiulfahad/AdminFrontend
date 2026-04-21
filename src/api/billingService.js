import api from "./baseAPI";

const billingService = {
  // GET labs with unpaid bills (grouped, with month tags)
  getUnpaidLabs: (params = {}) => api.get("/billing/unpaid-labs", { params }),

  // GET full billing history for a lab by labKey
  getLabHistoryByKey: (labKey, params = {}) =>
    api.get(`/billing/lab/${encodeURIComponent(labKey)}/history`, { params }),

  // GET quick summary (unpaid bill + totals) for a lab by labKey
  getLabSummaryByKey: (labKey) => api.get(`/billing/lab/${encodeURIComponent(labKey)}/summary`),

  // GET billing run history
  getRuns: (params = {}) => api.get("/billing/runs", { params }),

  // POST mark a bill as paid
  markPaid: (billingId, labId) => api.post(`/billing/pay/${billingId}`, { labId }),

  // POST manually trigger bill generation
  generate: (data = {}) => api.post("/billing/generate", data),

  // PATCH update due date of an unpaid bill
  updateDueDate: (billingId, dueDate) => api.patch(`/billing/${billingId}/due-date`, { dueDate }),

  // POST retry failed labs from a billing run
  retryFailed: (runId) => api.post(`/billing/runs/${runId}/retry-failed`),
};

export default billingService;
