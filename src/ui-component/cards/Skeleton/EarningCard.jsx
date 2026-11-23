import { Card, CardContent } from '../../../components/ui/card';

export default function EarningCard() {
  return (
    <Card aria-label="Memuat kartu pendapatan">
      <CardContent className="space-y-4 p-5">
        <div className="flex justify-between">
          <div className="h-11 w-11 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="h-10 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
      </CardContent>
    </Card>
  );
}
