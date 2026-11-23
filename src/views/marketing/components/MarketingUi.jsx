import { createElement, forwardRef } from 'react';

const colors = {
  'text.primary': '#0f172a',
  'text.secondary': '#64748b',
  'text.disabled': '#94a3b8',
  'background.paper': '#ffffff',
  'background.default': '#f8fafc',
  'divider': '#e2e8f0',
  'primary.main': '#2757a4',
  'primary.light': '#dbeafe',
  'primary.dark': '#1e3a8a',
  'success.main': '#16a34a',
  'success.light': '#dcfce7',
  'success.dark': '#166534',
  'error.main': '#dc2626',
  'warning.main': '#d97706',
  'grey.50': '#f8fafc',
  'grey.100': '#f1f5f9',
  'grey.200': '#e2e8f0'
};

function cssValue(key, value) {
  if (typeof value !== 'number') return colors[value] || value;
  if (['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'order', 'scale', 'flexGrow', 'flexShrink'].includes(key)) return value;
  if (key === 'borderRadius') return `${value * 4}px`;
  if (key === 'border') return `${value}px solid #e2e8f0`;
  if (['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'].includes(key) && value <= 1) {
    return `${value * 100}%`;
  }
  if (['p', 'pt', 'pb', 'pl', 'pr', 'px', 'py', 'm', 'mt', 'mb', 'ml', 'mr', 'mx', 'my', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'gap', 'rowGap', 'columnGap'].includes(key)) {
    return `${value * 8}px`;
  }
  return `${value}px`;
}

function styleObject(style = {}) {
  const result = {};
  const spacing = { p: 'padding', pt: 'paddingTop', pb: 'paddingBottom', pl: 'paddingLeft', pr: 'paddingRight', m: 'margin', mt: 'marginTop', mb: 'marginBottom', ml: 'marginLeft', mr: 'marginRight' };
  Object.entries(style).forEach(([key, value]) => {
    if (value && typeof value === 'object') value = value.xs ?? value;
    if (value == null || typeof value === 'object') return;
    const aliases = { bgcolor: 'backgroundColor', mx: 'marginLeft', my: 'marginTop', px: 'paddingLeft', py: 'paddingTop' };
    const property = aliases[key] || spacing[key] || key;
    const cssProperty = property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
    const resolved = cssValue(key, value);
    result[cssProperty] = resolved;
    if (key === 'mx') result['margin-right'] = resolved;
    if (key === 'my') result['margin-bottom'] = resolved;
    if (key === 'px') result['padding-right'] = resolved;
    if (key === 'py') result['padding-bottom'] = resolved;
  });
  return result;
}

const gridSpanClasses = [
  'col-span-1 col-span-2 col-span-3 col-span-4 col-span-5 col-span-6 col-span-7 col-span-8 col-span-9 col-span-10 col-span-11 col-span-12',
  'sm:col-span-1 sm:col-span-2 sm:col-span-3 sm:col-span-4 sm:col-span-5 sm:col-span-6 sm:col-span-7 sm:col-span-8 sm:col-span-9 sm:col-span-10 sm:col-span-11 sm:col-span-12',
  'md:col-span-1 md:col-span-2 md:col-span-3 md:col-span-4 md:col-span-5 md:col-span-6 md:col-span-7 md:col-span-8 md:col-span-9 md:col-span-10 md:col-span-11 md:col-span-12',
  'lg:col-span-1 lg:col-span-2 lg:col-span-3 lg:col-span-4 lg:col-span-5 lg:col-span-6 lg:col-span-7 lg:col-span-8 lg:col-span-9 lg:col-span-10 lg:col-span-11 lg:col-span-12',
  'xl:col-span-1 xl:col-span-2 xl:col-span-3 xl:col-span-4 xl:col-span-5 xl:col-span-6 xl:col-span-7 xl:col-span-8 xl:col-span-9 xl:col-span-10 xl:col-span-11 xl:col-span-12'
].join(' ').split(' ');

function element(tag, defaultClass = '') {
  return forwardRef(({ component, className = '', style, sx, ...props }, ref) => {
    const Component = component || tag;
    return createElement(Component, {
      ...props,
      ref,
      className: `${defaultClass} ${className}`.trim(),
      style: styleObject(style || sx)
    });
  });
}

export const Box = element('div');
export const Stack = forwardRef(({ direction = 'column', spacing = 0, alignItems, justifyContent, className = '', sx, style, ...props }, ref) => {
  const gap = typeof spacing === 'number' ? spacing * 8 : spacing;
  const directionAtSmall = typeof direction === 'object' ? direction.sm : null;
  const resolvedDirection = typeof direction === 'object' ? direction.xs || 'column' : direction;
  return createElement('div', {
    ...props,
    ref,
    className: `flex ${resolvedDirection === 'row' ? 'flex-row' : 'flex-col'} ${directionAtSmall === 'row' ? 'sm:flex-row' : directionAtSmall === 'column' ? 'sm:flex-col' : ''} ${className}`.trim(),
    style: { display: 'flex', flexDirection: resolvedDirection === 'row' ? 'row' : 'column', alignItems: typeof alignItems === 'object' ? alignItems.xs : alignItems, justifyContent, gap, ...styleObject(style || sx) }
  });
});
export const Grid = forwardRef(({ container, item, size, spacing = 0, className = '', sx, style, ...props }, ref) => {
  const spans = size && typeof size === 'object' ? Object.entries(size) : [];
  const responsiveSpanClasses = spans.map(([breakpoint, span]) => {
    const prefix = { sm: 'sm:', md: 'md:', lg: 'lg:', xl: 'xl:' }[breakpoint] || '';
    return gridSpanClasses.find((className) => className === `${prefix}col-span-${span}`) || '';
  }).join(' ');
  return createElement('div', {
    ...props,
    ref,
    className: `${container ? 'grid grid-cols-12' : ''} ${!container ? responsiveSpanClasses : ''} ${className}`.trim(),
    style: {
      display: container ? 'grid' : undefined,
      gridTemplateColumns: container ? `repeat(12, minmax(0, 1fr))` : undefined,
      gap: container ? (typeof spacing === 'number' ? spacing * 8 : spacing) : undefined,
      ...styleObject(style || sx)
    }
  });
});
export const Typography = forwardRef(({ variant = 'body1', color, className = '', sx, style, ...props }, ref) => {
  const tags = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6', subtitle1: 'h6', subtitle2: 'h6', body1: 'p', body2: 'p', caption: 'span', overline: 'span' };
  const styles = { h1: 'text-3xl font-bold', h2: 'text-2xl font-bold', h3: 'text-xl font-bold', h4: 'text-lg font-bold', h5: 'text-base font-bold', h6: 'text-sm font-bold', subtitle1: 'text-base', subtitle2: 'text-sm', body1: 'text-base', body2: 'text-sm', caption: 'text-xs', overline: 'text-xs uppercase tracking-wider' };
  return createElement(tags[variant] || 'p', {
    ...props,
    ref,
    className: `${styles[variant] || ''} ${className}`.trim(),
    style: { color: colors[color] || color, ...styleObject(style || sx) }
  });
});
export const Button = forwardRef(({ variant = 'text', color = 'primary', size, startIcon, endIcon, disabled, className = '', sx, style, component, ...props }, ref) => {
  const Tag = component || 'button';
  return createElement(Tag, {
    ...props,
    ref,
    disabled,
    className: `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variant === 'contained' ? 'bg-blue-700 text-white hover:bg-blue-800' : variant === 'outlined' ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50' : 'text-blue-700 hover:bg-blue-50'} ${size === 'small' ? 'px-3 py-1.5 text-xs' : ''} ${color === 'error' ? 'text-red-700' : ''} ${className}`.trim(),
    style: styleObject(style || sx),
    ...(Tag === 'button' ? { type: props.type || 'button' } : {})
  }, startIcon, props.children, endIcon);
});
export const Card = element('section', 'rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm');
export const CardContent = element('div', 'p-6');
export const CardActions = element('div', 'flex items-center gap-2 p-4');
export const CardHeader = element('header', 'p-5');
export const Paper = element('div', 'rounded-xl bg-white shadow-sm');
export const TableContainer = element('div', 'w-full overflow-x-auto');
export const Table = element('table', 'w-full border-collapse text-sm');
export const TableHead = element('thead', 'bg-slate-50');
export const TableBody = element('tbody');
export const TableRow = element('tr', 'border-b border-slate-200');
export const TableCell = element('td', 'px-4 py-3 text-left align-middle');
export const Divider = element('hr', 'border-0 border-t border-slate-200');
export const CircularProgress = element('span', 'inline-block size-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700');
export const Chip = forwardRef(({ label, color, size, className = '', sx, style, ...props }, ref) => (
  <span ref={ref} className={`inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ${color === 'success' ? 'bg-emerald-100 text-emerald-800' : color === 'error' ? 'bg-red-100 text-red-800' : ''} ${size === 'small' ? 'px-2 py-0.5 text-[0.7rem]' : ''} ${className}`} style={styleObject(style || sx)} {...props}>
    {label}
  </span>
));
export const Alert = forwardRef(({ severity = 'info', className = '', children, onClose, sx, style, ...props }, ref) => (
  <div ref={ref} role="alert" className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${severity === 'error' ? 'border-red-200 bg-red-50 text-red-900' : severity === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : severity === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-blue-200 bg-blue-50 text-blue-900'} ${className}`} style={styleObject(style || sx)} {...props}>
    <span>{children}</span>{onClose && <button type="button" aria-label="Tutup notifikasi" onClick={onClose}>×</button>}
  </div>
));
export const IconButton = forwardRef(({ size, color, className = '', sx, style, ...props }, ref) => (
  <button ref={ref} type="button" className={`inline-grid size-9 place-items-center rounded-full text-slate-600 hover:bg-slate-100 ${color === 'error' ? 'text-red-600' : ''} ${className}`} style={styleObject(style || sx)} {...props} />
));
export const Tooltip = ({ title, children }) => createElement('span', { title }, children);
export const Avatar = ({ src, alt, children, className = '' }) => <span className={`inline-grid size-10 place-items-center overflow-hidden rounded-full bg-slate-100 ${className}`}>{src ? <img src={src} alt={alt || ''} className="size-full object-cover" /> : children}</span>;
export const TextField = forwardRef(({ label, helperText, fullWidth, multiline, minRows = 3, InputProps = {}, inputProps = {}, sx, style, className = '', ...props }, ref) => {
  const Input = multiline ? 'textarea' : 'input';
  return (
    <label className={`block space-y-1.5 text-sm font-medium text-slate-700 ${fullWidth ? 'w-full' : ''} ${className}`} style={styleObject(style || sx)}>
      {label && <span>{label}{props.required && <span className="ml-1 text-red-600">*</span>}</span>}
      <span className="relative flex items-center">
        {InputProps.startAdornment && <span className="absolute left-3 z-10 text-slate-400">{InputProps.startAdornment}</span>}
        <Input ref={ref} rows={multiline ? minRows : undefined} {...inputProps} {...props} className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:opacity-50 ${InputProps.startAdornment ? 'pl-10' : ''}`} />
        {InputProps.endAdornment && <span className="absolute right-3 text-slate-400">{InputProps.endAdornment}</span>}
      </span>
      {helperText && <span className="block text-xs font-normal text-slate-500">{helperText}</span>}
    </label>
  );
});
export const FormControl = element('div', 'w-full space-y-1.5');
export const InputLabel = element('label', 'block text-sm font-medium text-slate-700');
export const InputAdornment = ({ children }) => <>{children}</>;
export const MenuItem = forwardRef(({ value, children, ...props }, ref) => <option ref={ref} value={value} {...props}>{children}</option>);
export const Select = forwardRef(({ label, value, onChange, children, className = '', sx, style, ...props }, ref) => (
  <select ref={ref} value={value} onChange={onChange} className={`h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${className}`} style={styleObject(style || sx)} {...props}>{children}</select>
));
export const Switch = forwardRef(({ checked, onChange, disabled, className = '', sx, style, ...props }, ref) => (
  <input ref={ref} type="checkbox" role="switch" checked={Boolean(checked)} onChange={(event) => onChange?.(event, event.target.checked)} disabled={disabled} className={`size-5 accent-emerald-600 ${className}`} style={styleObject(style || sx)} {...props} />
));
export const FormControlLabel = ({ control, label }) => <label className="inline-flex items-center gap-2">{control}{label}</label>;
export const Checkbox = forwardRef(({ checked, onChange, className = '', ...props }, ref) => <input ref={ref} type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange?.(event, event.target.checked)} className={`size-4 accent-blue-700 ${className}`} {...props} />);
export const Dialog = ({ open, onClose, children }) => open ? <div className="fixed inset-0 z-[1300] grid place-items-center overflow-y-auto bg-slate-950/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}><div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">{children}</div></div> : null;
export const DialogTitle = element('h2', 'text-lg font-bold text-slate-900');
export const DialogContent = element('div', 'py-3 text-sm text-slate-700');
export const DialogActions = element('footer', 'flex justify-end gap-2 border-t border-slate-200 pt-4');
