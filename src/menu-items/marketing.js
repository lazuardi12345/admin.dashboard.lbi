// src/menu-items/marketing.js
import {
  IconLayoutDashboard,
  IconSlideshow,
  IconSpeakerphone,
  IconArticle,
  IconBuildingStore,
  IconLanguage,
  IconBook2
} from '@tabler/icons-react';

const icons = {
  IconLayoutDashboard,
  IconSlideshow,
  IconSpeakerphone,
  IconArticle,
  IconBuildingStore,
  IconLanguage,
  IconBook2
};

// ==============================|| MARKETING MENU ITEMS ||============================== //

const marketing = {
  id: 'marketing-group',
  title: 'Divisi Marketing & Konten',
  caption: 'Kelola konten visual & promosi landing page',
  type: 'group',
  roles: ['marketing', 'content_writer', 'administrator'],
  children: [
    {
      id: 'marketing-dashboard',
      title: 'Marketing Overview',
      type: 'item',
      url: '/marketing/dashboard',
      icon: icons.IconLayoutDashboard,
      breadcrumbs: false
    },
    {
      id: 'marketing-sliders',
      title: 'Slider Landing Page',
      type: 'item',
      url: '/marketing/sliders',
      icon: icons.IconSlideshow,
      breadcrumbs: false
    },
    {
      id: 'marketing-banners',
      title: 'Banner & Pengumuman',
      type: 'item',
      url: '/marketing/banners',
      icon: icons.IconSpeakerphone,
      breadcrumbs: false
    },
    {
      id: 'marketing-posts',
      title: 'Artikel & Blog',
      type: 'item',
      url: '/marketing/posts',
      icon: icons.IconArticle,
      breadcrumbs: false
    },
    {
      id: 'marketing-partners',
      title: 'Mitra Kerjasama',
      type: 'item',
      url: '/marketing/partners',
      icon: icons.IconBuildingStore,
      breadcrumbs: false
    },
    {
      id: 'marketing-programs',
      title: 'Program Kami',
      type: 'item',
      url: '/marketing/programs',
      icon: icons.IconLanguage,
      breadcrumbs: false
    },
    {
      id: 'marketing-catalogs',
      title: 'Course Catalog',
      type: 'item',
      url: '/marketing/catalogs',
      icon: icons.IconBook2,
      breadcrumbs: false
    }
  ]
};

export default marketing;
