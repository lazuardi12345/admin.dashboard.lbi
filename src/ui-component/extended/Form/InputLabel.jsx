import PropTypes from 'prop-types';

export default function InputLabel({ children, horizontal = false, className = '', ...props }) {
  return (
    <label className={`block text-sm font-medium text-slate-700 ${horizontal ? 'mb-0' : 'mb-2'} ${className}`} {...props}>
      {children}
    </label>
  );
}

InputLabel.propTypes = { children: PropTypes.node, horizontal: PropTypes.bool, className: PropTypes.string };
