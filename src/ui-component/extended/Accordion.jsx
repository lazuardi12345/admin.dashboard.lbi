import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

export default function Accordion({ data, defaultExpandedId = null, expandIcon, square = false, toggle = false }) {
  const [expanded, setExpanded] = useState(defaultExpandedId);

  useEffect(() => setExpanded(defaultExpandedId), [defaultExpandedId]);

  return (
    <div className="w-full divide-y divide-slate-200">
      {data?.map((item) => {
        const isOpen = !item.disabled && (toggle ? expanded === item.id : (item.expanded ?? item.defaultExpand));
        return (
          <section
            key={item.id}
            className={`${square ? '' : 'my-2 rounded-lg border border-slate-200'} ${item.disabled ? 'opacity-50' : ''}`}
          >
            <button
              type="button"
              disabled={item.disabled}
              aria-expanded={Boolean(isOpen)}
              onClick={() => toggle && setExpanded(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium text-slate-700 disabled:cursor-not-allowed"
            >
              <span>{item.title}</span>
              <span className="shrink-0">
                {expandIcon === false
                  ? null
                  : expandIcon || <IconChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
              </span>
            </button>
            {isOpen && <div className="px-4 pb-4 text-sm text-slate-700">{item.content}</div>}
          </section>
        );
      })}
    </div>
  );
}

Accordion.propTypes = {
  data: PropTypes.array,
  defaultExpandedId: PropTypes.any,
  expandIcon: PropTypes.node,
  square: PropTypes.bool,
  toggle: PropTypes.bool
};
