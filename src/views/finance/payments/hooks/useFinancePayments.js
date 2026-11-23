import { useCallback, useEffect, useState } from 'react';
import { financeApi } from '../../../../api/financeApi';

const EMPTY_ACTION = { open: false, type: '', paymentId: null };

export default function useFinancePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionDialog, setActionDialog] = useState(EMPTY_ACTION);
  const [actionNote, setActionNote] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [paymentInjectedDate, setPaymentInjectedDate] = useState('');
  const [savingInjectedDate, setSavingInjectedDate] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await financeApi.getPayments({
        status: statusFilter === 'all' ? '' : statusFilter,
        division: divisionFilter === 'all' ? '' : divisionFilter,
        search: appliedSearch,
        page
      });
      if (!response?.success) {
        throw new Error(response?.message || 'Gagal memuat daftar pembayaran.');
      }

      const data = response.data;
      if (Array.isArray(data?.data)) {
        setPayments(data.data);
        setTotalPages(data.last_page || 1);
      } else if (Array.isArray(data)) {
        setPayments(data);
        setTotalPages(1);
      } else {
        throw new Error('Format data pembayaran tidak valid.');
      }
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal memuat daftar pembayaran.' });
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, divisionFilter, page, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const selectPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentInjectedDate(payment.enrollment?.metadata?.admin_workflow?.payment_injected_date || '');
  };

  const openAction = (payment, type) => {
    setActionDialog({ open: true, type, paymentId: payment.id });
    setActionNote('');
  };

  const closeAction = () => setActionDialog(EMPTY_ACTION);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(searchTerm);
  };

  const saveInjectedDate = async () => {
    const enrollmentId = selectedPayment?.enrollment?.id;
    if (!enrollmentId) return;

    setSavingInjectedDate(true);
    try {
      await financeApi.updatePaymentInjectedDate(enrollmentId, paymentInjectedDate);
      setFeedback({ type: 'success', message: 'Tanggal pembayaran manual berhasil disimpan.' });
      setSelectedPayment((payment) => ({
        ...payment,
        enrollment: {
          ...payment.enrollment,
          metadata: {
            ...payment.enrollment.metadata,
            admin_workflow: {
              ...payment.enrollment.metadata?.admin_workflow,
              payment_injected_date: paymentInjectedDate || null
            }
          }
        }
      }));
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal menyimpan tanggal pembayaran manual.' });
    } finally {
      setSavingInjectedDate(false);
    }
  };

  const submitAction = async () => {
    if (actionDialog.type === 'reject' && !actionNote.trim()) {
      setFeedback({ type: 'error', message: 'Alasan penolakan wajib diisi.' });
      return;
    }

    setActionSubmitting(true);
    try {
      if (actionDialog.type === 'verify') {
        await financeApi.verifyPayment(actionDialog.paymentId, actionNote);
        setFeedback({ type: 'success', message: 'Pembayaran berhasil diverifikasi!' });
      } else if (actionDialog.type === 'reject') {
        await financeApi.rejectPayment(actionDialog.paymentId, actionNote);
        setFeedback({ type: 'warning', message: 'Pembayaran telah ditolak.' });
      }
      closeAction();
      await fetchPayments();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal memproses aksi.' });
    } finally {
      setActionSubmitting(false);
    }
  };

  return {
    payments,
    loading,
    statusFilter,
    setStatusFilter,
    divisionFilter,
    setDivisionFilter,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    totalPages,
    feedback,
    setFeedback,
    selectedPayment,
    setSelectedPayment,
    actionDialog,
    actionNote,
    setActionNote,
    actionSubmitting,
    paymentInjectedDate,
    setPaymentInjectedDate,
    savingInjectedDate,
    fetchPayments,
    selectPayment,
    openAction,
    closeAction,
    submitSearch,
    saveInjectedDate,
    submitAction
  };
}
