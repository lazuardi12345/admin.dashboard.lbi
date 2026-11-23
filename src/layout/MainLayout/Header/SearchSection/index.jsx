import { useState } from 'react';
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';

export default function SearchSection({ compact = false }) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  if (compact && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka pencarian"
        className="inline-flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <IconSearch size={19} />
      </button>
    );
  }

  return (
    <label
      className={`flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 ${compact ? 'fixed left-2 right-2 top-2 z-[1201] bg-white shadow-lg' : 'max-w-md'}`}
    >
      <IconSearch size={17} aria-hidden="true" />
      <input
        id="input-search-header"
        aria-label="Search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search"
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
      <IconAdjustmentsHorizontal size={17} aria-hidden="true" />
      {compact && (
        <button type="button" onClick={() => setOpen(false)} aria-label="Tutup pencarian" className="rounded p-1 hover:bg-slate-100">
          <IconX size={17} />
        </button>
      )}
    </label>
  );
}
