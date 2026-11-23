import { IconDownload, IconRefresh, IconX } from '@tabler/icons-react';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import useFinanceReports from './hooks/useFinanceReports';
import ReportsFilterForm from './components/ReportsFilterForm';
import ReportSummaryCards from './components/ReportSummaryCards';
import DivisionBreakdownTable from './components/DivisionBreakdownTable';

export default function FinanceReports() {
  const reports = useFinanceReports();
  const summary = reports.reportsData?.summary || {};
  const divisionBreakdown = reports.reportsData?.division_breakdown || [];
  const alertVariant = reports.feedback.type === 'error' ? 'error' : 'info';

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Laporan Keuangan & Rekap Pembayaran</h1>
          <p className="mt-1 text-sm text-slate-500">Pantau arus penerimaan kas pendaftaran kursus dari program PPB, PPP, dan BIPA.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={reports.fetchReports} disabled={reports.loading}>
            <IconRefresh size={18} className={reports.loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="success" onClick={reports.downloadCsv}>
            <IconDownload size={18} />
            Download CSV
          </Button>
        </div>
      </header>

      {reports.feedback.message && (
        <Alert variant={alertVariant}>
          <span>{reports.feedback.message}</span>
          <button
            type="button"
            className="rounded p-0.5 opacity-70 hover:opacity-100"
            aria-label="Tutup notifikasi"
            onClick={() => reports.setFeedback({ type: '', message: '' })}
          >
            <IconX size={16} />
          </button>
        </Alert>
      )}

      <ReportsFilterForm filters={reports.filters} onFilterChange={reports.updateFilter} onSubmit={reports.applyFilters} />
      <ReportSummaryCards summary={summary} />
      <DivisionBreakdownTable rows={divisionBreakdown} loading={reports.loading} />
    </main>
  );
}
