import api from './api';

export const teacherLibraryService = {
  /**
   * Lấy danh sách tài nguyên thư viện của teacher hiện tại
   */
  async getResources(teacherId) {
    const res = await api.get(`/library_resources?teacherId=${teacherId}`);
    return res.data;
  },

  /**
   * Tạo tài nguyên thư viện mới
   */
  async createResource(data) {
    const res = await api.post('/library_resources', data);
    return res.data;
  },

  /**
   * Cập nhật tài nguyên thư viện
   */
  async updateResource(id, data) {
    const res = await api.put(`/library_resources/${id}`, data);
    return res.data;
  },

  /**
   * Xóa tài nguyên thư viện
   */
  async deleteResource(id) {
    const res = await api.delete(`/library_resources/${id}`);
    return res.data;
  }
};
