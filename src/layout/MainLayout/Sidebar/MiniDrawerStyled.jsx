import PropTypes from 'prop-types';

export default function MiniDrawerStyled({ open = false, children, className = '', ...props }) {
  return (
    <aside
      className={`shrink-0 overflow-x-hidden border-r border-slate-200 bg-white transition-[width] duration-200 ${open ? 'w-64' : 'w-[4.5rem]'} ${className}`}
      {...props}
    >
      {children}
    </aside>
  );
}

MiniDrawerStyled.propTypes = { open: PropTypes.bool, children: PropTypes.node, className: PropTypes.string };
