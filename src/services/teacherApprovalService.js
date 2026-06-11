import axios from 'axios';

const API_URL = 'http://localhost:9999';

export const teacherApprovalService = {
  getApprovalRequests: async (teacherId) => {
    const response = await axios.get(`${API_URL}/approvalRequests?teacherId=${teacherId}`);
    return response.data;
  }
};
