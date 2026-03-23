import api from "./baseAPI";

const demoReportService = {
  getById: (id) => api.get(`/demo-report/${id}`),
  save: (data) => api.post("/demo-report", data), // creates or replaces by schemaId
  delete: (id) => api.delete(`/demo-report/${id}`),
  getBySchemaId: (schemaId) => api.get(`/demo-report/${schemaId}`),
  
};

export default demoReportService;