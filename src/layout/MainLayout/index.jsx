import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';
import Customization from '../Customization';
import Loader from 'ui-component/Loader';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import useConfig from 'hooks/useConfig';

export default function MainLayout() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches);
  const { menuMaster, menuMasterLoading } = useGetMenuMaster();
  const {
    state: { miniDrawer }
  } = useConfig();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened ?? false;
  const location = useLocation();

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    handlerDrawerOpen(!miniDrawer);
  }, [miniDrawer]);

  useEffect(() => {
    if (isMobile) handlerDrawerOpen(false);
  }, [isMobile, location.pathname]);

  if (menuMasterLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />
      <Sidebar isMobile={isMobile} />
      <main className={`min-h-screen pt-16 transition-[margin] duration-200 ${isMobile ? 'ml-0' : drawerOpen ? 'ml-64' : 'ml-[4.5rem]'}`}>
        <div className="flex min-h-[calc(100vh-4rem)] flex-col px-2 py-4 sm:px-5">
          <Breadcrumbs />
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
      </main>
      <Customization />
    </div>
  );
}
