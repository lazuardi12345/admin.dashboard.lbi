import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import navigation from 'menu-items';

function findRoute(items, pathname) {
  for (const group of items || []) {
    for (const item of group.children || []) {
      const path = String(item.url || item.link || '').split('?')[0];
      if (path && (pathname === path || pathname.startsWith(`${path}/`))) return { group, item };
      const nested = findRoute([item], pathname);
      if (nested) return nested;
    }
  }
  return null;
}

export default function Breadcrumbs({ title = true, heading, card = true, custom = false, links }) {
  const { pathname } = useLocation();
  const match = findRoute(navigation.items, pathname);
  const pageTitle =
    heading || match?.item?.title || match?.group?.title || pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') || 'Dashboard';
  const crumbs =
    custom && links?.length
      ? links
      : [{ title: 'Dashboard', to: '/' }, ...(match?.group ? [{ title: match.group.title }] : []), { title: pageTitle }];

  return (
    <section className={`mb-4 min-w-0 ${card ? 'rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5' : 'px-1 py-2'}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {title && <h1 className="text-xl font-semibold capitalize text-slate-900">{pageTitle}</h1>}
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap text-xs text-slate-500">
          {crumbs.map((crumb, index) => {
            const label = crumb.title || crumb.name || crumb.label;
            const target = crumb.to || crumb.url;
            return (
              <span key={`${label}-${index}`} className="inline-flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {target && index < crumbs.length - 1 ? (
                  <Link to={target} className="hover:text-blue-700">
                    {label}
                  </Link>
                ) : (
                  <span
                    aria-current={index === crumbs.length - 1 ? 'page' : undefined}
                    className={index === crumbs.length - 1 ? 'font-medium text-slate-700' : ''}
                  >
                    {label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

Breadcrumbs.propTypes = {
  card: PropTypes.bool,
  custom: PropTypes.bool,
  heading: PropTypes.string,
  links: PropTypes.array,
  title: PropTypes.bool,
  others: PropTypes.any
};
