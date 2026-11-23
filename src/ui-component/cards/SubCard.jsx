import PropTypes from 'prop-types';

export default function SubCard({
  children,
  className = '',
  content = true,
  contentClass = '',
  darkTitle,
  secondary,
  title,
  actions,
  ...others
}) {
  const domProps = Object.fromEntries(Object.entries(others).filter(([key]) => !['sx', 'contentSX', 'footerSX'].includes(key)));

  return (
    <section className={`min-w-0 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm ${className}`} {...domProps}>
      {title && (
        <header className="flex items-center justify-between gap-3 p-5">
          <h3 className={`font-semibold ${darkTitle ? 'text-lg' : 'text-base'}`}>{title}</h3>
          {secondary}
        </header>
      )}
      {title && <div className="h-px bg-slate-200" />}
      {content && <div className={`p-5 ${contentClass || ''}`}>{children}</div>}
      {!content && children}
      {actions && (
        <>
          <div className="h-px bg-slate-200" />
          <footer className="p-5">{actions}</footer>
        </>
      )}
    </section>
  );
}

SubCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  content: PropTypes.bool,
  contentClass: PropTypes.string,
  darkTitle: PropTypes.bool,
  secondary: PropTypes.node,
  sx: PropTypes.any,
  contentSX: PropTypes.object,
  footerSX: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  actions: PropTypes.node,
  others: PropTypes.any
};
