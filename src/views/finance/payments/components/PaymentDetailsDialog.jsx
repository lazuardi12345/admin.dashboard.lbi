import { IconFileText } from '@tabler/icons-react';
import { resolveImageUrl } from '../../../../api/apiClient';
import { Button } from '../../../../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { formatRupiah, getPaymentStatus } from '../utils/paymentFormatters';

function DetailItem({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 break-words text-sm font-medium text-slate-900">{children || '-'}</div>
    </div>
  );
}

export default function PaymentDetailsDialog({
  payment,
  injectedDate,
  onInjectedDateChange,
  savingInjectedDate,
  onSaveInjectedDate,
  onClose,
  onAction
}) {
  return (
    <Dialog open={Boolean(payment)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detail Pembayaran #{payment?.id}</DialogTitle>
        </DialogHeader>
        {payment && (
          <div className="space-y-5">
            <section className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
              <DetailItem label="Nama Siswa">{payment.student_name}</DetailItem>
              <DetailItem label="Email">{payment.student_email}</DetailItem>
              <DetailItem label="Nominal Transfer">{formatRupiah(payment.amount)}</DetailItem>
              <DetailItem label="Tanggal Bayar">{payment.payment_date}</DetailItem>
              <DetailItem label="Bank Pengirim">{payment.bank_name}</DetailItem>
              <DetailItem label="Nomor Rekening">
                {payment.account_number} a.n {payment.account_holder}
              </DetailItem>
            </section>

            {payment.enrollment && (
              <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-end">
                <label className="flex-1 space-y-1.5 text-sm font-medium text-slate-700">
                  Tanggal Payment Injected
                  <Input type="date" value={injectedDate} onChange={(event) => onInjectedDateChange(event.target.value)} />
                </label>
                <Button variant="outline" onClick={onSaveInjectedDate} disabled={savingInjectedDate}>
                  {savingInjectedDate ? 'Menyimpan...' : 'Simpan Tanggal Manual'}
                </Button>
              </div>
            )}

            {payment.notes && (
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">Catatan Verifikator</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{payment.notes}</p>
              </div>
            )}

            {payment.proof_path && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <IconFileText size={17} /> Bukti Struk Transfer
                </p>
                <img
                  src={resolveImageUrl(payment.proof_path)}
                  alt="Bukti Transfer"
                  className="max-h-[22rem] w-full rounded-lg border border-slate-200 object-contain"
                />
              </div>
            )}
          </div>
        )}
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          {payment && getPaymentStatus(payment.status) === 'pending' && (
            <>
              <Button variant="destructive" onClick={() => onAction(payment, 'reject')}>
                Tolak
              </Button>
              <Button variant="success" onClick={() => onAction(payment, 'verify')}>
                Verifikasi
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
