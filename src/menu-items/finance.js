// src/menu-items/finance.js
import { IconReceipt, IconReportMoney, IconWallet } from '@tabler/icons-react';

const icons = { IconReceipt, IconReportMoney, IconWallet };

const finance = {
  id: 'finance-management',
  title: 'Keuangan & Pembayaran',
  type: 'group',
  // Hanya administrator dan finance staff
  roles: ['administrator', 'finance'],
  children: [
    {
      id: 'finance-payments',
      title: 'Verifikasi Pembayaran',
      type: 'item',
      url: '/finance/payments',
      icon: icons.IconReceipt,
      breadcrumbs: false
    },
    {
      id: 'finance-reports',
      title: 'Laporan Keuangan',
      type: 'item',
      url: '/finance/reports',
      icon: icons.IconReportMoney,
      breadcrumbs: false
    }
  ]
};

export default finance;
