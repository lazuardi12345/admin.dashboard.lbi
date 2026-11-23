import { memo } from 'react';
import menuItems from 'menu-items';
import { useGetMenuMaster } from 'api/menu';
import { useAuth } from 'contexts/AuthContext';
import NavGroup from './NavGroup';

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened ?? false;
  const { hasRole } = useAuth();
  const visibleItems = menuItems.items.filter((item) => !item.roles?.length || hasRole(...item.roles));

  return (
    <nav aria-label="Navigasi dashboard" className="space-y-2">
      {visibleItems.map((item) => (
        <NavGroup key={item.id} item={item} drawerOpen={drawerOpen} />
      ))}
    </nav>
  );
}

export default memo(MenuList);
