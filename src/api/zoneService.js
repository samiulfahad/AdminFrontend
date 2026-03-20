import api from "./baseAPI";

const zoneService = {
  getZones: () => api.get("/zones/all"),
  getZoneById: (id) => api.get(`/zones/${id}`),
  createZone: (data) => api.post("/zones", data),
  updateZone: (id, data) => api.patch(`/zones/${id}`, data),
  deleteZone: (id) => api.delete(`/zones/${id}`),
};

export default zoneService;
