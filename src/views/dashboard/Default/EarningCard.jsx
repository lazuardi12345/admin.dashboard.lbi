import PropTypes from 'prop-types';
import { useState } from 'react';
import { IconArchive, IconArrowUpRight, IconCopy, IconDots, IconDownload, IconFileTypePdf } from '@tabler/icons-react';
import EarningIcon from 'assets/images/icons/earning.svg';
import SkeletonEarningCard from 'ui-component/cards/Skeleton/EarningCard';

const actions = [
  ['Import Card', IconDownload],
  ['Copy Data', IconCopy],
  ['Export', IconFileTypePdf],
  ['Archive File', IconArchive]
];

export default function EarningCard({ isLoading }) {
  const [menuOpen, setMenuOpen] = useState(false);
  if (isLoading) return <SkeletonEarningCard />;

  return (
    <article className="relative overflow-hidden rounded-xl bg-violet-950 p-5 text-white shadow-sm">
      <div className="pointer-events-none absolute -right-10 -top-12 size-48 rounded-full bg-violet-800/70" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-56 rounded-full bg-violet-800/40" />
      <div className="relative flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-lg bg-violet-800">
          <img src={EarningIcon} alt="" className="size-7" />
        </span>
        <div className="relative">
          <button
            type="button"
            aria-label="Opsi pendapatan"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex size-9 items-center justify-center rounded-lg text-violet-100 hover:bg-violet-800"
          >
            <IconDots size={21} />
          </button>
          {menuOpen && (
            <ul className="absolute right-0 top-10 z-10 w-40 rounded-lg border border-slate-200 bg-white p-1 text-slate-700 shadow-xl">
              {actions.map(([label, Icon]) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-slate-50"
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="relative mt-5 flex items-center gap-2">
        <p className="text-3xl font-semibold">$500.00</p>
        <span className="rounded-full bg-violet-200 p-1 text-violet-950">
          <IconArrowUpRight size={14} />
        </span>
      </div>
      <p className="relative mt-1 text-sm font-medium text-violet-200">Total Earning</p>
    </article>
  );
}

EarningCard.propTypes = { isLoading: PropTypes.bool };
