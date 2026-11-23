import { useState } from 'react';
import { IconPlus, IconSettings } from '@tabler/icons-react';
import FontFamily from './FontFamily';
import BorderRadius from './BorderRadius';
import useConfig from 'hooks/useConfig';

export default function Customization() {
  const { resetState } = useConfig();
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    resetState();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Live Customize"
        title="Live Customize"
        className="fixed right-2 top-1/4 z-[1200] flex size-11 items-center justify-center rounded-full rounded-br-md bg-violet-700 text-white shadow-lg transition hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
      >
        <IconSettings size={21} />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[1400] flex justify-end bg-slate-950/40"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-customization-title"
            className="flex h-full w-full max-w-[23.5rem] flex-col bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 id="theme-customization-title" className="font-semibold text-slate-900">
                Theme Customization
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup pengaturan"
                  className="flex size-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                >
                  <IconPlus size={21} className="rotate-45" />
                </button>
              </div>
            </header>
            <div className="flex-1 divide-y divide-slate-200 overflow-y-auto">
              <FontFamily />
              <BorderRadius />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
