import { useGetMenuMaster, handlerDrawerOpen } from 'api/menu';
import MenuList from '../MenuList';
import LogoSection from '../LogoSection';

export default function Sidebar({ isMobile }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened ?? false;

  if (isMobile) {
    return (
      <>
        {drawerOpen && (
          <button
            type="button"
            aria-label="Tutup navigasi"
            onClick={() => handlerDrawerOpen(false)}
            className="fixed inset-16 z-[1098] bg-slate-950/40"
          />
        )}
        <aside
          className={`fixed bottom-0 left-0 top-16 z-[1099] w-[17rem] overflow-y-auto border-r border-slate-200 bg-white px-4 py-4 shadow-xl transition-transform ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
          aria-label="Navigasi utama"
        >
          <div className="mb-5 px-2">
            <LogoSection />
          </div>
          <MenuList />
          <p className="mt-6 text-center text-xs text-slate-400">v{import.meta.env.VITE_APP_VERSION}</p>
        </aside>
      </>
    );
  }

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-[1099] hidden overflow-x-hidden overflow-y-auto border-r border-slate-200 bg-white py-4 transition-[width] duration-200 lg:block ${drawerOpen ? 'w-64 px-4' : 'w-[4.5rem] px-2'}`}
      aria-label="Navigasi utama"
    >
      {drawerOpen && (
        <div className="mb-5 px-2">
          <LogoSection />
        </div>
      )}
      <MenuList />
      {drawerOpen && <p className="mt-6 text-center text-xs text-slate-400">v{import.meta.env.VITE_APP_VERSION}</p>}
    </aside>
  );
}
