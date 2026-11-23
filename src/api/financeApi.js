// src/api/financeApi.js
import { request, getAuthToken } from './apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const financeApi = {
  /**
   * Get payments list with filters (status, division, page)
   */
  getPayments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.division) query.append('division', params.division);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    return request(`/finance/payments?${query.toString()}`);
  },

  /**
   * Get payment confirmation detail
   */
  getPaymentDetail: (id) => request(`/finance/payments/${id}`),

  /**
   * Verify payment with optional note
   */
  verifyPayment: (id, note = '') =>
    request(`/finance/payments/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ note })
    }),

  /**
   * Reject payment with reason
   */
  rejectPayment: (id, reason = '') =>
    request(`/finance/payments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  updatePaymentInjectedDate: (enrollmentId, date) =>
    request(`/finance/enrollments/${enrollmentId}/payment-injected-date`, {
      method: 'PUT',
      body: JSON.stringify({ payment_injected_date: date || null })
    }),

  /**
   * Get aggregate finance report
   */
  getReports: (params = {}) => {
    const query = new URLSearchParams();
    if (params.program) query.append('program', params.program);
    if (params.period) query.append('period', params.period);
    if (params.status) query.append('status', params.status);
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);
    return request(`/finance/reports?${query.toString()}`);
  },

  /**
   * Download CSV streaming
   */
  downloadCsvUrl: (params = {}) => {
    const query = new URLSearchParams();
    query.append('export', 'csv');
    if (params.program) query.append('program', params.program);
    if (params.period) query.append('period', params.period);
    if (params.status) query.append('status', params.status);
    if (params.date_from) query.append('date_from', params.date_from);
    if (params.date_to) query.append('date_to', params.date_to);
    return `${API_BASE_URL}/finance/reports?${query.toString()}`;
  }
};

export default financeApi;
