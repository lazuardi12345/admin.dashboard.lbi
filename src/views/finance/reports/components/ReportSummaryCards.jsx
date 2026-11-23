import { IconCash, IconChartBar, IconHourglass } from '@tabler/icons-react';
import { Card } from '../../../../components/ui/card';
import { formatRupiah } from '../../payments/utils/paymentFormatters';

const SUMMARY_CARDS = [
  {
    key: 'confirmed',
    title: 'Total Pendapatan Terverifikasi',
    amount: 'total_confirmed_revenue',
    count: 'total_verified_count',
    countLabel: 'transaksi lunas',
    icon: IconCash,
    cardClass: 'border-emerald-200 bg-emerald-50',
    titleClass: 'text-emerald-900',
    amountClass: 'text-emerald-950',
    countClass: 'text-emerald-800',
    iconClass: 'text-emerald-700'
  },
  {
    key: 'pending',
    title: 'Menunggu Verifikasi (Pending)',
    amount: 'total_pending_revenue',
    count: 'total_pending_count',
    countLabel: 'pendaftar belum verifikasi',
    icon: IconHourglass,
    cardClass: 'border-amber-200 bg-amber-50',
    titleClass: 'text-amber-900',
    amountClass: 'text-amber-950',
    countClass: 'text-amber-800',
    iconClass: 'text-amber-700'
  }
];

export default function ReportSummaryCards({ summary }) {
  const totalTransactions = (summary.total_verified_count || 0) + (summary.total_pending_count || 0);

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {SUMMARY_CARDS.map(
        ({ key, title, amount, count, countLabel, icon: Icon, cardClass, titleClass, amountClass, countClass, iconClass }) => (
          <Card key={key} className={`flex items-center justify-between p-5 ${cardClass}`}>
            <div>
              <p className={`text-sm font-medium ${titleClass}`}>{title}</p>
              <p className={`mt-2 text-2xl font-bold tracking-tight ${amountClass}`}>{formatRupiah(summary[amount])}</p>
              <p className={`mt-1 text-xs ${countClass}`}>
                {summary[count] || 0} {countLabel}
              </p>
            </div>
            <Icon size={34} className={`shrink-0 ${iconClass}`} />
          </Card>
        )
      )}
      <Card className="flex items-center justify-between border-blue-200 bg-blue-50 p-5">
        <div>
          <p className="text-sm font-medium text-blue-900">Total Transaksi Masuk</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-blue-950">{totalTransactions}</p>
          <p className="mt-1 text-xs text-blue-800">Rekap gabungan seluruh divisi</p>
        </div>
        <IconChartBar size={34} className="shrink-0 text-blue-700" />
      </Card>
    </div>
  );
}
