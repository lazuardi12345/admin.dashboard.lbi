// src/api/adminApi.js
import { request } from './apiClient';

export const adminApi = {
  /**
   * Get overall admin dashboard metrics
   */
  getDashboardMetrics: () => request('/admin/dashboard'),

  /**
   * Get deep enrollment & revenue analytics (Fase 4C)
   */
  getEnrollmentAnalytics: (division = '') => {
    const query = division ? `?division=${encodeURIComponent(division)}` : '';
    return request(`/admin/analytics/enrollments${query}`);
  },

  /**
   * Get enrollment master list with filters
   */
  getEnrollments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.division) query.append('division', params.division);
    if (params.term_id) query.append('term_id', params.term_id);
    if (params.term_period) query.append('term_period', params.term_period);
    if (params.registration_track) query.append('registration_track', params.registration_track);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.per_page) query.append('per_page', params.per_page);
    if (params.workflow_stage) query.append('workflow_stage', params.workflow_stage);
    return request(`/admin/enrollments?${query.toString()}`);
  },

  /**
   * Get enrollment detail by id
   */
  getEnrollmentDetail: (id) => request(`/admin/enrollments/${id}`),

  /**
   * Update enrollment status (approved, pending_payment, postponed, etc.)
   */
  updateEnrollmentStatus: (id, status) =>
    request(`/admin/enrollments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  updateEnrollmentWorkflow: (id, data) =>
    request(`/admin/enrollments/${id}/workflow`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  injectPayment: (id, data) =>
    request(`/admin/enrollments/${id}/inject-payment`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  /**
   * Placement Test Tokens (Serial Number DPT)
   */
  getPlacementTestTokens: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.per_page) query.append('per_page', params.per_page);
    const queryString = query.toString();
    return request(`/admin/placement-test-tokens${queryString ? `?${queryString}` : ''}`);
  },
  sendPlacementTestTokenEmail: (tokenId) =>
    request(`/admin/placement-test-tokens/${tokenId}/send-email`, {
      method: 'POST'
    }),

  /**
   * User management
   */
  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    return request(`/admin/users?${query.toString()}`);
  },

  /**
   * Schedule management (Akademik & Pendaftaran)
   */
  getSchedules: (filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') query.append(key, value);
    });
    return request(`/admin/schedules${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getScheduleDetail: (id) => request(`/admin/schedules/${id}`),
  createSchedule: (data) =>
    request('/admin/schedules', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSchedule: (id, data) =>
    request(`/admin/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSchedule: (id) =>
    request(`/admin/schedules/${id}`, {
      method: 'DELETE'
    }),

  /**
   * Helper to fetch course catalogs for dropdown selector
   */
  getCourseCatalogs: async () => {
    try {
      return await request('/admin/course-catalogs');
    } catch {
      return await request('/public/course-catalogs');
    }
  },

  getCourseFeeRules: () => request('/admin/course-fees'),
  getResolvedCourseFee: (filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') query.append(key, value);
    });
    return request(`/public/course-fees?${query.toString()}`);
  },
  createCourseFeeRule: (data) => request('/admin/course-fees', { method: 'POST', body: JSON.stringify(data) }),
  updateCourseFeeRule: (id, data) => request(`/admin/course-fees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourseFeeRule: (id) => request(`/admin/course-fees/${id}`, { method: 'DELETE' }),

  /**
   * Helper to fetch course levels for a specific course catalog
   */
  getLevelsByCourse: (catalogId) => request(`/public/courses/${catalogId}/levels`),

  /**
   * Helper to fetch master schedule options (days, times, formats, locations, level presets) from Backend
   */
  getMasterScheduleOptions: async () => {
    try {
      return await request('/admin/schedules/master-options');
    } catch {
      return await request('/public/schedules/master-options');
    }
  },

  /**
   * Helper to fetch services / program list
   */
  getServices: () => request('/marketing/services'),

  /**
   * Term Master Data (per program: ppb, ppp, bipa)
   */
  getTerms: (program = '') => {
    const q = program && program !== 'all' ? `?program=${encodeURIComponent(program)}` : '';
    return request(`/admin/terms${q}`);
  },
  getTermDetail: (id) => request(`/admin/terms/${id}`),
  createTerm: (data) =>
    request('/admin/terms', { method: 'POST', body: JSON.stringify(data) }),
  updateTerm: (id, data) =>
    request(`/admin/terms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTerm: (id) =>
    request(`/admin/terms/${id}`, { method: 'DELETE' }),

  /**
   * Public terms (for registration page, no auth)
   */
  getActiveTerms: (program = '') => {
    const q = program && program !== 'all' ? `?program=${encodeURIComponent(program)}` : '';
    return request(`/public/terms${q}`);
  },
};

export default adminApi;
