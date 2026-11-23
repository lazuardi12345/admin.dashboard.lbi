import { Button } from '../../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';

export default function PaymentActionDialog({ action, note, submitting, onNoteChange, onClose, onSubmit }) {
  const isVerify = action.type === 'verify';

  return (
    <Dialog open={action.open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isVerify ? 'Verifikasi Pembayaran' : 'Tolak Pembayaran'}</DialogTitle>
          <DialogDescription>
            {isVerify
              ? 'Tuliskan catatan verifikasi (opsional, misal: Dana sudah masuk mutasi BNI).'
              : 'Tuliskan alasan penolakan (wajib, misal: Bukti buram atau nominal tidak sesuai).'}
          </DialogDescription>
        </DialogHeader>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          {isVerify ? 'Catatan Verifikasi (Opsional)' : 'Alasan Penolakan *'}
          <Input
            as="textarea"
            rows={4}
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={isVerify ? 'Catatan verifikasi...' : 'Masukkan alasan penolakan'}
            className="h-auto min-h-24 resize-y"
          />
        </label>
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button variant={isVerify ? 'success' : 'destructive'} onClick={onSubmit} disabled={submitting || (!isVerify && !note.trim())}>
            {submitting ? 'Memproses...' : isVerify ? 'Konfirmasi Verifikasi' : 'Tolak Pembayaran'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
