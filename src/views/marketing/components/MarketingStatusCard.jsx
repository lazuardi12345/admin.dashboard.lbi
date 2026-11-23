import { IconEye, IconEyeOff } from '@tabler/icons-react';

export default function MarketingStatusCard({
  checked = true,
  onChange,
  activeLabel = 'Aktif Tayang di Website',
  inactiveLabel = 'Draf / Disembunyikan',
  activeDesc = 'Konten ini langsung dapat dilihat oleh pengunjung website landing page.',
  inactiveDesc = 'Konten disimpan sebagai draf dan tidak ditampilkan kepada pengunjung publik.',
  disabled = false
}) {
  return (
    <section
      className={`rounded-2xl border p-4 transition sm:p-5 ${
        checked ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-xl ${
              checked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {checked ? <IconEye size={22} /> : <IconEyeOff size={22} />}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-slate-900">{checked ? activeLabel : inactiveLabel}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${
                  checked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {checked ? 'Live' : 'Draft'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{checked ? activeDesc : inactiveDesc}</p>
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-3 self-end sm:self-auto">
          <span className="text-sm font-semibold text-slate-600">{checked ? 'Aktif' : 'Draf'}</span>
          <input
            type="checkbox"
            role="switch"
            checked={Boolean(checked)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="peer sr-only"
          />
          <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-600 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
        </label>
      </div>
    </section>
  );
}
