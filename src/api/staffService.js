import api from "./baseAPI";

const staffService = {
  getAll:                (labId)            => api.get(`/labs/${labId}/staff`),
  getById:               (labId, id)        => api.get(`/labs/${labId}/staff/${id}`),

  createAdmin:           (labId, data)      => api.post(`/labs/${labId}/staff/admin`, data),
  createMember:          (labId, data)      => api.post(`/labs/${labId}/staff/member`, data),
  createSupport:         (labId, data)      => api.post(`/labs/${labId}/staff/support`, data),

  update:                (labId, id, data)  => api.patch(`/labs/${labId}/staff/${id}`, data),
  updateSupportPassword: (labId, data)      => api.patch(`/labs/${labId}/staff/support`, data),

  activate:              (labId, id)        => api.patch(`/labs/${labId}/staff/${id}/activate`),
  deactivate:            (labId, id)        => api.patch(`/labs/${labId}/staff/${id}/deactivate`),

  delete:                (labId, id)        => api.delete(`/labs/${labId}/staff/${id}`),
  deleteSupport:         (labId)            => api.delete(`/labs/${labId}/staff/support`),
};

export default staffService;