import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const shadows = ['shadow-none', 'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'];
const colored = [
  ['Primary', 'shadow-lg shadow-blue-500/25', 'bg-blue-600'],
  ['Secondary', 'shadow-lg shadow-violet-500/25', 'bg-violet-600'],
  ['Success', 'shadow-lg shadow-emerald-500/25', 'bg-emerald-600'],
  ['Warning', 'shadow-lg shadow-amber-500/25', 'bg-amber-500'],
  ['Error', 'shadow-lg shadow-red-500/25', 'bg-red-600'],
  ['Neutral', 'shadow-lg shadow-slate-500/25', 'bg-slate-600']
];

export default function UtilitiesShadow() {
  return (
    <main className="space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Shadow</h1>
        <p className="mt-1 text-sm text-slate-500">Elevation and colored shadow tokens.</p>
      </header>
      <Card>
        <CardHeader className="p-5">
          <CardTitle>Basic Shadow</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-4">
          {shadows.map((shadow, index) => (
            <div
              key={shadow}
              className={`flex min-h-24 items-center justify-center rounded-lg border border-slate-100 bg-white text-sm text-slate-600 ${shadow}`}
            >
              shadow {index}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-5">
          <CardTitle>Color Shadow</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">
          {colored.map(([label, shadow, color]) => (
            <div
              key={label}
              className={`flex min-h-24 items-center justify-center rounded-lg text-sm font-semibold text-white ${color} ${shadow}`}
            >
              {label}
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
