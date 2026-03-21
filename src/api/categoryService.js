import api from "./baseAPI";

const categoryService = {
  getAll:  ()         => api.get("/categories"),
  getById: (id)       => api.get(`/categories/${id}`),
  create:  (data)     => api.post("/categories", data),
  update:  (id, data) => api.patch(`/categories/${id}`, data),
  delete:  (id)       => api.delete(`/categories/${id}`),
};

export default categoryService;