import { useLocation } from 'react-router-dom';
import { IconChevronDown } from '@tabler/icons-react';
import NavItem from '../NavItem';
import { useGetMenuMaster } from 'api/menu';

export default function NavCollapse({ menu, level = 1 }) {
  const { pathname } = useLocation();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened ?? false;
  const matches = (entry) => {
    const path = String(entry?.link || entry?.url || '').split('?')[0];
    return Boolean(path && (pathname === path || pathname.startsWith(`${path}/`))) || Boolean(entry?.children?.some(matches));
  };
  const Icon = menu.icon;

  return (
    <details className="group" open={matches(menu)}>
      <summary
        title={!drawerOpen ? menu.title : undefined}
        className={`flex min-h-10 cursor-pointer list-none items-center gap-3 rounded-lg text-sm transition-colors hover:bg-slate-100 ${drawerOpen ? 'px-3' : 'justify-center px-2'} ${matches(menu) ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600'}`}
      >
        <span className="flex size-8 shrink-0 items-center justify-center">
          {Icon ? <Icon size={20} /> : <span className="size-1.5 rounded-full bg-current" />}
        </span>
        {drawerOpen && <span className="min-w-0 flex-1 truncate">{menu.title}</span>}
        {drawerOpen && <IconChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" />}
      </summary>
      <div className="ml-3 mt-1 space-y-1 border-l border-blue-100 pl-2">
        {(menu.children || []).map((item) =>
          item.type === 'collapse' ? (
            <NavCollapse key={item.id} menu={item} level={level + 1} />
          ) : (
            <NavItem key={item.id} item={item} level={level + 1} />
          )
        )}
      </div>
    </details>
  );
}
