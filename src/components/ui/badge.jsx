import { cn } from '../../lib/utils';

const variants = {
  default: 'border-transparent bg-blue-100 text-blue-800',
  success: 'border-transparent bg-emerald-100 text-emerald-800',
  warning: 'border-transparent bg-amber-100 text-amber-900',
  destructive: 'border-transparent bg-red-100 text-red-800',
  outline: 'border-slate-300 bg-white text-slate-700'
};

export function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}
