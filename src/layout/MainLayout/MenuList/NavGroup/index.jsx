import { Fragment } from 'react';
import { useGetMenuMaster } from 'api/menu';
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';

export default function NavGroup({ item, drawerOpen: drawerOpenProp }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = drawerOpenProp ?? menuMaster?.isDashboardDrawerOpened ?? false;
  const children = item.children || [];

  return (
    <section className="space-y-1">
      {drawerOpen && (
        <h2 className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {item.title}
          {item.caption && <span className="mt-1 block font-normal normal-case tracking-normal text-slate-400">{item.caption}</span>}
        </h2>
      )}
      {children.map((child) => (
        <Fragment key={child.id}>
          {child.type === 'collapse' ? (
            <NavCollapse menu={child} level={1} />
          ) : child.type === 'item' ? (
            <NavItem item={child} level={1} />
          ) : null}
        </Fragment>
      ))}
    </section>
  );
}
