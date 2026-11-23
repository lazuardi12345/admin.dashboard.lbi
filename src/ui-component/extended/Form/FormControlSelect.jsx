import PropTypes from 'prop-types';
import { useState } from 'react';

export default function FormControlSelect({
  captionLabel,
  currencies = [],
  formState,
  iconPrimary,
  iconSecondary,
  selected,
  textPrimary,
  textSecondary,
  onChange,
  ...selectProps
}) {
  const [value, setValue] = useState(selected || '');
  const PrimaryIcon = iconPrimary;
  const SecondaryIcon = iconSecondary;
  const invalid = formState === 'error';

  const handleChange = (event) => {
    if (event.target.value) setValue(event.target.value);
    onChange?.(event);
  };

  return (
    <label className="block w-full">
      {captionLabel && <span className="mb-1.5 block text-sm font-medium text-slate-700">{captionLabel}</span>}
      <span
        className={`flex min-h-11 items-center gap-2 rounded-md border bg-white px-3 focus-within:ring-2 ${invalid ? 'border-red-500 focus-within:ring-red-100' : 'border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-100'}`}
      >
        {PrimaryIcon && <PrimaryIcon size={18} className="shrink-0 text-slate-500" />}
        {textPrimary && <span className="shrink-0 border-r border-slate-200 pr-2 text-sm text-slate-500">{textPrimary}</span>}
        <select
          value={value}
          onChange={handleChange}
          aria-invalid={invalid || undefined}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-800 outline-none"
          {...selectProps}
        >
          <option value="" disabled>
            {captionLabel || 'Select an option'}
          </option>
          {currencies.map((option, index) => (
            <option key={option.value ?? index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {textSecondary && <span className="shrink-0 border-l border-slate-200 pl-2 text-sm text-slate-500">{textSecondary}</span>}
        {SecondaryIcon && <SecondaryIcon size={18} className="shrink-0 text-slate-500" />}
      </span>
    </label>
  );
}

FormControlSelect.propTypes = {
  captionLabel: PropTypes.string,
  currencies: PropTypes.array,
  formState: PropTypes.string,
  iconPrimary: PropTypes.any,
  iconSecondary: PropTypes.any,
  selected: PropTypes.string,
  textPrimary: PropTypes.string,
  textSecondary: PropTypes.string,
  onChange: PropTypes.func
};
