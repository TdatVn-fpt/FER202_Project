import axios from 'axios';
import { normalizeTest } from '../utils/testModel';

const API_URL = 'http://localhost:9999';

// EARS[Ubiquitous]: The service shall perform REST API CRUD operations for practice tests linked to courses
export const teacherTestService = {
  getTests: async (teacherId) => {
    const response = await axios.get(`${API_URL}/tests`);
    return response.data
      .filter((test) => !teacherId || test.teacherId === teacherId)
      .map(normalizeTest);
  },
  getTestsByCourse: async (courseId) => {
    const response = await axios.get(`${API_URL}/tests?courseId=${courseId}`);
    return response.data.map(normalizeTest);
  },
  getTestById: async (id) => {
    const response = await axios.get(`${API_URL}/tests/${id}`);
    return normalizeTest(response.data);
  },
  createTest: async (testData) => {
    const response = await axios.post(`${API_URL}/tests`, testData);
    return response.data;
  },
  updateTest: async (id, testData) => {
    const response = await axios.patch(`${API_URL}/tests/${id}`, testData);
    return response.data;
  },
  deleteTest: async (id) => {
    const response = await axios.delete(`${API_URL}/tests/${id}`);
    return response.data;
  }
};
