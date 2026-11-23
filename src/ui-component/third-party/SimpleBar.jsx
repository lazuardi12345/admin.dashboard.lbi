import PropTypes from 'prop-types';

export default function SimpleBarScroll({ children, sx, className = '', style, ...other }) {
  const dimensionStyle =
    sx && typeof sx === 'object' ? { height: sx.height, maxHeight: sx.maxHeight, overflowX: sx.overflowX, overflowY: sx.overflowY } : {};
  const domProps = Object.fromEntries(Object.entries(other).filter(([key]) => !['data-simplebar-direction'].includes(key)));
  return (
    <div
      className={`max-h-full overflow-auto overscroll-contain [scrollbar-color:#94a3b8_transparent] [scrollbar-width:thin] ${className}`}
      style={{ ...dimensionStyle, ...style }}
      {...domProps}
    >
      {children}
    </div>
  );
}

SimpleBarScroll.propTypes = { children: PropTypes.node, sx: PropTypes.any, className: PropTypes.string, style: PropTypes.object };
