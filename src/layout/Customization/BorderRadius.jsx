import useConfig from 'hooks/useConfig';

export default function BorderRadius() {
  const {
    state: { borderRadius },
    setField
  } = useConfig();

  return (
    <section className="space-y-4 p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Border Radius</h3>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">4px</span>
        <input
          type="range"
          min="4"
          max="24"
          step="1"
          value={borderRadius}
          onChange={(event) => setField('borderRadius', Number(event.target.value))}
          aria-label="Border radius"
          aria-valuetext={`${borderRadius}px`}
          className="w-full accent-blue-700"
        />
        <span className="text-xs text-slate-500">24px</span>
        <output className="w-10 text-right text-xs font-medium text-slate-700">{borderRadius}px</output>
      </div>
    </section>
  );
}
