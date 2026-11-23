import useConfig from 'hooks/useConfig';

const fonts = [
  { value: "'Inter', sans-serif", label: 'Inter' },
  { value: "'Poppins', sans-serif", label: 'Poppins' },
  { value: "'Roboto', sans-serif", label: 'Roboto' }
];

export default function FontFamilyPage() {
  const {
    state: { fontFamily },
    setField
  } = useConfig();

  return (
    <fieldset className="space-y-3 p-4">
      <legend className="text-sm font-bold uppercase tracking-wide text-slate-700">Font Style</legend>
      {fonts.map((font) => (
        <label
          key={font.value}
          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${fontFamily === font.value ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          style={{ fontFamily: font.value }}
        >
          <input
            type="radio"
            name="font-family"
            value={font.value}
            checked={fontFamily === font.value}
            onChange={(event) => setField('fontFamily', event.target.value)}
            className="accent-blue-700"
          />
          <span className="font-semibold">{font.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
