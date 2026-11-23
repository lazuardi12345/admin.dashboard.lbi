import PropTypes from 'prop-types';
import { IconTable } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import TotalIncomeCard from 'ui-component/cards/Skeleton/TotalIncomeCard';

export default function TotalIncomeDarkCard({ isLoading }) {
  if (isLoading) return <TotalIncomeCard />;
  return (
    <MainCard
      content={false}
      className="relative overflow-hidden bg-blue-950 text-white before:absolute before:-right-20 before:-top-28 before:size-56 before:rounded-full before:bg-blue-800/60"
    >
      <div className="relative flex items-center gap-3 p-5">
        <span className="flex size-11 items-center justify-center rounded-lg bg-blue-800">
          <IconTable size={20} />
        </span>
        <div>
          <p className="text-2xl font-bold">$203k</p>
          <p className="mt-1 text-sm text-blue-200">Total Income</p>
        </div>
      </div>
    </MainCard>
  );
}

TotalIncomeDarkCard.propTypes = { isLoading: PropTypes.bool };
