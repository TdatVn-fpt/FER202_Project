const AUTH_STORAGE_KEY = 'ielts_auth_user';

const ROLE_DASHBOARD_PATHS = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/learning/dashboard',
};

const MOCK_GOOGLE_USERS = {
  student: {
    id: 'google-student-1',
    name: 'Tien Dat',
    email: 'ntiendat2108@gmail.com',
    avatar: 'https://www.gravatar.com/avatar/?d=mp',
    role: 'student',
    provider: 'google',
  },
  teacher: {
    id: 'google-teacher-1',
    name: 'IELTS Mentor',
    email: 'teacher@ieltslearning.com',
    avatar: 'https://www.gravatar.com/avatar/?d=mp',
    role: 'teacher',
    provider: 'google',
  },
  admin: {
    id: 'google-admin-1',
    name: 'System Admin',
    email: 'admin@ieltslearning.com',
    avatar: 'https://www.gravatar.com/avatar/?d=mp',
    role: 'admin',
    provider: 'google',
  },
};

export function getCurrentUser() {
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveAuthUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('auth:user-changed'));
  return user;
}

export async function loginWithGoogle(options = {}) {
  const role = ['student', 'teacher', 'admin'].includes(options.role) ? options.role : 'student';

  await new Promise((resolve) => {
    setTimeout(resolve, 450);
  });

  return saveAuthUser(MOCK_GOOGLE_USERS[role]);
}

export function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event('auth:user-changed'));
}

export function getDashboardPathByRole(role) {
  return ROLE_DASHBOARD_PATHS[role] || ROLE_DASHBOARD_PATHS.student;
}

export function isRoleAllowed(user, allowedRoles = []) {
  if (!user) {
    return false;
  }

  return allowedRoles.length === 0 || allowedRoles.includes(user.role);
}
