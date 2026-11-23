import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { formatRupiah } from '../../payments/utils/paymentFormatters';

export default function DivisionBreakdownTable({ rows, loading }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Ringkasan Penerimaan per Divisi</h2>
      </div>
      <Table className="min-w-[700px]">
        <TableHeader className="bg-slate-50">
          <TableRow className="hover:bg-transparent">
            <TableHead>Divisi Program</TableHead>
            <TableHead className="text-right">Jml Transaksi Verified</TableHead>
            <TableHead className="text-right">Pendapatan Terverifikasi</TableHead>
            <TableHead className="text-right">Jml Pending</TableHead>
            <TableHead className="text-right">Nominal Pending</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="py-10 text-center">
                <span className="mx-auto block size-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
                <p className="mt-2 text-sm text-slate-500">Menghitung laporan...</p>
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">
                Tidak ada data yang cocok dengan kriteria filter.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.division || 'lainnya'}>
                <TableCell>
                  <Badge variant="outline">{String(row.division || 'Umum').toUpperCase()}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.verified_count || 0}</TableCell>
                <TableCell className="text-right font-semibold text-emerald-700">{formatRupiah(row.confirmed_revenue)}</TableCell>
                <TableCell className="text-right tabular-nums">{row.pending_count || 0}</TableCell>
                <TableCell className="text-right font-medium text-amber-700">{formatRupiah(row.pending_revenue)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
