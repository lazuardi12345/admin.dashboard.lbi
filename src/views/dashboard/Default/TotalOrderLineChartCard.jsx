import PropTypes from 'prop-types';
import { useState } from 'react';
import Chart from 'react-apexcharts';
import { IconArrowDownRight, IconShoppingBag } from '@tabler/icons-react';
import SkeletonTotalOrderCard from 'ui-component/cards/Skeleton/EarningCard';
import chartOptions from './chart-data/total-order-line-chart';

const monthlyData = [{ data: [45, 66, 41, 89, 25, 44, 9, 54] }];
const yearlyData = [{ data: [35, 44, 9, 54, 45, 66, 41, 69] }];

export default function TotalOrderLineChartCard({ isLoading }) {
  const [monthly, setMonthly] = useState(false);
  const series = monthly ? monthlyData : yearlyData;
  if (isLoading) return <SkeletonTotalOrderCard />;

  return (
    <article className="relative overflow-hidden rounded-xl bg-blue-950 p-5 text-white">
      <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-blue-800/70" />
      <div className="relative flex items-center justify-between">
        <span className="flex size-11 items-center justify-center rounded-lg bg-blue-800">
          <IconShoppingBag size={21} />
        </span>
        <div className="flex rounded-lg bg-blue-900 p-1">
          <button
            type="button"
            aria-pressed={monthly}
            onClick={() => setMonthly(true)}
            className={`rounded px-3 py-1 text-xs ${monthly ? 'bg-blue-700 text-white' : 'text-blue-200'}`}
          >
            Month
          </button>
          <button
            type="button"
            aria-pressed={!monthly}
            onClick={() => setMonthly(false)}
            className={`rounded px-3 py-1 text-xs ${!monthly ? 'bg-blue-700 text-white' : 'text-blue-200'}`}
          >
            Year
          </button>
        </div>
      </div>
      <div className="relative mt-3 grid grid-cols-2 items-end gap-2">
        <div>
          <p className="flex items-center gap-2 text-3xl font-semibold">
            {monthly ? '$108' : '$961'}
            <IconArrowDownRight className="rounded-full bg-blue-200 p-1 text-blue-900" size={23} />
          </p>
          <p className="mt-1 text-sm text-blue-200">Total Order</p>
        </div>
        <Chart options={chartOptions} series={series} type="line" height={90} />
      </div>
    </article>
  );
}

TotalOrderLineChartCard.propTypes = { isLoading: PropTypes.bool };
