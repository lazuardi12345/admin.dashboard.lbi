import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const sample =
  'Lorem ipsum dolor sit connecter adieu siccing eliot. Quos blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur.';

export default function UtilitiesTypography() {
  return (
    <main className="space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Typography</h1>
        <p className="mt-1 text-sm text-slate-500">Type scale and text styles.</p>
      </header>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-5">
            <CardTitle>Heading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            {['text-5xl', 'text-4xl', 'text-3xl', 'text-2xl', 'text-xl', 'text-lg'].map((size, index) => (
              <p key={size} className={`${size} font-semibold text-slate-900`}>
                h{index + 1}. Heading
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <CardTitle>Sub title</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <p className="text-base font-semibold text-slate-800">subtitle1. {sample}</p>
            <p className="text-sm font-medium text-slate-700">subtitle2. {sample}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <CardTitle>Body</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <p className="text-base leading-7 text-slate-700">body1. {sample}</p>
            <p className="text-sm leading-6 text-slate-600">body2. {sample}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-5">
            <CardTitle>Extra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <p className="text-sm font-bold uppercase">Button text</p>
            <p className="text-xs text-slate-500">caption text</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">overline text</p>
            <a
              href="https://berrydashboard.com"
              target="_blank"
              rel="noreferrer"
              className="block text-sm text-blue-700 underline decoration-transparent hover:decoration-current"
            >
              https://berrydashboard.com
            </a>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
