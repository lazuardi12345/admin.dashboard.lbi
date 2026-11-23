import { IconFilter } from '@tabler/icons-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';

export default function ReportsFilterForm({ filters, onFilterChange, onSubmit }) {
  const update = (field) => (event) => onFilterChange(field, event.target.value);

  return (
    <Card className="mb-6 p-4 sm:p-5">
      <form onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr_1fr_1fr_auto]">
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            Program / Divisi
            <Select value={filters.program} onChange={update('program')}>
              <option value="">Semua Divisi</option>
              <option value="ppb">PPB (English)</option>
              <option value="ppp">PPP (Penerjemahan)</option>
              <option value="bipa">BIPA</option>
            </Select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            Status Pembayaran
            <Select value={filters.status} onChange={update('status')}>
              <option value="">Semua Status</option>
              <option value="verified">Verified (Lunas)</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            Periode Term
            <Input placeholder="Contoh: Term 1 2026" value={filters.period} onChange={update('period')} />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            Dari Tanggal
            <Input type="date" value={filters.date_from} onChange={update('date_from')} />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600">
            Sampai Tanggal
            <Input type="date" value={filters.date_to} onChange={update('date_to')} />
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              <IconFilter size={16} />
              Cari
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
