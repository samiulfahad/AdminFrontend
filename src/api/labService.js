import api from "./baseAPI";

const labService = {
  getStats:         ()                                            => api.get("/labs/stats"),
  getLabs:          ({ page = 1, limit = 10, labID = "" } = {}) => {
    const params = { page, limit };
    if (labID) params.labID = labID;
    return api.get("/labs/all", { params });
  },
  getLabById:       (id)           => api.get(`/labs/${id}`),
  createLab:        (data)         => api.post("/labs", data),
  updateLab:        (id, data)     => api.patch(`/labs/${id}`, data),
  updateLabInfo:    (id, data)     => api.patch(`/labs/${id}/info`, data),
  updateLabContact: (id, contact)  => api.patch(`/labs/${id}/contact`, { contact }),
  updateLabBilling: (id, billing)  => api.patch(`/labs/${id}/billing`, { billing }),
  activateLab:      (id)           => api.patch(`/labs/${id}/activate`),
  deactivateLab:    (id)           => api.patch(`/labs/${id}/deactivate`),
  deleteLab:        (id)           => api.delete(`/labs/${id}`),
};

export default labService;