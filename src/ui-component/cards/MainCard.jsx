import PropTypes from 'prop-types';

export default function MainCard({
  border = false,
  children,
  content = true,
  contentClass = '',
  darkTitle,
  secondary,
  title,
  className = '',
  style,
  ref,
  ...others
}) {
  const domProps = Object.fromEntries(
    Object.entries(others).filter(([key]) => !['sx', 'contentSX', 'headerSX', 'boxShadow', 'shadow'].includes(key))
  );

  return (
    <section
      ref={ref}
      className={`min-w-0 rounded-xl bg-white text-slate-900 shadow-sm ${border ? 'border border-slate-200' : ''} ${className}`}
      style={style}
      {...domProps}
    >
      {title && (
        <header className="flex items-center justify-between gap-4 px-5 py-4">
          <h2 className={`min-w-0 font-semibold text-slate-900 ${darkTitle ? 'text-xl' : 'text-base'}`}>{title}</h2>
          {secondary && <div className="shrink-0">{secondary}</div>}
        </header>
      )}
      {title && <div className="h-px bg-slate-200" />}
      {content ? <div className={`p-5 ${contentClass}`}>{children}</div> : children}
    </section>
  );
}

MainCard.propTypes = {
  border: PropTypes.bool,
  boxShadow: PropTypes.bool,
  children: PropTypes.node,
  content: PropTypes.bool,
  contentClass: PropTypes.string,
  contentSX: PropTypes.object,
  headerSX: PropTypes.object,
  darkTitle: PropTypes.bool,
  secondary: PropTypes.node,
  shadow: PropTypes.string,
  sx: PropTypes.any,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  ref: PropTypes.any,
  others: PropTypes.any
};
