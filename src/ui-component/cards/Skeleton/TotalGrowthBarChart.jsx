import { Card, CardContent } from '../../../components/ui/card';

export default function TotalGrowthBarChart() {
  return (
    <Card aria-label="Memuat grafik pertumbuhan">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-10 w-20 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-[30rem] animate-pulse rounded bg-slate-100" />
      </CardContent>
    </Card>
  );
}
