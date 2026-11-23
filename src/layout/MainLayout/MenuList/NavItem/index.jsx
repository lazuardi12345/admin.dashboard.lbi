import { Link, useLocation } from 'react-router-dom';
import { IconPointFilled } from '@tabler/icons-react';
import { useGetMenuMaster } from 'api/menu';
import { handlerDrawerOpen } from 'api/menu';

export default function NavItem({ item, level = 1, setSelectedID }) {
  const { pathname } = useLocation();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened ?? false;
  const route = String(item?.link || item?.url || '').split('?')[0];
  const selected = Boolean(route && (pathname === route || (route !== '/' && pathname.startsWith(`${route}/`))));
  const Icon = item?.icon;

  return (
    <Link
      to={item?.url || '#'}
      target={item?.target ? '_blank' : undefined}
      rel={item?.target ? 'noopener noreferrer' : undefined}
      aria-current={selected ? 'page' : undefined}
      title={!drawerOpen ? item?.title : undefined}
      onClick={() => {
        if (window.matchMedia('(max-width: 1023px)').matches) handlerDrawerOpen(false);
        setSelectedID?.('');
      }}
      className={`group flex min-h-10 items-center gap-3 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${drawerOpen ? 'px-3' : 'justify-center px-2'} ${level > 1 && drawerOpen ? 'ml-4' : ''} ${selected ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'} ${item?.disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center ${selected ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-800'}`}
      >
        {Icon ? <Icon size={20} stroke={1.7} /> : <IconPointFilled size={16} />}
      </span>
      {drawerOpen && (
        <span className="min-w-0 flex-1 truncate">
          {item?.title}
          {item?.caption && <span className="mt-0.5 block truncate text-xs font-normal text-slate-400">{item.caption}</span>}
        </span>
      )}
      {drawerOpen && item?.chip?.label && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{item.chip.label}</span>
      )}
    </Link>
  );
}
