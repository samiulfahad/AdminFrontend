import api from "./baseAPI";

const billingService = {
  // GET all bills across all labs
  getAll: (params = {}) => api.get("/billing/all", { params }),

  // GET billing history for a single lab
  getByLab: (labId, params = {}) => api.get(`/billing/lab/${labId}`, { params }),

  // GET quick summary (unpaid bill + totals) for a lab
  getLabSummary: (labId) => api.get(`/billing/lab/${labId}/summary`),

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
