import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import bajajChartOptions from './chart-data/bajaj-area-chart';
import useConfig from 'hooks/useConfig';

export default function BajajAreaChartCard() {
  const {
    state: { fontFamily }
  } = useConfig();
  const [chartOptions, setChartOptions] = useState(bajajChartOptions);
  const [series] = useState([{ data: [0, 15, 10, 50, 30, 40, 25] }]);

  useEffect(() => {
    setChartOptions({
      ...bajajChartOptions,
      chart: { ...bajajChartOptions.chart, fontFamily },
      colors: ['#6d28d9'],
      fill: {
        gradient: {
          colorStops: [
            [
              { offset: 0, color: '#6d28d9', opacity: 0.4 },
              { offset: 100, color: '#6d28d9', opacity: 0.1 }
            ]
          ]
        }
      },
      theme: { mode: 'light' }
    });
  }, [fontFamily]);

  return (
    <article className="mt-2 rounded-xl bg-violet-100 p-4 text-slate-800">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Bajaj Finery</h2>
        <p className="text-lg font-bold">$1839.00</p>
      </div>
      <p className="mt-1 text-xs text-slate-600">10% Profit</p>
      <Chart options={chartOptions} series={series} type="area" height={95} />
    </article>
  );
}
