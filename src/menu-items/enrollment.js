import {
  IconSchool,
  IconUsers,
  IconCalendarEvent,
  IconCalendarStats,
  IconCoin,
  IconClipboardCheck,
  IconBook2,
  IconCertificate,
  IconKey
} from '@tabler/icons-react';

const icons = {
  IconSchool,
  IconUsers,
  IconCalendarEvent,
  IconCalendarStats,
  IconCoin,
  IconClipboardCheck,
  IconBook2,
  IconCertificate,
  IconKey
};

const enrollment = {
  id: 'academic-management',
  title: 'Akademik & Pendaftaran',
  type: 'group',
  // Enrollment is scoped to each administrator's program by the API.
  roles: ['administrator', 'admin_ppb', 'admin_bipa', 'admin_ppp'],
  children: [
    {
      id: 'admin-registrations',
      title: 'Data Registrasi',
      type: 'item',
      url: '/admin/registrations',
      icon: icons.IconClipboardCheck,
      breadcrumbs: false
    },
    {
      id: 'admin-courses',
      title: 'Data Kursus',
      type: 'item',
      url: '/admin/courses',
      icon: icons.IconBook2,
      breadcrumbs: false
    },
    {
      id: 'admin-language-test-enrollments',
      title: 'Data Tes Bahasa',
      type: 'item',
      url: '/admin/enrollments?division=testing',
      icon: icons.IconCertificate,
      breadcrumbs: false
    },
    {
      id: 'admin-course-fees',
      title: 'Master Tarif',
      type: 'item',
      url: '/admin/fees',
      icon: icons.IconCoin,
      breadcrumbs: false
    },
    {
      id: 'admin-schedules',
      title: 'Jadwal Kursus',
      type: 'item',
      url: '/admin/schedules',
      icon: icons.IconCalendarEvent,
      breadcrumbs: false
    },
    {
      id: 'admin-terms',
      title: 'Master Term / Periode',
      type: 'item',
      url: '/admin/terms',
      icon: icons.IconCalendarStats,
      breadcrumbs: false
    },
    {
      id: 'admin-serial-numbers',
      title: 'Serial Number / Token DPT',
      type: 'item',
      url: '/admin/serial-numbers',
      icon: icons.IconKey,
      breadcrumbs: false
    }
  ]
};

export default enrollment;
