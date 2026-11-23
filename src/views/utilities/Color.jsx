import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const palettes = [
  {
    title: 'Primary',
    colors: [
      'bg-blue-50 text-blue-900',
      'bg-blue-100 text-blue-900',
      'bg-blue-200 text-blue-900',
      'bg-blue-500 text-white',
      'bg-blue-700 text-white'
    ]
  },
  {
    title: 'Secondary',
    colors: [
      'bg-violet-50 text-violet-900',
      'bg-violet-100 text-violet-900',
      'bg-violet-200 text-violet-900',
      'bg-violet-500 text-white',
      'bg-violet-700 text-white'
    ]
  },
  {
    title: 'Success',
    colors: [
      'bg-emerald-50 text-emerald-900',
      'bg-emerald-100 text-emerald-900',
      'bg-emerald-200 text-emerald-900',
      'bg-emerald-500 text-white',
      'bg-emerald-700 text-white'
    ]
  },
  {
    title: 'Warning',
    colors: [
      'bg-amber-50 text-amber-900',
      'bg-amber-100 text-amber-900',
      'bg-amber-200 text-amber-900',
      'bg-amber-500 text-white',
      'bg-amber-700 text-white'
    ]
  },
  {
    title: 'Error',
    colors: [
      'bg-red-50 text-red-900',
      'bg-red-100 text-red-900',
      'bg-red-200 text-red-900',
      'bg-red-500 text-white',
      'bg-red-700 text-white'
    ]
  },
  {
    title: 'Neutral',
    colors: [
      'bg-slate-50 text-slate-900',
      'bg-slate-100 text-slate-900',
      'bg-slate-200 text-slate-900',
      'bg-slate-500 text-white',
      'bg-slate-700 text-white'
    ]
  }
];

export default function UtilitiesColor() {
  return (
    <main className="space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Color Palette</h1>
        <p className="mt-1 text-sm text-slate-500">Palet warna yang digunakan untuk status dan hierarki antarmuka.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {palettes.map((palette) => (
          <Card key={palette.title}>
            <CardHeader className="p-5">
              <CardTitle>{palette.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-5 gap-2 px-5 pb-5">
              {palette.colors.map((color, index) => (
                <div key={color} className={`flex h-20 items-end rounded-lg p-2 text-xs font-semibold ${color}`}>
                  {index * 100 || 50}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
