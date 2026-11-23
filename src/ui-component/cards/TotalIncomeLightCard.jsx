import PropTypes from 'prop-types';
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

export default function TotalIncomeLightCard({ isLoading, total, icon, label }) {
  if (isLoading) return <TotalIncomeCard />;
  const isError = label === 'Meeting attends';
  return (
    <MainCard
      content={false}
      className={`relative overflow-hidden before:absolute before:-right-20 before:-top-28 before:size-56 before:rounded-full ${isError ? 'before:bg-red-100' : 'before:bg-amber-100'}`}
    >
      <div className="relative flex items-center gap-3 p-5">
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}
        >
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold">${total}k</p>
          <p className="mt-1 text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </MainCard>
  );
}

TotalIncomeLightCard.propTypes = { isLoading: PropTypes.bool, total: PropTypes.number, icon: PropTypes.node, label: PropTypes.string };
