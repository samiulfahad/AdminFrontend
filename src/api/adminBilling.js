import api from "./baseAPI";

const adminBillingService = {
  getAll: (params) => api.get("/billing/all", { params }),

  getByLab: (labId, params) => api.get(`/billing/lab/${labId}`, { params }),

  getRuns: (params) => api.get("/billing/runs", { params }),

  pay: (billingId, labId) => api.post(`/billing/pay/${billingId}`, { labId }),

  /**
   * @param {string} billingId
   * @param {string} dueDateStr  "YYYY-MM-DD" in BST (from <input type="date">)
   */
  updateDueDate: (billingId, dueDateStr) => api.patch(`/billing/${billingId}/due-date`, { dueDate: dueDateStr }),

  generate: (body) => api.post("/billing/generate", body),

  retryRun: (runId) => api.post(`/billing/runs/${runId}/retry-failed`),
};

export default adminBillingService;
