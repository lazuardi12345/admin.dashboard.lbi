import PropTypes from 'prop-types';

const colors = {
  primary: 'bg-blue-700 text-white border-blue-700',
  secondary: 'bg-violet-700 text-white border-violet-700',
  success: 'bg-emerald-600 text-white border-emerald-600',
  warning: 'bg-amber-500 text-white border-amber-500',
  error: 'bg-red-600 text-white border-red-600',
  info: 'bg-sky-600 text-white border-sky-600'
};
const sizes = { badge: 'size-7 text-xs', xs: 'size-[34px]', sm: 'size-10', md: 'size-[60px]', lg: 'size-[72px]', xl: 'size-[82px]' };

export default function Avatar({
  className = '',
  color = 'primary',
  outline = false,
  size,
  variant,
  component: Component = 'div',
  children,
  src,
  alt = '',
  ...others
}) {
  const colorClass = outline
    ? `border-2 bg-white ${colors[color]?.replace('bg-', 'border-').replace('text-', 'text-') || 'border-blue-700 text-blue-700'}`
    : colors[color] || 'bg-blue-700 text-white';
  const shapeClass = variant === 'rounded' ? 'rounded-lg' : variant === 'square' ? 'rounded-none' : 'rounded-full';
  const domProps = Object.fromEntries(Object.entries(others).filter(([key]) => key !== 'sx'));
  return (
    <Component
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden ${shapeClass} font-semibold ${sizes[size] || ''} ${colorClass} ${className}`}
      {...domProps}
    >
      {src ? <img src={src} alt={alt} className="size-full object-cover" /> : children}
    </Component>
  );
}

Avatar.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  outline: PropTypes.bool,
  size: PropTypes.oneOf(['badge', 'xs', 'sm', 'md', 'lg', 'xl']),
  component: PropTypes.any,
  variant: PropTypes.oneOf(['circular', 'rounded', 'square']),
  children: PropTypes.node,
  src: PropTypes.string,
  alt: PropTypes.string,
  sx: PropTypes.any,
  others: PropTypes.any
};
