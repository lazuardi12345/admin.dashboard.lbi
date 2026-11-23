import { useCallback, useEffect, useState } from 'react';
import { financeApi } from '../../../../api/financeApi';

const INITIAL_FILTERS = {
  program: '',
  status: '',
  period: '',
  date_from: '',
  date_to: ''
};

export default function useFinanceReports() {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await financeApi.getReports(appliedFilters);
      if (!response?.success) {
        throw new Error(response?.message || 'Gagal memuat laporan keuangan.');
      }
      setReportsData(response.data);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal memuat laporan keuangan.' });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const downloadCsv = () => {
    window.open(financeApi.downloadCsvUrl(filters), '_blank');
  };

  return {
    reportsData,
    loading,
    filters,
    feedback,
    setFeedback,
    fetchReports,
    updateFilter,
    applyFilters,
    downloadCsv
  };
}
