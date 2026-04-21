import api from "./baseAPI";

const adminBillingService = {
  getAll: (params = {}) => api.get("/billing/all", { params }),

  getByLab: (labId, params = {}) => api.get(`/billing/lab/${labId}`, { params }),

  getRuns: (params = {}) => api.get("/billing/runs", { params }),

  pay: (billingId, labId) => api.post(`/billing/pay/${billingId}`, { labId }),

  generate: ({ year, month } = {}) => api.post("/billing/generate", { year, month }),

  /**
   * Update the due date of an unpaid bill.
   *
   * IMPORTANT: dueDate must be a "YYYY-MM-DD" BST calendar date string,
   * NOT a timestamp. The backend converts it to 23:59:59.999 BST (UTC stored).
   *
   * Example: "2026-05-08" → backend stores 1746723599999 (May 8 17:59:59 UTC)
   */
  updateDueDate: (billingId, dueDateBSTString) =>
    api.patch(`/billing/${billingId}/due-date`, { dueDate: dueDateBSTString }),

  retryRun: (runId) => api.post(`/billing/runs/${runId}/retry-failed`),
};

export default adminBillingService;
