import { IconCheck, IconClock, IconEye, IconX } from '@tabler/icons-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { formatRupiah, getPaymentStatus } from '../utils/paymentFormatters';

function PaymentStatusChip({ status }) {
  const normalizedStatus = getPaymentStatus(status);
  if (normalizedStatus === 'verified' || normalizedStatus === 'paid') {
    return (
      <Badge variant="success">
        <IconCheck size={14} />
        Verified / Lunas
      </Badge>
    );
  }
  if (normalizedStatus === 'pending') {
    return (
      <Badge variant="warning">
        <IconClock size={14} />
        Menunggu Verifikasi
      </Badge>
    );
  }
  if (normalizedStatus === 'rejected') {
    return (
      <Badge variant="destructive">
        <IconX size={14} />
        Ditolak
      </Badge>
    );
  }
  return <Badge variant="outline">{status || 'Unknown'}</Badge>;
}

export default function PaymentsTable({ payments, loading, onSelect, onAction }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Table className="min-w-[900px]">
        <TableHeader className="bg-slate-50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-32">Tgl Transaksi</TableHead>
            <TableHead>Nama Siswa</TableHead>
            <TableHead>Kursus / Divisi</TableHead>
            <TableHead>Bank Pengirim</TableHead>
            <TableHead>Nominal</TableHead>
            <TableHead className="w-24">Bukti Struk</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="py-12 text-center">
                <span className="mx-auto block size-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
                <p className="mt-3 text-sm text-slate-500">Memuat data pembayaran...</p>
              </TableCell>
            </TableRow>
          ) : payments.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={8} className="py-12 text-center text-sm text-slate-500">
                Tidak ada transaksi pembayaran yang cocok dengan filter.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="whitespace-nowrap text-xs text-slate-500">
                  {payment.payment_date || payment.created_at?.slice(0, 10)}
                </TableCell>
                <TableCell>
                  <p className="font-semibold text-slate-900">{payment.student_name}</p>
                  <p className="text-xs text-slate-500">{payment.student_email}</p>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-slate-800">{payment.enrollment?.course_name || '-'}</p>
                  <Badge variant="outline" className="mt-1">
                    {payment.enrollment?.division?.toUpperCase() || '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-slate-800">{payment.bank_name}</p>
                  <p className="text-xs text-slate-500">{payment.account_number}</p>
                </TableCell>
                <TableCell>
                  <p className="whitespace-nowrap font-bold text-blue-800">{formatRupiah(payment.amount)}</p>
                </TableCell>
                <TableCell>
                  {payment.proof_path ? (
                    <Button variant="outline" size="sm" onClick={() => onSelect(payment)}>
                      <IconEye size={14} />
                      Lihat
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-500">Tidak ada</span>
                  )}
                </TableCell>
                <TableCell>
                  <PaymentStatusChip status={payment.status} />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Detail Transaksi"
                      aria-label="Detail Transaksi"
                      onClick={() => onSelect(payment)}
                    >
                      <IconEye size={18} />
                    </Button>
                    {getPaymentStatus(payment.status) === 'pending' && (
                      <>
                        <span title="Verifikasi Pembayaran">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Verifikasi Pembayaran"
                            className="text-emerald-700 hover:bg-emerald-50"
                            onClick={() => onAction(payment, 'verify')}
                          >
                            <IconCheck size={18} />
                          </Button>
                        </span>
                        <span title="Tolak Pembayaran">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Tolak Pembayaran"
                            className="text-red-700 hover:bg-red-50"
                            onClick={() => onAction(payment, 'reject')}
                          >
                            <IconX size={18} />
                          </Button>
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
