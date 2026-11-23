import PropTypes from 'prop-types';

export default function Transitions({ children, position = 'top-left', sx, type = 'grow', direction = 'up', in: isIn = true, ...others }) {
  const origins = {
    'top-right': 'origin-top-right',
    top: 'origin-top',
    'bottom-left': 'origin-bottom-left',
    'bottom-right': 'origin-bottom-right',
    bottom: 'origin-bottom',
    'top-left': 'origin-top-left'
  };
  const animations = {
    grow: isIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
    zoom: isIn ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
    fade: isIn ? 'opacity-100' : 'opacity-0',
    slide: isIn
      ? 'translate-x-0 translate-y-0 opacity-100'
      : `${direction === 'left' ? '-translate-x-2' : direction === 'right' ? 'translate-x-2' : direction === 'down' ? 'translate-y-2' : '-translate-y-2'} opacity-0`,
    collapse: isIn ? 'max-h-[1000px] opacity-100' : 'max-h-0 overflow-hidden opacity-0'
  };
  const domProps = Object.fromEntries(
    Object.entries(others).filter(([key]) => !['timeout', 'appear', 'unmountOnExit', 'mountOnEnter', 'onEnter', 'onExited'].includes(key))
  );
  return (
    <div
      className={`transition-all duration-200 ease-out ${origins[position] || origins['top-left']} ${animations[type] || animations.grow}`}
      style={sx}
      {...domProps}
    >
      {children}
    </div>
  );
}

Transitions.propTypes = {
  children: PropTypes.node,
  position: PropTypes.string,
  sx: PropTypes.any,
  type: PropTypes.string,
  direction: PropTypes.oneOf(['up', 'right', 'left', 'down']),
  in: PropTypes.bool,
  others: PropTypes.any
};
