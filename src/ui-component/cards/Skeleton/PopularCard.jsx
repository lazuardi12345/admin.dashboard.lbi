import { Card, CardContent } from '../../../components/ui/card';

export default function PopularCard() {
  return (
    <Card aria-label="Memuat kursus populer">
      <CardContent className="space-y-4 p-5">
        <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-36 animate-pulse rounded-lg bg-slate-100" />
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex justify-between">
            <div className="h-4 w-2/5 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/5 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
