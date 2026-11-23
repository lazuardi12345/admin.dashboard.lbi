import { IconFilter, IconRefresh, IconSearch, IconX } from '@tabler/icons-react';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import useFinancePayments from './hooks/useFinancePayments';
import PaymentsTable from './components/PaymentsTable';
import PaymentDetailsDialog from './components/PaymentDetailsDialog';
import PaymentActionDialog from './components/PaymentActionDialog';

export default function FinancePayments() {
  const finance = useFinancePayments();

  const handleDetailsAction = (payment, action) => {
    finance.setSelectedPayment(null);
    finance.openAction(payment, action);
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    finance.setPage(1);
  };

  const setAlertSeverity = {
    success: 'success',
    warning: 'warning',
    error: 'error'
  };

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Verifikasi Pembayaran Masuk</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Periksa mutasi transfer, bukti struk, dan konfirmasi pembayaran siswa LBI FIB UI secara cepat dan akurat.
          </p>
        </div>
        <Button variant="outline" onClick={finance.fetchPayments} disabled={finance.loading}>
          <IconRefresh size={18} className={finance.loading ? 'animate-spin' : ''} />
          Muat Ulang
        </Button>
      </header>

      {finance.feedback.message && (
        <Alert variant={setAlertSeverity[finance.feedback.type] || 'info'}>
          <span>{finance.feedback.message}</span>
          <button
            type="button"
            className="rounded p-0.5 opacity-70 hover:opacity-100"
            aria-label="Tutup notifikasi"
            onClick={() => finance.setFeedback({ type: '', message: '' })}
          >
            <IconX size={16} />
          </button>
        </Alert>
      )}

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_2fr_auto]">
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            Status Pembayaran
            <Select value={finance.statusFilter} onChange={handleFilterChange(finance.setStatusFilter)}>
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Verifikasi (Pending)</option>
              <option value="verified">Sudah Diverifikasi (Verified)</option>
              <option value="rejected">Ditolak (Rejected)</option>
            </Select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            Divisi / Program
            <Select value={finance.divisionFilter} onChange={handleFilterChange(finance.setDivisionFilter)}>
              <option value="all">Semua Divisi</option>
              <option value="ppb">PPB (English)</option>
              <option value="ppp">PPP (Penerjemahan)</option>
              <option value="bipa">BIPA</option>
            </Select>
          </label>
          <form onSubmit={finance.submitSearch} className="space-y-1.5 text-xs font-semibold text-slate-600">
            <label htmlFor="payment-search">Cari Pembayaran</label>
            <div className="relative">
              <IconSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="payment-search"
                placeholder="Cari siswa, email, atau no rekening..."
                value={finance.searchTerm}
                onChange={(event) => finance.setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
          </form>
          <div className="flex items-end">
            <Button className="w-full" onClick={finance.submitSearch}>
              <IconFilter size={16} />
              Terapkan
            </Button>
          </div>
        </div>
      </Card>

      <PaymentsTable payments={finance.payments} loading={finance.loading} onSelect={finance.selectPayment} onAction={finance.openAction} />

      <nav aria-label="Navigasi halaman pembayaran" className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Halaman {finance.page} dari {finance.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={finance.page <= 1 || finance.loading}
            onClick={() => finance.setPage((page) => page - 1)}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={finance.page >= finance.totalPages || finance.loading}
            onClick={() => finance.setPage((page) => page + 1)}
          >
            Berikutnya
          </Button>
        </div>
      </nav>

      <PaymentDetailsDialog
        payment={finance.selectedPayment}
        injectedDate={finance.paymentInjectedDate}
        onInjectedDateChange={finance.setPaymentInjectedDate}
        savingInjectedDate={finance.savingInjectedDate}
        onSaveInjectedDate={finance.saveInjectedDate}
        onClose={() => finance.setSelectedPayment(null)}
        onAction={handleDetailsAction}
      />
      <PaymentActionDialog
        action={finance.actionDialog}
        note={finance.actionNote}
        submitting={finance.actionSubmitting}
        onNoteChange={finance.setActionNote}
        onClose={finance.closeAction}
        onSubmit={finance.submitAction}
      />
    </main>
  );
}
