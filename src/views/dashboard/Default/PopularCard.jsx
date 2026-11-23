import PropTypes from 'prop-types';
import { useState } from 'react';
import { IconChevronRight, IconChevronUp, IconChevronDown, IconDots } from '@tabler/icons-react';
import BajajAreaChartCard from './BajajAreaChartCard';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

const stocks = [
  { name: 'Bajaj Finery', amount: '$1839.00', change: '10% Profit', up: true },
  { name: 'TTML', amount: '$100.00', change: '10% loss', up: false },
  { name: 'Reliance', amount: '$200.00', change: '10% Profit', up: true },
  { name: 'TTML', amount: '$189.00', change: '10% loss', up: false },
  { name: 'Stolon', amount: '$189.00', change: '10% loss', up: false }
];

export default function PopularCard({ isLoading }) {
  const [period, setPeriod] = useState('Today');
  if (isLoading) return <SkeletonPopularCard />;

  return (
    <MainCard content={false}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Popular Stocks</h2>
          <details className="relative">
            <summary
              aria-label="Pilih periode"
              className="flex size-8 cursor-pointer list-none items-center justify-center rounded-md hover:bg-slate-100"
            >
              <IconDots size={19} />
            </summary>
            <div className="absolute right-0 top-9 z-10 w-36 rounded-md border border-slate-200 bg-white p-1 shadow-lg">
              {['Today', 'This Month', 'This Year'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={(event) => {
                    setPeriod(option);
                    event.currentTarget.closest('details').open = false;
                  }}
                  className="block w-full rounded px-2 py-2 text-left text-sm hover:bg-slate-50"
                >
                  {option}
                </button>
              ))}
            </div>
          </details>
        </div>
        <p className="mt-1 text-xs text-slate-500">{period}</p>
        <BajajAreaChartCard />
        <div className="mt-3 divide-y divide-slate-100">
          {stocks.map((stock, index) => (
            <div key={`${stock.name}-${index}`} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">{stock.name}</p>
                <p className={`mt-0.5 text-xs ${stock.up ? 'text-emerald-700' : 'text-amber-700'}`}>{stock.change}</p>
              </div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                {stock.amount}
                {stock.up ? (
                  <IconChevronUp size={17} className="text-emerald-600" />
                ) : (
                  <IconChevronDown size={17} className="text-amber-600" />
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-3 text-sm font-medium text-blue-700 hover:bg-slate-50"
      >
        View All <IconChevronRight size={17} />
      </button>
    </MainCard>
  );
}

PopularCard.propTypes = { isLoading: PropTypes.bool };
