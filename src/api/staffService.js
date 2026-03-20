import api from "./baseAPI";

const staffService = {
  getStaff: (labId) => api.get(`/labs/${labId}/staff`),
  getStaffById: (id) => api.get(`/staff/${id}`),
  createStaff: (labId, data) => api.post(`/labs/${labId}/staff`, data),
  updateStaff: (id, data) => api.patch(`/staff/${id}`, data),
  activateStaff: (id) => api.patch(`/staff/${id}/activate`),
  deactivateStaff: (id) => api.patch(`/staff/${id}/deactivate`),
  deleteStaff: (id) => api.delete(`/staff/${id}`),
};

export default staffService;
