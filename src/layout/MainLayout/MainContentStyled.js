import PropTypes from 'prop-types';

export default function MainContentStyled({ children, open, borderRadius = 12, className = '', ...props }) {
  const domProps = Object.fromEntries(Object.entries(props).filter(([key]) => !['sx'].includes(key)));
  return (
    <main
      className={`min-w-0 flex-1 bg-slate-100 p-4 pt-24 transition-[margin] duration-200 ${open ? 'md:ml-0' : 'md:-ml-44'} ${className}`}
      style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
      {...domProps}
    >
      {children}
    </main>
  );
}

MainContentStyled.propTypes = {
  children: PropTypes.node,
  open: PropTypes.bool,
  borderRadius: PropTypes.number,
  className: PropTypes.string
};
