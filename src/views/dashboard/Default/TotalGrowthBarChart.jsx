import PropTypes from 'prop-types';
import { useState } from 'react';
import Chart from 'react-apexcharts';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import barChartOptions from './chart-data/total-growth-bar-chart';
import useConfig from 'hooks/useConfig';

const periods = [
  { value: 'today', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];
const series = [
  { name: 'Investment', data: [35, 125, 35, 35, 35, 80, 35, 20, 35, 45, 15, 75] },
  { name: 'Loss', data: [35, 15, 15, 35, 65, 40, 80, 25, 15, 85, 25, 75] },
  { name: 'Profit', data: [35, 145, 35, 35, 20, 105, 100, 10, 65, 45, 30, 10] },
  { name: 'Maintenance', data: [0, 0, 75, 0, 0, 115, 0, 0, 0, 0, 150, 0] }
];

export default function TotalGrowthBarChart({ isLoading }) {
  const [value, setValue] = useState('today');
  const {
    state: { fontFamily }
  } = useConfig();
  if (isLoading) return <SkeletonTotalGrowthBarChart />;
  const options = {
    ...barChartOptions,
    colors: ['#bfdbfe', '#1d4ed8', '#7c3aed', '#c4b5fd'],
    chart: { ...barChartOptions.chart, fontFamily, toolbar: { show: false } },
    grid: { borderColor: '#e2e8f0' },
    tooltip: { theme: 'light' }
  };

  return (
    <MainCard
      title="Total Growth"
      secondary={
        <select
          aria-label="Period"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      }
    >
      <p className="mb-3 text-2xl font-bold">$2,324.00</p>
      <Chart options={options} series={series} type="bar" height={480} />
    </MainCard>
  );
}

TotalGrowthBarChart.propTypes = { isLoading: PropTypes.bool };
