import api from "./baseAPI";

const kingoService = {
  getAll: () => api.get("/kingo/all"),
  getById: (id) => api.get(`/kingo/${id}`),
  create: (data) => api.post("/kingo", data),
  // Only sends { password } — backend fills in everything else
  createSupport: (password) => api.post("/kingo/support", { password }),
  update: (id, data) => api.patch(`/kingo/${id}`, data),
  activate: (id) => api.patch(`/kingo/${id}/activate`),
  deactivate: (id) => api.patch(`/kingo/${id}/deactivate`),
  delete: (id) => api.delete(`/kingo/${id}`),
};

export default kingoService;
