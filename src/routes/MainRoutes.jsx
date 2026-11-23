import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from 'components/AuthGuard';
import { useAuth } from 'contexts/AuthContext';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// marketing routing
const MarketingDashboard = Loadable(lazy(() => import('views/marketing/dashboard')));
const MarketingSliders = Loadable(lazy(() => import('views/marketing/sliders')));
const MarketingSliderDetail = Loadable(lazy(() => import('views/marketing/sliders/detail')));
const MarketingSliderEdit = Loadable(lazy(() => import('views/marketing/sliders/edit')));
const MarketingBanners = Loadable(lazy(() => import('views/marketing/banners')));
const MarketingBannerDetail = Loadable(lazy(() => import('views/marketing/banners/detail')));
const MarketingBannerEdit = Loadable(lazy(() => import('views/marketing/banners/edit')));
const MarketingPosts = Loadable(lazy(() => import('views/marketing/posts')));
const MarketingPostDetail = Loadable(lazy(() => import('views/marketing/posts/detail')));
const MarketingPostEdit = Loadable(lazy(() => import('views/marketing/posts/edit')));
const MarketingPartners = Loadable(lazy(() => import('views/marketing/partners')));
const MarketingPartnerDetail = Loadable(lazy(() => import('views/marketing/content-detail')));
const MarketingPartnerEdit = Loadable(lazy(() => import('views/marketing/partners/edit')));
const MarketingPrograms = Loadable(lazy(() => import('views/marketing/programs')));
const MarketingProgramDetail = Loadable(lazy(() => import('views/marketing/programs/detail')));
const MarketingProgramEdit = Loadable(lazy(() => import('views/marketing/programs/edit')));
const MarketingCatalogs = Loadable(lazy(() => import('views/marketing/catalogs')));
const MarketingCatalogNew = Loadable(lazy(() => import('views/marketing/catalogs/new')));
const MarketingCatalogEdit = Loadable(lazy(() => import('views/marketing/catalogs/edit')));

// academic & enrollment routing
const AdminEnrollments = Loadable(lazy(() => import('views/admin/enrollments')));
const AdminCourseFees = Loadable(lazy(() => import('views/admin/fees')));
const AdminSchedules = Loadable(lazy(() => import('views/admin/schedules')));
const AdminTerms = Loadable(lazy(() => import('views/admin/terms')));
const AdminSerialNumbers = Loadable(lazy(() => import('views/admin/serial-numbers')));

// finance routing
const FinancePayments = Loadable(lazy(() => import('views/finance/payments')));
const FinanceReports = Loadable(lazy(() => import('views/finance/reports')));

function RoleHome() {
  const { role } = useAuth();

  if (role === 'finance') return <Navigate to="/finance/payments" replace />;
  if (['admin_ppb', 'admin_bipa', 'admin_ppp'].includes(role)) return <Navigate to="/admin/enrollments" replace />;
  if (role === 'administrator') return <Navigate to="/dashboard/default" replace />;

  return <MarketingDashboard />;
}

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: '/',
      element: <RoleHome />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'marketing',
      children: [
        {
          path: 'dashboard',
          element: <MarketingDashboard />
        },
        {
          path: 'sliders',
          element: <MarketingSliders />
        },
        {
          path: 'sliders/:contentId',
          element: <MarketingSliderDetail contentType="slider" />
        },
        {
          path: 'sliders/:contentId/edit',
          element: <MarketingSliderEdit />
        },
        {
          path: 'banners',
          element: <MarketingBanners />
        },
        {
          path: 'banners/:contentId',
          element: <MarketingBannerDetail contentType="banner" />
        },
        {
          path: 'banners/:contentId/edit',
          element: <MarketingBannerEdit />
        },
        {
          path: 'posts',
          element: <MarketingPosts />
        },
        {
          path: 'posts/:postId',
          element: <MarketingPostDetail />
        },
        {
          path: 'posts/:postId/edit',
          element: <MarketingPostEdit />
        },
        {
          path: 'partners',
          element: <MarketingPartners />
        },
        {
          path: 'partners/:contentId',
          element: <MarketingPartnerDetail contentType="partner" />
        },
        {
          path: 'partners/:contentId/edit',
          element: <MarketingPartnerEdit />
        },
        {
          path: 'programs',
          element: <MarketingPrograms />
        },
        {
          path: 'programs/:serviceId',
          element: <MarketingProgramDetail />
        },
        {
          path: 'programs/:serviceId/edit',
          element: <MarketingProgramEdit />
        },
        {
          path: 'catalogs',
          element: <MarketingCatalogs />
        },
        {
          path: 'catalogs/new',
          element: <MarketingCatalogNew />
        },
        {
          path: 'catalogs/:catalogId/edit',
          element: <MarketingCatalogEdit />
        }
      ]
    },
    {
      path: 'admin',
      children: [
        {
          path: 'enrollments',
          element: <AdminEnrollments />
        },
        {
          path: 'registrations',
          element: <AdminEnrollments defaultStage="registrations" />
        },
        {
          path: 'courses',
          element: <AdminEnrollments defaultStage="courses" />
        },
        {
          path: 'fees',
          element: <AdminCourseFees />
        },
        {
          path: 'schedules',
          element: <AdminSchedules />
        },
        {
          path: 'terms',
          element: <AdminTerms />
        },
        {
          path: 'serial-numbers',
          element: <AdminSerialNumbers />
        }
      ]
    },
    {
      path: 'finance',
      children: [
        {
          path: 'payments',
          element: <FinancePayments />
        },
        {
          path: 'reports',
          element: <FinanceReports />
        }
      ]
    }
  ]
};

export default MainRoutes;
