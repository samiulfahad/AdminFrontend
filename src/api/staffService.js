import api from "./baseAPI";

const staffService = {
  // list all (returns both staff and admins, excludes supportAdmin)
  getAll:           (labId)       => api.get(`/labs/${labId}/staff`),
  getById:          (labId, id)   => api.get(`/labs/${labId}/staff/${id}`),

  // role-specific create
  createAdmin:      (labId, data) => api.post(`/labs/${labId}/staff/admin`, data),
  createMember:     (labId, data) => api.post(`/labs/${labId}/staff/member`, data),
  createSupport:    (labId, data) => api.post(`/labs/${labId}/staff/support`, data),

  // update / toggle / delete (all lab-scoped)
  update:           (labId, id, data) => api.patch(`/labs/${labId}/staff/${id}`, data),
  activate:         (labId, id)       => api.patch(`/labs/${labId}/staff/${id}/activate`),
  deactivate:       (labId, id)       => api.patch(`/labs/${labId}/staff/${id}/deactivate`),
  delete:           (labId, id)       => api.delete(`/labs/${labId}/staff/${id}`),
};

export default staffService;