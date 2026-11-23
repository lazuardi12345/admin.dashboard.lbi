import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { Button } from '../../../components/ui/button';

export default function MarketingActionFooter({
  onCancel,
  cancelText = 'Batal',
  saveText = 'Simpan Perubahan',
  saving = false,
  disabled = false,
  extraAction,
  note = 'Perubahan akan langsung diperbarui di landing page.'
}) {
  return (
    <footer className="flex flex-col-reverse justify-between gap-4 border-t border-[#d0e8f7] bg-[linear-gradient(135deg,#E1EFFA_0%,#f0f7fe_100%)] px-4 py-5 sm:flex-row sm:items-center sm:px-8">
      <div>{note && <p className="text-xs text-slate-500">{note}</p>}</div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {extraAction}
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            <IconX size={17} />{cancelText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving || disabled}
          className="min-h-[42px] rounded-lg bg-[linear-gradient(135deg,#18386E_0%,#2757A4_100%)] px-7 py-2 font-bold text-white shadow-md hover:bg-[linear-gradient(135deg,#122B55_0%,#1e4a8f_100%)]"
        >
          {saving ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <IconDeviceFloppy size={18} />}
          {saving ? 'Menyimpan...' : saveText}
        </Button>
      </div>
    </footer>
  );
}
