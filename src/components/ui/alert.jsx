import { cn } from '../../lib/utils';

const variants = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  error: 'border-red-200 bg-red-50 text-red-900'
};

export function Alert({ className, variant = 'info', children, ...props }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
        variants[variant] || variants.info,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
