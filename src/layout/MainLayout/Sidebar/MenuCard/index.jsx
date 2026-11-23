import { memo } from 'react';
import { IconTable } from '@tabler/icons-react';

function MenuCard() {
  return (
    <section className="relative mb-5 overflow-hidden rounded-xl bg-blue-50 p-4">
      <div className="pointer-events-none absolute -right-10 -top-20 size-36 rounded-full bg-blue-100" />
      <div className="relative flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-white text-blue-700">
          <IconTable size={20} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-blue-900">Get Extra Space</h2>
          <p className="text-xs text-slate-500">28/23 GB</p>
        </div>
      </div>
      <div className="relative mt-4">
        <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
          <span>Progress</span>
          <span>80%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white">
          <div className="h-full w-4/5 rounded-full bg-blue-700" />
        </div>
      </div>
    </section>
  );
}

export default memo(MenuCard);
