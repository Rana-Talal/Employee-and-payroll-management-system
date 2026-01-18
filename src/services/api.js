/**
 * مكتبة خدمات API المركزية
 * تحتوي على جميع استدعاءات API مع المصادقة التلقائية
 */

// استخدام proxy في development، والمسار المباشر في production
const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://192.168.11.230:1006/api'
  : '/api';

/**
 * الحصول على headers المصادقة
 * @returns {Object} headers with Authorization token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * معالج الأخطاء المركزي
 * @param {Response} response - fetch response
 * @returns {Promise<any>} parsed JSON or throws error
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    const error = await response.text();
    throw new Error(error || `HTTP Error ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

/**
 * طلب GET عام
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<any>}
 */
const get = async (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${BASE_URL}${endpoint}?${queryString}` : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

/**
 * طلب POST عام
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @returns {Promise<any>}
 */
const post = async (endpoint, data) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * طلب PUT عام
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request body
 * @returns {Promise<any>}
 */
const put = async (endpoint, data) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * طلب DELETE عام
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>}
 */
const del = async (endpoint) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};

// ============================================
// خدمات كتب الشكر والترفيعات
// ============================================

export const appreciationLettersAPI = {
  /**
   * Get all appreciation letters with pagination
   * @param {Object} params - { PageNumber, PageSize, letterType, period, etc. }
   * @returns {Promise<PaginatedResponse<AppreciationLetterResponse>>}
   */
  getAll: (params = { PageNumber: 1, PageSize: 10 }) =>
    get('/AppreciationLetters', params),

  /**
   * Get appreciation letter by ID
   * @param {number} id
   * @returns {Promise<AppreciationLetterResponse>}
   */
  getById: (id) => get(`/AppreciationLetters/${id}`),

  /**
   * Create new appreciation letter
   * @param {AddAdministrativeOrderDTO} data
   * @returns {Promise<AppreciationLetterResponse>}
   */
  create: (data) => post('/AppreciationLetters', data),

  /**
   * Update appreciation letter
   * @param {number} id
   * @param {UpdateAdministrativeOrderDTO} data
   * @returns {Promise<AppreciationLetterResponse>}
   */
  update: (id, data) => put(`/AppreciationLetters/${id}`, data),

  /**
   * Delete appreciation letter
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/AppreciationLetters/${id}`),
};

// ============================================
// خدمات الموظفين
// ============================================

export const employeesAPI = {
  /**
   * Get all employees with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Array|PaginatedResponse>}
   */
  getAll: (params = { PageSize: 1000 }) => get('/Employee', params),

  /**
   * Get employee by ID
   * @param {number} id
   * @returns {Promise<EmployeeResponse>}
   */
  getById: (id) => get(`/Employee/${id}`),

  /**
   * Create new employee
   * @param {AddEmployeeDTO} data
   * @returns {Promise<EmployeeResponse>}
   */
  create: (data) => post('/Employee', data),

  /**
   * Update employee
   * @param {number} id
   * @param {UpdateEmployeeDTO} data
   * @returns {Promise<EmployeeResponse>}
   */
  update: (id, data) => put(`/Employee/${id}`, data),

  /**
   * Delete employee
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/Employee/${id}`),
};

// ============================================
// خدمات الدورات
// ============================================

export const coursesAPI = {
  /**
   * Get all courses
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>}
   */
  getAll: (params = {}) => get('/Course', params),

  /**
   * Get course by ID
   * @param {number} id
   * @returns {Promise<CourseResponse>}
   */
  getById: (id) => get(`/Course/${id}`),

  /**
   * Create new course
   * @param {CourseRegisterDTO} data
   * @returns {Promise<CourseResponse>}
   */
  create: (data) => post('/Course', data),

  /**
   * Update course
   * @param {number} id
   * @param {UpdateCourseDTO} data
   * @returns {Promise<CourseResponse>}
   */
  update: (id, data) => put(`/Course/${id}`, data),

  /**
   * Delete course
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/Course/${id}`),

  /**
   * Enroll employee in course
   * @param {CourseEmployeeDTO} data
   * @returns {Promise<any>}
   */
  enrollEmployee: (data) => post('/CourseEmployee', data),
};

// ============================================
// خدمات تسجيل الموظفين في الدورات
// ============================================

export const courseEmployeeAPI = {
  /**
   * Get all course enrollments
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>}
   */
  getAll: (params = {}) => get('/CourseEmployee', params),

  /**
   * Get course enrollment by ID
   * @param {number} id
   * @returns {Promise<any>}
   */
  getById: (id) => get(`/CourseEmployee/${id}`),

  /**
   * Get all courses for a specific employee
   * @param {number} employeeId
   * @returns {Promise<Array>}
   */
  getByEmployee: (employeeId) => get('/CourseEmployee', { employeeId }),

  /**
   * Get all employees enrolled in a specific course
   * @param {number} courseId
   * @returns {Promise<Array>}
   */
  getByCourse: (courseId) => get('/CourseEmployee', { courseId }),

  /**
   * Enroll employee in course
   * @param {CourseEmployeeDTO} data
   * @returns {Promise<any>}
   */
  enroll: (data) => post('/CourseEmployee', data),

  /**
   * Update course enrollment (degree, notes, etc.)
   * @param {number} id
   * @param {UpdateCourseEmployeeDTO} data
   * @returns {Promise<any>}
   */
  update: (id, data) => put(`/CourseEmployee/${id}`, data),

  /**
   * Delete course enrollment
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/CourseEmployee/${id}`),
};

// ============================================
// خدمات المخصصات
// ============================================

export const entitlementsAPI = {
  /**
   * Get all entitlement types
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  getAllTypes: (params = {}) => get('/EntitlementTypes', params),

  /**
   * Get employee entitlements
   * @param {number} employeeId
   * @returns {Promise<Array>}
   */
  getByEmployee: (employeeId) => get(`/EmployeeEntitlements/employee/${employeeId}`),

  /**
   * Assign entitlement to employee
   * @param {AssignEmployeeEntitlementDTO} data
   * @returns {Promise<any>}
   */
  assign: (data) => post('/EmployeeEntitlements', data),

  /**
   * Update employee entitlement
   * @param {number} id
   * @param {UpdateEmployeeEntitlementDTO} data
   * @returns {Promise<any>}
   */
  update: (id, data) => put(`/EmployeeEntitlements/${id}`, data),

  /**
   * Delete employee entitlement
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/EmployeeEntitlements/${id}`),
};

// ============================================
// خدمات الاستقطاعات
// ============================================

export const deductionsAPI = {
  /**
   * Get all deduction types
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  getAllTypes: (params = {}) => get('/DeductionTypes', params),

  /**
   * Get employee deductions
   * @param {number} employeeId
   * @returns {Promise<Array>}
   */
  getByEmployee: (employeeId) => get(`/EmployeeDeductions/employee/${employeeId}`),

  /**
   * Assign deduction to employee
   * @param {AssignEmployeeDeductionDTO} data
   * @returns {Promise<any>}
   */
  assign: (data) => post('/EmployeeDeductions', data),

  /**
   * Update employee deduction
   * @param {number} id
   * @param {UpdateEmployeeDeductionDTO} data
   * @returns {Promise<any>}
   */
  update: (id, data) => put(`/EmployeeDeductions/${id}`, data),

  /**
   * Delete employee deduction
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/EmployeeDeductions/${id}`),
};

// ============================================
// خدمات احتساب الخدمة
// ============================================

export const serviceCalculationAPI = {
  /**
   * Get employee service records
   * @param {number} employeeId
   * @returns {Promise<Array>}
   */
  getByEmployee: (employeeId) => get(`/EmployeeService/employee/${employeeId}`),

  /**
   * Add service record
   * @param {AddEmployeeServiceDTO} data
   * @returns {Promise<any>}
   */
  add: (data) => post('/EmployeeService', data),

  /**
   * Update service record
   * @param {number} id
   * @param {UpdateEmployeeServiceDTO} data
   * @returns {Promise<any>}
   */
  update: (id, data) => put(`/EmployeeService/${id}`, data),

  /**
   * Delete service record
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/EmployeeService/${id}`),
};

// ============================================
// خدمات الفروع والأقسام
// ============================================

export const branchesAPI = {
  /**
   * Get all branches
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  getAll: (params = { PageSize: 1000 }) => get('/Branch', params),

  /**
   * Get branch by ID
   * @param {number} id
   * @returns {Promise<BranchResponse>}
   */
  getById: (id) => get(`/Branch/${id}`),

  /**
   * Create branch
   * @param {AddBranchDTO} data
   * @returns {Promise<BranchResponse>}
   */
  create: (data) => post('/Branch', data),

  /**
   * Update branch
   * @param {number} id
   * @param {UpdateBranchDTO} data
   * @returns {Promise<BranchResponse>}
   */
  update: (id, data) => put(`/Branch/${id}`, data),

  /**
   * Delete branch
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/Branch/${id}`),
};

export const departmentsAPI = {
  /**
   * Get all departments
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  getAll: (params = { PageSize: 1000 }) => get('/Departments', params),

  /**
   * Get departments by branch
   * @param {number} branchId
   * @returns {Promise<Array>}
   */
  getByBranch: (branchId) => get(`/Departments/by-branch/${branchId}`),

  /**
   * Get department by ID
   * @param {number} id
   * @returns {Promise<DepartmentResponse>}
   */
  getById: (id) => get(`/Departments/${id}`),

  /**
   * Create department
   * @param {AddDepartmentDTO} data
   * @returns {Promise<DepartmentResponse>}
   */
  create: (data) => post('/Departments', data),

  /**
   * Update department
   * @param {number} id
   * @param {UpdateDepartmentDTO} data
   * @returns {Promise<DepartmentResponse>}
   */
  update: (id, data) => put(`/Departments/${id}`, data),

  /**
   * Delete department
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/Departments/${id}`),
};

export const unitsAPI = {
  /**
   * Get all units
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  getAll: (params = {}) => get('/Units', params),

  /**
   * Create unit
   * @param {AddUnitDTO} data
   * @returns {Promise<UnitResponse>}
   */
  create: (data) => post('/Units', data),

  /**
   * Update unit
   * @param {number} id
   * @param {UpdateUnitDTO} data
   * @returns {Promise<UnitResponse>}
   */
  update: (id, data) => put(`/Units/${id}`, data),

  /**
   * Delete unit
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/Units/${id}`),
};

// ============================================
// خدمات سلم الرواتب
// ============================================

export const salaryScaleAPI = {
  /**
   * Get all salary grades
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  getAll: (params = {}) => get('/GradeSteps', params),

  /**
   * Get salary by grade and step
   * @param {number} grade
   * @param {number} step
   * @returns {Promise<GradeStepResponse>}
   */
  getByGradeStep: (grade, step) => get(`/GradeSteps/grade/${grade}/step/${step}`),

  /**
   * Create grade step
   * @param {AddGradeStepDTO} data
   * @returns {Promise<GradeStepResponse>}
   */
  create: (data) => post('/GradeSteps', data),

  /**
   * Update grade step
   * @param {number} id
   * @param {UpdateGradeStepDTO} data
   * @returns {Promise<GradeStepResponse>}
   */
  update: (id, data) => put(`/GradeSteps/${id}`, data),

  /**
   * Delete grade step
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/GradeSteps/${id}`),
};

// ============================================
// خدمات المناصب
// ============================================

export const positionsAPI = {
  /**
   * Get all positions
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  getAll: (params = {}) => get('/Positions', params),

  /**
   * Create position
   * @param {AddPositionDTO} data
   * @returns {Promise<PositionResponse>}
   */
  create: (data) => post('/Positions', data),

  /**
   * Update position
   * @param {number} id
   * @param {UpdatePositionDTO} data
   * @returns {Promise<PositionResponse>}
   */
  update: (id, data) => put(`/Positions/${id}`, data),

  /**
   * Delete position
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/Positions/${id}`),
};

// ============================================
// خدمات البنوك
// ============================================

export const banksAPI = {
  /**
   * Get all banks
   * @param {Object} params
   * @returns {Promise<Array>}
   */
  getAll: (params = {}) => get('/Banks', params),

  /**
   * Create bank
   * @param {BankDTO} data
   * @returns {Promise<BankResponse>}
   */
  create: (data) => post('/Banks', data),

  /**
   * Update bank
   * @param {number} id
   * @param {UpdateBankDTO} data
   * @returns {Promise<BankResponse>}
   */
  update: (id, data) => put(`/Banks/${id}`, data),

  /**
   * Delete bank
   * @param {number} id
   * @returns {Promise<void>}
   */
  delete: (id) => del(`/Banks/${id}`),
};

// ============================================
// خدمات الرواتب
// ============================================

export const salariesAPI = {
  /**
   * Generate salary for employee
   * @param {GenerateSalaryDTO} data
   * @returns {Promise<any>}
   */
  generate: (data) => post('/Salaries/generate', data),

  /**
   * Get employee salary details
   * @param {number} employeeId
   * @param {number} month
   * @param {number} year
   * @returns {Promise<any>}
   */
  getEmployeeSalary: (employeeId, month, year) =>
    get(`/Salaries/employee/${employeeId}`, { month, year }),
};

// ============================================
// خدمات المستخدمين
// ============================================

export const usersAPI = {
  /**
   * Login
   * @param {LoginDTO} credentials
   * @returns {Promise<{token: string}>}
   */
  login: (credentials) => post('/Auth/login', credentials),

  /**
   * Register new user
   * @param {RegisterUserDTO} data
   * @returns {Promise<UserResponse>}
   */
  register: (data) => post('/Auth/register', data),
};

// Export default API object
export default {
  appreciationLetters: appreciationLettersAPI,
  employees: employeesAPI,
  courses: coursesAPI,
  courseEmployee: courseEmployeeAPI,
  entitlements: entitlementsAPI,
  deductions: deductionsAPI,
  serviceCalculation: serviceCalculationAPI,
  branches: branchesAPI,
  departments: departmentsAPI,
  units: unitsAPI,
  salaryScale: salaryScaleAPI,
  positions: positionsAPI,
  banks: banksAPI,
  salaries: salariesAPI,
  users: usersAPI,
};
