import { Card, CardContent } from '../../../components/ui/card';

export default function TotalIncomeCard() {
  return (
    <Card aria-label="Memuat total pendapatan">
      <CardContent className="flex items-center gap-3 p-5">
        <div className="size-11 animate-pulse rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
        </div>
      </CardContent>
    </Card>
  );
}
