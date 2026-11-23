import PropTypes from 'prop-types';

export default function CustomFormControl({ children, fullWidth = true, error = false, className = '', ...props }) {
  const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !['variant', 'margin', 'size'].includes(key)));
  return (
    <div className={`${fullWidth ? 'w-full' : ''} my-2 ${error ? 'text-red-600' : ''} ${className}`} {...domProps}>
      {children}
    </div>
  );
}

CustomFormControl.propTypes = { children: PropTypes.node, fullWidth: PropTypes.bool, error: PropTypes.bool, className: PropTypes.string };
