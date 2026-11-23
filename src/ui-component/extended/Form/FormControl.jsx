import PropTypes from 'prop-types';

export default function FormControl({
  captionLabel,
  formState,
  iconPrimary,
  iconSecondary,
  placeholder,
  textPrimary,
  textSecondary,
  ...inputProps
}) {
  const PrimaryIcon = iconPrimary;
  const SecondaryIcon = iconSecondary;
  const invalid = formState === 'error';
  return (
    <label className="block w-full">
      {captionLabel && <span className="mb-1.5 block text-sm font-medium text-slate-700">{captionLabel}</span>}
      <span
        className={`flex min-h-11 items-center gap-2 rounded-md border bg-white px-3 focus-within:ring-2 ${invalid ? 'border-red-500 focus-within:ring-red-100' : 'border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-100'}`}
      >
        {PrimaryIcon && <PrimaryIcon size={18} className="shrink-0 text-slate-500" />}
        {textPrimary && <span className="shrink-0 border-r border-slate-200 pr-2 text-sm text-slate-500">{textPrimary}</span>}
        <input
          type="text"
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          {...inputProps}
        />
        {textSecondary && <span className="shrink-0 border-l border-slate-200 pl-2 text-sm text-slate-500">{textSecondary}</span>}
        {SecondaryIcon && <SecondaryIcon size={18} className="shrink-0 text-slate-500" />}
      </span>
    </label>
  );
}

FormControl.propTypes = {
  captionLabel: PropTypes.string,
  formState: PropTypes.string,
  iconPrimary: PropTypes.any,
  iconSecondary: PropTypes.any,
  placeholder: PropTypes.string,
  textPrimary: PropTypes.string,
  textSecondary: PropTypes.string
};
