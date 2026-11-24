import { IconMenu2 } from '@tabler/icons-react';
import SearchSection from './SearchSection';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

export default function Header() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened ?? false;

  return (
    <header className="fixed inset-x-0 top-0 z-[1200] flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-3 shadow-sm sm:px-5">
      <div className="flex min-w-0 items-center gap-3 lg:w-64">
        <button
          type="button"
          aria-label={drawerOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={drawerOpen}
          onClick={() => handlerDrawerOpen(!drawerOpen)}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <IconMenu2 size={21} />
        </button>
      </div>
      <div className="hidden min-w-0 flex-1 md:block">
        <SearchSection />
      </div>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <div className="md:hidden">
          <SearchSection compact />
        </div>
        <NotificationSection />
        <ProfileSection />
      </div>
    </header>
  );
}
