import axios from 'axios';
import { getCurrentUser } from './authService';

const API_URL = 'http://localhost:9999';

// ===== T006: ADMIN AUTH CHECK MIDDLEWARE =====

/**
 * requireAdminAuth — Guard function cho mọi hành động ghi của Admin.
 *
 * EARS[State-driven]: WHILE a user is NOT authenticated as admin,
 *   THE system SHALL throw an AuthorizationError và ngăn chặn mọi API call.
 *
 * EARS[Unwanted]: WHERE role trong localStorage KHÔNG phải 'admin',
 *   THE system SHALL throw error với message rõ ràng.
 *
 * @returns {{ adminId: string, adminName: string }} — Thông tin admin đã xác thực
 * @throws {Error} — Nếu chưa đăng nhập hoặc không phải admin
 */
export function requireAdminAuth() {
  // EARS[State-driven]: THE system SHALL read the current session from localStorage
  const user = getCurrentUser();

  // EARS[Unwanted]: WHERE user session does not exist, THE system SHALL block access
  if (!user) {
    throw new Error('UNAUTHORIZED: Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  // EARS[Unwanted]: WHERE user role is not admin, THE system SHALL block access
  if (user.role !== 'admin') {
    throw new Error(`FORBIDDEN: Tài khoản "${user.email}" (role: ${user.role}) không có quyền Admin.`);
  }

  return { adminId: user.id, adminName: user.name || user.fullName || user.email };
}

// ===== USER MANAGEMENT =====

// EARS[Event]: WHEN Admin fetches users list, THE system SHALL support filtering by role/status/q
export const getUsers = async (params) => {
  const response = await axios.get(`${API_URL}/users`, { params });
  return response;
};

// EARS[Event]: WHEN Admin changes a user's role, THE system SHALL update users.role in db
export const updateUserRole = async (userId, newRole) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.patch(`${API_URL}/users/${userId}`, { role: newRole });
  return response.data;
};

// EARS[Event]: WHEN Admin changes a user's status, THE system SHALL update users.status
export const updateUserStatus = async (userId, newStatus, lockedUntil = null) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const payload = { status: newStatus };
  if (lockedUntil !== null) payload.lockedUntil = lockedUntil;
  const response = await axios.patch(`${API_URL}/users/${userId}`, payload);
  return response.data;
};

// EARS[Event]: WHEN Admin deletes a user, THE system SHALL remove them from the database
export const deleteUser = async (userId) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.delete(`${API_URL}/users/${userId}`);
  return response.data;
};

// ===== COURSE MANAGEMENT =====

// EARS[Event]: WHEN Admin fetches courses list, THE system SHALL support filtering
export const getCourses = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/courses`, { params });
    return response.data;
  } catch (error) {
    return [];
  }
};

// EARS[Event]: WHEN Admin updates a course, THE system SHALL patch the course record
export const updateCourse = async (courseId, data) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.patch(`${API_URL}/courses/${courseId}`, data);
  return response.data;
};

// EARS[Event]: WHEN Admin deletes a course, THE system SHALL remove it permanently
export const deleteCourse = async (courseId) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.delete(`${API_URL}/courses/${courseId}`);
  return response.data;
};

// ===== LESSON MANAGEMENT =====

// EARS[Event]: WHEN Admin fetches lessons list, THE system SHALL support filtering
export const getLessons = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/lessons`, { params });
    return response.data;
  } catch (error) {
    return [];
  }
};

// EARS[Event]: WHEN Admin updates a lesson, THE system SHALL patch the lesson record
export const updateLesson = async (lessonId, data) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.patch(`${API_URL}/lessons/${lessonId}`, data);
  return response.data;
};

// EARS[Event]: WHEN Admin deletes a lesson, THE system SHALL remove it permanently
export const deleteLesson = async (lessonId) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.delete(`${API_URL}/lessons/${lessonId}`);
  return response.data;
};

// ===== TEST MANAGEMENT =====

// EARS[Event]: WHEN Admin fetches tests list, THE system SHALL support filtering
export const getTests = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/tests`, { params });
    return response.data;
  } catch (error) {
    return [];
  }
};

// EARS[Event]: WHEN Admin updates a test, THE system SHALL patch the test record
export const updateTest = async (testId, data) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.patch(`${API_URL}/tests/${testId}`, data);
  return response.data;
};

// EARS[Event]: WHEN Admin deletes a test, THE system SHALL remove it permanently
export const deleteTest = async (testId) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.delete(`${API_URL}/tests/${testId}`);
  return response.data;
};

// ===== APPROVAL REQUESTS =====

// EARS[Event]: WHEN Admin fetches approval queue, THE system SHALL return pending items
export const getApprovalRequests = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/approvalRequests`, { params });
    return response.data;
  } catch (error) {
    return [];
  }
};

// EARS[Event]: WHEN Admin approves a request, THE system SHALL set status to 'approved'
export const approveRequest = async (requestId, targetType, targetId) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.patch(`${API_URL}/approvalRequests/${requestId}`, { status: 'approved' });
  
  if (targetType === 'course' && targetId) {
    await axios.patch(`${API_URL}/courses/${targetId}`, { status: 'approved' });
  }
  
  return response.data;
};

// EARS[Event]: WHEN Admin rejects a request, THE system SHALL set status to 'rejected' with reason
export const rejectRequest = async (requestId, targetType, targetId, adminId, reason) => {
  // T006: Kiểm tra quyền Admin trước khi thực hiện thay đổi
  requireAdminAuth();
  const response = await axios.patch(`${API_URL}/approvalRequests/${requestId}`, { status: 'rejected', reason });
  
  if (targetType === 'course' && targetId) {
    await axios.patch(`${API_URL}/courses/${targetId}`, { status: 'rejected' });
  }

  return response.data;
};

// ===== AUDIT LOGS =====

// EARS[Event]: WHEN Admin fetches audit logs, THE system SHALL support filtering by action/targetType
export const getAuditLogs = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/auditLogs`, { params });
    return response.data;
  } catch (error) {
    return [];
  }
};

// ===== TRANSACTIONS =====

// EARS[Ubiquitous]: THE system SHALL allow Admin to view all payment transactions (read-only)
export const getTransactions = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/transactions`, { params });
    return response.data;
  } catch (error) {
    return [];
  }
};

// EARS[Event]: WHEN Admin updates a transaction, THE system SHALL patch the transaction record
export const updateTransaction = async (transactionId, data) => {
  requireAdminAuth();
  const response = await axios.patch(`${API_URL}/transactions/${transactionId}`, data);
  return response.data;
};

