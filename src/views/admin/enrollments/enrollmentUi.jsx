import { createContext, useContext } from 'react';
import { Alert as UiAlert } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button as UiButton } from '../../../components/ui/button';
import { Card as UiCard, CardContent as UiCardContent } from '../../../components/ui/card';
import { Dialog as UiDialog, DialogContent as UiDialogContent } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import {
  Table as UiTable,
  TableBody,
  TableCell as UiTableCell,
  TableHead as UiTableHead,
  TableHeader as UiTableHeader,
  TableRow as UiTableRow
} from '../../../components/ui/table';
import { cn } from '../../../lib/utils';

const TabContext = createContext(null);
const TableHeadContext = createContext(false);

const variantClasses = {
  h1: 'text-5xl font-bold',
  h2: 'text-4xl font-bold',
  h3: 'text-4xl font-bold',
  h4: 'text-3xl font-bold',
  h5: 'text-2xl font-semibold',
  h6: 'text-xl font-semibold',
  subtitle1: 'text-base',
  subtitle2: 'text-sm',
  body1: 'text-base',
  body2: 'text-sm',
  caption: 'text-xs',
  overline: 'text-xs uppercase tracking-wide'
};

const colorClasses = {
  'text.primary': 'text-slate-900',
  'text.secondary': 'text-slate-500',
  primary: 'text-blue-700',
  'primary.main': 'text-blue-700',
  success: 'text-emerald-700',
  error: 'text-red-700',
  warning: 'text-amber-700',
  '#0f172a': 'text-slate-900',
  '#1e293b': 'text-slate-800',
  '#334155': 'text-slate-700',
  '#475569': 'text-slate-600',
  '#64748b': 'text-slate-500',
  '#94a3b8': 'text-slate-400',
  '#b45309': 'text-amber-700',
  '#047857': 'text-emerald-700',
  '#ef4444': 'text-red-500'
};

const responsiveUtilities = new Set([
  'sm:flex-row', 'sm:flex-col', 'md:flex-row', 'md:flex-col',
  'sm:items-center', 'md:items-center',
  'sm:justify-start', 'sm:justify-end', 'md:justify-start', 'md:justify-end',
  'sm:col-span-12', 'sm:col-span-8', 'sm:col-span-6', 'sm:col-span-4', 'sm:col-span-3',
  'md:col-span-12', 'md:col-span-8', 'md:col-span-6', 'md:col-span-4', 'md:col-span-3', 'md:col-span-1'
]);

const spacingClasses = {
  0.5: 'gap-1',
  1: 'gap-2',
  1.25: 'gap-2.5',
  1.5: 'gap-3',
  2: 'gap-4',
  2.5: 'gap-5',
  3: 'gap-6',
  4: 'gap-8'
};

export function Box({ className, ...props }) {
  return <div className={className} {...props} />;
}

export function Stack({
  className,
  direction = 'column',
  spacing = 0,
  alignItems,
  justifyContent,
  flexWrap,
  gap: explicitGap,
  children,
  ...props
}) {
  const responsiveClass = (value, values) => {
    if (!value || typeof value !== 'object') return '';
    return Object.entries(value)
      .map(([breakpoint, item]) => {
        const utility = values[item];
        const candidate = breakpoint === 'xs' ? utility : `${breakpoint}:${utility}`;
        return breakpoint === 'xs' || responsiveUtilities.has(candidate) ? candidate : '';
      })
      .join(' ');
  };
  const directions = { row: 'flex-row', column: 'flex-col' };
  const aligns = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch', baseline: 'items-baseline' };
  const justifies = { start: 'justify-start', 'flex-start': 'justify-start', center: 'justify-center', end: 'justify-end', 'flex-end': 'justify-end', between: 'justify-between', 'space-between': 'justify-between', around: 'justify-around' };
  const wraps = { wrap: 'flex-wrap', nowrap: 'flex-nowrap' };
  const gap = spacingClasses[explicitGap ?? spacing] || '';
  return (
    <div
      className={cn(
        'flex',
        typeof direction === 'string' ? directions[direction] : responsiveClass(direction, directions),
        typeof alignItems === 'string' ? aligns[alignItems] : responsiveClass(alignItems, aligns),
        typeof justifyContent === 'string' ? justifies[justifyContent] : responsiveClass(justifyContent, justifies),
        typeof flexWrap === 'string' ? wraps[flexWrap] : '',
        gap,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Grid({
  container,
  size,
  spacing = 0,
  alignItems,
  justifyContent,
  className,
  children,
  ...props
}) {
  const sizes = typeof size === 'number' ? { xs: size } : size || {};
  const spanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    2.5: 'col-span-3',
    3: 'col-span-3',
    4: 'col-span-4',
    6: 'col-span-6',
    8: 'col-span-8',
    12: 'col-span-12'
  };
  const columnClasses = Object.entries(sizes)
    .map(([breakpoint, span]) => {
      const utility = spanClasses[span];
      const candidate = breakpoint === 'xs' ? utility : `${breakpoint}:${utility}`;
      return breakpoint === 'xs' || responsiveUtilities.has(candidate) ? candidate : '';
    })
    .join(' ');
  const alignClasses = { start: 'items-start', center: 'items-center', end: 'items-end', stretch: 'items-stretch' };
  const justifyClasses = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between' };
  const gap = spacingClasses[spacing] || '';
  return (
    <div
      className={cn(
        container ? 'grid grid-cols-12' : '',
        container ? gap : '',
        alignClasses[alignItems],
        justifyClasses[justifyContent],
        columnClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Typography({
  className,
  variant = 'body1',
  fontWeight,
  color,
  display,
  children,
  ...props
}) {
  const Element = variant.startsWith('h') ? variant : variant === 'caption' || variant === 'overline' ? 'span' : 'p';
  const weights = { 400: 'font-normal', 500: 'font-medium', 600: 'font-semibold', 700: 'font-bold', 800: 'font-extrabold' };
  const weightClass = weights[fontWeight] || '';
  const displayClass = display === 'block' ? 'block' : display === 'inline' ? 'inline' : '';
  const colorClass = colorClasses[color] || (typeof color === 'string' && color.startsWith('#') ? `[color:${color}]` : '');
  return (
    <Element
      className={cn(variantClasses[variant] || variantClasses.body1, colorClass, weightClass, displayClass, className)}
      {...props}
    >
      {children}
    </Element>
  );
}

export function Button({ className, variant = 'text', size, fullWidth, startIcon, endIcon, children, ...props }) {
  const variants = { contained: 'default', outlined: 'outline', text: 'ghost' };
  return (
    <UiButton
      variant={variants[variant] || variant}
      size={size === 'small' ? 'sm' : size}
      className={cn(fullWidth && 'w-full', className)}
      {...props}
    >
      {startIcon}
      {children}
      {endIcon}
    </UiButton>
  );
}

export function Card({ className, children, ...props }) {
  return <UiCard className={cn(props.variant === 'outlined' && 'shadow-none', className)}>{children}</UiCard>;
}

export function CardContent({ className, children, ...props }) {
  return <UiCardContent className={cn(className)} {...props}>{children}</UiCardContent>;
}

export function Chip({ label, icon, variant, className, size, ...props }) {
  return (
    <Badge variant={variant === 'outlined' ? 'outline' : 'default'} className={cn(size === 'small' && 'px-2 py-0.5 text-xs', className)} {...props}>
      {icon}
      {label}
    </Badge>
  );
}

export function Alert({ severity = 'info', className, children, onClose, ...props }) {
  const variants = { info: 'info', success: 'success', warning: 'warning', error: 'error' };
  return (
    <UiAlert variant={variants[severity] || 'info'} className={className} {...props}>
      <div className="flex-1">{children}</div>
      {onClose && <button type="button" className="ml-auto text-current opacity-70 hover:opacity-100" aria-label="Tutup notifikasi" onClick={onClose}>×</button>}
    </UiAlert>
  );
}

export function TextField({
  select,
  label,
  fullWidth,
  size,
  type = 'text',
  multiline,
  minRows,
  helperText,
  InputProps,
  children,
  className,
  ...props
}) {
  const adornment = InputProps?.startAdornment;
  const fieldClass = cn(size === 'small' && 'h-9', className);
  const control = select ? (
    <Select className={fieldClass} {...props}>{children}</Select>
  ) : (
    <div className={cn('flex min-w-0 items-center rounded-md border border-slate-300 bg-white shadow-sm focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20', fullWidth && 'w-full')}>
      {adornment}
      <Input
        as={multiline ? 'textarea' : 'input'}
        type={multiline ? undefined : type}
        rows={multiline ? minRows : undefined}
        className={cn('border-0 shadow-none focus-visible:ring-0', multiline && 'h-auto min-h-16 resize-y', fieldClass)}
        {...props}
      />
    </div>
  );
  return (
    <label className={cn('flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700', fullWidth && 'w-full')}>
      {label && <span>{label}</span>}
      {control}
      {helperText && <span className="text-xs font-normal text-slate-500">{helperText}</span>}
    </label>
  );
}

export function MenuItem({ children, ...props }) {
  return <option {...props}>{children}</option>;
}

export function InputAdornment({ children, position }) {
  return <span className={cn('px-3 text-sm text-slate-500', position === 'start' && 'pl-3')}>{children}</span>;
}

export function FormControlLabel({ control, label }) {
  return <label className="inline-flex items-center gap-2 text-sm text-slate-700">{control}{label}</label>;
}

export function Checkbox({ checked, onChange, ...props }) {
  return <input type="checkbox" checked={checked} onChange={onChange} className="size-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600" {...props} />;
}

export function Avatar({ className, children, ...props }) {
  return <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', className)} {...props}>{children}</div>;
}

export function IconButton({ className, size, children, ...props }) {
  return <UiButton variant="ghost" size="icon" className={cn(size === 'small' && 'size-8', className)} {...props}>{children}</UiButton>;
}

export function Tooltip({ title, children }) {
  return <span title={title}>{children}</span>;
}

export function CircularProgress({ size = 24, className, ...props }) {
  const sizes = { 24: 'size-6', 32: 'size-8', 36: 'size-9' };
  return <span className={cn('inline-block animate-spin rounded-full border-4 border-current border-r-transparent align-[-0.125em]', sizes[size] || 'size-6', className)} role="status" aria-label="Memuat" {...props} />;
}

export function Pagination({ count, page, onChange, className }) {
  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Navigasi halaman">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={(event) => onChange(event, page - 1)}>Sebelumnya</Button>
      <span className="px-2 text-sm text-slate-600">Halaman {page} dari {count}</span>
      <Button variant="outline" size="sm" disabled={page >= count} onClick={(event) => onChange(event, page + 1)}>Berikutnya</Button>
    </nav>
  );
}

export function Tabs({ value, onChange, children, className }) {
  return (
    <TabContext.Provider value={{ value, onChange }}>
      <div role="tablist" className={cn('flex min-w-max items-center gap-1', className)}>{children}</div>
    </TabContext.Provider>
  );
}

export function Tab({ value, label, icon, iconPosition, children, className, ...props }) {
  const context = useContext(TabContext);
  const selected = context?.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={cn('inline-flex min-h-10 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 text-sm font-semibold text-slate-500 hover:text-slate-800', selected && 'border-blue-700 text-blue-800', className)}
      onClick={(event) => context?.onChange?.(event, value)}
      {...props}
    >
      {iconPosition === 'end'
        ? <>{label || children}{icon}</>
        : <>{icon}{label || children}</>}
    </button>
  );
}

export function Dialog({ open, onClose, maxWidth = 'sm', children, PaperProps }) {
  const widths = { xs: 'sm:max-w-lg', sm: 'sm:max-w-2xl', md: 'sm:max-w-4xl', lg: 'sm:max-w-6xl' };
  const paperClass = PaperProps?.className || 'overflow-hidden';
  return (
    <UiDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <UiDialogContent aria-label="Detail pendaftaran peserta" className={cn('flex max-h-[90vh] min-h-0 flex-col gap-0 overflow-hidden p-0 [&>button]:hidden', widths[maxWidth] || 'sm:max-w-6xl', paperClass)}>
        {children}
      </UiDialogContent>
    </UiDialog>
  );
}

export function DialogContent({ className, children, ...props }) {
  return <div className={cn('min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-6', className)} {...props}>{children}</div>;
}

export function DialogActions({ className, children, ...props }) {
  return <div className={cn('flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-4', className)} {...props}>{children}</div>;
}

export function TableContainer({ className, children }) {
  return <div className={cn('w-full overflow-x-auto rounded-lg border border-slate-200 bg-white', className)}>{children}</div>;
}

export function Paper({ className, children, ...props }) {
  return <div className={cn('bg-white', className)} {...props}>{children}</div>;
}

export function Table({ className, children, ...props }) {
  return <UiTable className={cn('min-w-[1100px]', className)} {...props}>{children}</UiTable>;
}

export function TableRow({ hover, className, ...props }) {
  return <UiTableRow className={cn(hover && 'hover:bg-slate-50', className)} {...props} />;
}

export function TableHead({ className, children, ...props }) {
  return (
    <TableHeadContext.Provider value>
      <UiTableHeader className={className} {...props}>{children}</UiTableHeader>
    </TableHeadContext.Provider>
  );
}

export function TableCell({ className, children, ...props }) {
  const isHeader = useContext(TableHeadContext);
  const Cell = isHeader ? UiTableHead : UiTableCell;
  return <Cell className={className} {...props}>{children}</Cell>;
}

export { TableBody };
