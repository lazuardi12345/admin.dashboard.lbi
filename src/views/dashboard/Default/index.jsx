import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import {
  IconArrowUpRight,
  IconChartLine,
  IconChartPie,
  IconClock,
  IconCircleCheck,
  IconRefresh,
  IconSchool,
  IconTrophy,
  IconUsers
} from '@tabler/icons-react';

import { adminApi } from '../../../api/adminApi';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert } from '../../../components/ui/alert';

const number = (value) => (value == null ? '—' : Number(value || 0).toLocaleString('id-ID'));
const chartColors = ['#2563eb', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];
const paymentStatusLabels = {
  approved: 'Lunas / Approved',
  paid: 'Lunas / Approved',
  pending: 'Menunggu Approval',
  pending_payment: 'Menunggu Approval',
  postponed: 'Ditunda'
};

const scopes = {
  admin_ppb: {
    division: 'ppb',
    title: 'Pusat Kendali & Analitik Program PPB',
    subtitle: 'Dashboard operasional Program Pelatihan Bahasa (Bahasa Inggris & Bahasa Asing Non-Inggris).',
    badge: 'ADMIN PPB',
    options: [
      { value: 'ppb', label: 'Semua PPB (Inggris & Non-Inggris)' },
      { value: 'ppb_english', label: 'PPB Inggris' },
      { value: 'ppb_foreign', label: 'PPB Non-Inggris' }
    ]
  },
  admin_bipa: {
    division: 'bipa',
    title: 'Pusat Kendali & Analitik Program BIPA',
    subtitle: 'Dashboard operasional Program Bahasa Indonesia bagi Penutur Asing (BIPA).',
    badge: 'ADMIN BIPA',
    options: []
  },
  admin_ppp: {
    division: 'ppp',
    title: 'Pusat Kendali & Analitik Program PPP',
    subtitle: 'Dashboard operasional Program Pengembangan Penerjemahan (PPP) & Uji Kemahiran.',
    badge: 'ADMIN PPP',
    options: []
  }
};

function LoadingChart({ height = 300 }) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: height }}>
      <span className="size-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" aria-label="Memuat grafik" />
    </div>
  );
}

function EmptyChart({ height = 300 }) {
  return (
    <div className="flex items-center justify-center text-sm text-slate-500" style={{ minHeight: height }}>
      Belum ada data untuk ditampilkan.
    </div>
  );
}

function DashboardCard({ title, description, icon: Icon, action, children, className = '' }) {
  return (
    <Card className={`min-w-0 ${className}`}>
      <CardHeader className="flex flex-col gap-1 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {Icon && <Icon size={20} className="shrink-0 text-blue-600" aria-hidden="true" />}
            {title}
          </CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="px-4 pb-5 sm:px-5">{children}</CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const scope = scopes[role] || {
    division: '',
    title: 'Pusat Kendali & Analitik Seluruh Program',
    subtitle: 'Konsolidasi data registrasi dan analitik finansial seluruh divisi LBI FIB UI.',
    badge: 'SUPER ADMINISTRATOR',
    options: [
      { value: '', label: 'Semua Divisi' },
      { value: 'ppb_english', label: 'PPB Inggris' },
      { value: 'ppb_foreign', label: 'PPB Non-Inggris' },
      { value: 'ppp', label: 'PPP (Penerjemahan)' },
      { value: 'bipa', label: 'BIPA' }
    ]
  };
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadErrors, setLoadErrors] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(scope.division);
  const [trendMode, setTrendMode] = useState('daily');
  const [courseViewMode, setCourseViewMode] = useState('chart');

  useEffect(() => setSelectedDivision(scope.division), [scope.division]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setLoadErrors([]);
    const division = scope.division ? selectedDivision || scope.division : selectedDivision;
    const results = await Promise.allSettled([adminApi.getDashboardMetrics(), adminApi.getEnrollmentAnalytics(division)]);
    const errors = [];
    const requests = [
      { result: results[0], setData: setMetrics, label: 'metrik dashboard' },
      { result: results[1], setData: setAnalytics, label: 'analitik pendaftaran' }
    ];

    requests.forEach(({ result, setData, label }) => {
      if (result.status === 'rejected') {
        setData(null);
        const reason = result.reason;
        const message =
          reason?.status === 401
            ? 'Sesi login tidak valid. Silakan masuk kembali.'
            : reason?.status === 403
              ? 'Akun Anda tidak memiliki akses ke data dashboard.'
              : reason?.message || 'Terjadi kesalahan saat menghubungi server.';
        errors.push(`Gagal memuat ${label}: ${message}`);
      } else if (result.value?.success && result.value.data) {
        setData(result.value.data);
      } else {
        setData(null);
        errors.push(`Gagal memuat ${label}: ${result.value?.message || 'Respons server tidak valid.'}`);
      }
    });

    if (errors.length) {
      console.error('Error loading dashboard data:', results);
      setLoadErrors(errors);
    }
    setLoading(false);
  }, [scope.division, selectedDivision]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const totalEnrollments = analytics?.per_division?.length
    ? analytics.per_division.reduce((total, item) => total + Number(item.total || 0), 0)
    : metrics?.metrics?.total_enrollments;
  const verifiedPayments = metrics?.metrics?.verified_payments;
  const pendingPayments = metrics?.metrics?.pending_payments;

  const trendData = useMemo(() => {
    if (trendMode === 'daily' && analytics?.daily_trend?.length) {
      return {
        categories: analytics.daily_trend.map(({ date }) => {
          const parts = String(date).split('-');
          return parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
        }),
        series: [{ name: 'Pendaftar Baru', data: analytics.daily_trend.map((item) => Number(item.total)) }]
      };
    }
    const periods = analytics?.per_period?.slice(0, 10) || [];
    return periods.length
      ? {
          categories: periods.map((item) => item.term_period),
          series: [{ name: 'Pendaftar per Term', data: periods.map((item) => Number(item.total)) }]
        }
      : {
          categories: [],
          series: []
        };
  }, [trendMode, analytics]);

  const divisionData = useMemo(() => {
    if (scope.division === 'ppb') {
      const rows = analytics?.per_division?.filter((item) => ['ppb', 'ppb_english', 'ppb_foreign'].includes(item.division)) || [];
      if (rows.length)
        return {
          title: 'Komposisi Bahasa PPB',
          subtitle: 'Perbandingan English vs Bahasa Asing',
          labels: rows.map((item) => (item.division === 'ppb_foreign' ? 'PPB Non-Inggris' : 'PPB English')),
          series: rows.map((item) => Number(item.total))
        };
    }
    if (['bipa', 'ppp'].includes(scope.division)) {
      const rows = analytics?.top_courses?.slice(0, 5) || [];
      if (rows.length)
        return {
          title: `Komposisi Kursus ${scope.division.toUpperCase()}`,
          subtitle: 'Peminat per kategori pelatihan',
          labels: rows.map((item) => (item.course_name.length > 20 ? `${item.course_name.slice(0, 20)}...` : item.course_name)),
          series: rows.map((item) => Number(item.total))
        };
    }
    const rows = analytics?.per_division || [];
    return rows.length
      ? {
          title: 'Porsi Pendaftar per Divisi',
          subtitle: 'Distribusi program pelatihan bahasa',
          labels: rows.map((item) => `Divisi ${String(item.division).toUpperCase()}`),
          series: rows.map((item) => Number(item.total))
        }
      : {
          title: 'Porsi Pendaftar per Divisi',
          subtitle: 'Distribusi program pelatihan bahasa',
          labels: [],
          series: []
        };
  }, [analytics, scope.division]);

  const revenueData = useMemo(() => {
    const rows = analytics?.revenue_summary || [];
    if (!rows.length) return { categories: [], series: [] };
    return {
      categories: rows.map((item) => {
        const division = String(item.division || '').toLowerCase();
        if (division === 'ppb' || division === 'ppb_english') return 'PPB INGGRIS';
        if (division === 'ppb_foreign') return 'PPB NON-INGGRIS';
        return division.toUpperCase();
      }),
      series: [
        { name: 'Terverifikasi (Lunas)', data: rows.map((item) => Number(item.confirmed_revenue || 0)) },
        { name: 'Menunggu Verifikasi', data: rows.map((item) => Number(item.pending_revenue || 0)) }
      ]
    };
  }, [analytics]);

  const statusData = useMemo(() => {
    const rows = analytics?.per_status || [];
    return rows.length
      ? {
          labels: rows.map((item) => paymentStatusLabels[String(item.status).toLowerCase()] || String(item.status).toUpperCase()),
          series: rows.map((item) => Number(item.total))
        }
      : verifiedPayments || pendingPayments
        ? {
            labels: ['Terverifikasi & Lunas', 'Menunggu Verifikasi'],
            series: [Number(verifiedPayments || 0), Number(pendingPayments || 0)]
          }
        : { labels: [], series: [] };
  }, [analytics, verifiedPayments, pendingPayments]);

  const courses = analytics?.top_courses || [];
  const courseData = {
    categories: courses
      .slice(0, 10)
      .map((course) => (course.course_name.length > 25 ? `${course.course_name.slice(0, 25)}...` : course.course_name)),
    series: [{ name: 'Jumlah Peserta', data: courses.slice(0, 10).map((course) => Number(course.total)) }]
  };
  const baseOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'inherit' },
    dataLabels: { enabled: false },
    grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
    legend: { labels: { colors: '#475569' } },
    tooltip: { theme: 'light' }
  };
  const trendOptions = {
    ...baseOptions,
    chart: { ...baseOptions.chart, type: 'area', height: 320, zoom: { enabled: false } },
    colors: ['#2563eb'],
    xaxis: { categories: trendData.categories, labels: { style: { colors: '#64748b', fontSize: '11px' } } },
    yaxis: { labels: { formatter: (value) => Math.round(value).toLocaleString('id-ID') } },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 95, 100] } }
  };
  const donutOptions = (data, label) => ({
    ...baseOptions,
    chart: { ...baseOptions.chart, type: 'donut', height: 310 },
    labels: data.labels,
    colors: chartColors,
    legend: { position: 'bottom', labels: { colors: '#475569' } },
    plotOptions: {
      pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label, formatter: () => number(totalEnrollments) } } } }
    },
    dataLabels: { enabled: true, formatter: (value) => `${Math.round(value)}%` }
  });
  const revenueOptions = {
    ...baseOptions,
    chart: { ...baseOptions.chart, type: 'bar', height: 310 },
    colors: ['#10b981', '#f59e0b'],
    plotOptions: { bar: { columnWidth: '48%', borderRadius: 4 } },
    xaxis: { categories: revenueData.categories },
    yaxis: {
      labels: {
        formatter: (value) =>
          value >= 1e9 ? `Rp ${(value / 1e9).toFixed(1)} M` : value >= 1e6 ? `Rp ${(value / 1e6).toFixed(0)} Jt` : `Rp ${number(value)}`
      }
    },
    legend: { position: 'top', labels: { colors: '#475569' } }
  };
  const courseOptions = {
    ...baseOptions,
    chart: { ...baseOptions.chart, type: 'bar', height: 380 },
    colors: chartColors,
    plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 5, distributed: true } },
    xaxis: { categories: courseData.categories },
    yaxis: { labels: { style: { colors: '#334155' } } },
    legend: { show: false }
  };

  const statCards = [
    {
      title: 'Total Pendaftaran',
      value: number(totalEnrollments),
      note: '100% Memiliki No. Registrasi',
      icon: IconSchool,
      cardClass: 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100',
      iconClass: 'text-blue-700'
    },
    {
      title: 'Pembayaran Terverifikasi',
      value: number(verifiedPayments),
      note: 'Lunas & Kursus Teraktivasi',
      icon: IconCircleCheck,
      cardClass: 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100',
      iconClass: 'text-emerald-700'
    },
    {
      title: 'Menunggu Verifikasi',
      value: number(pendingPayments),
      note: 'Menunggu Approval Finance',
      icon: IconClock,
      cardClass: 'border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100',
      iconClass: 'text-amber-700'
    },
    {
      title: 'Total Akun Siswa',
      value: number(metrics?.metrics?.total_students),
      note: `Dari ${number(metrics?.metrics?.total_users)} total pengguna`,
      icon: IconUsers,
      cardClass: 'border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100',
      iconClass: 'text-pink-700'
    }
  ];

  return (
    <main className="space-y-5 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{scope.title}</h1>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-wide text-blue-800">{scope.badge}</span>
          </div>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">{scope.subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {scope.options.length > 0 && (
            <select
              aria-label="Pilih divisi"
              value={selectedDivision}
              onChange={(event) => setSelectedDivision(event.target.value)}
              className="h-10 min-w-48 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {scope.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          <Button variant="outline" disabled={loading} onClick={fetchDashboardData}>
            <IconRefresh size={17} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </header>

      {loadErrors.length > 0 && (
        <Alert variant="error" className="flex-col items-start">
          <p className="font-semibold">Sebagian data dashboard tidak dapat dimuat.</p>
          <ul className="list-inside list-disc">
            {loadErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <section aria-label="Ringkasan metrik" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ title, value, note, icon: Icon, cardClass, iconClass }) => (
          <Card key={title} className={cardClass}>
            <CardContent className="flex min-h-36 items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{title}</p>
                <p className="my-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? <span className="inline-block h-9 w-20 animate-pulse rounded bg-slate-200" aria-label="Memuat" /> : value}
                </p>
                <p className="text-xs font-medium text-slate-600">{note}</p>
              </div>
              <span className={`rounded-xl bg-white/80 p-3 shadow-sm ${iconClass}`}>
                <Icon size={24} />
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <DashboardCard
          className="lg:col-span-2"
          title="Tren Pendaftaran Registrasi"
          description="Pertumbuhan volume berkas pendaftaran yang masuk ke sistem"
          icon={IconChartLine}
          action={
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={trendMode === 'daily' ? 'default' : 'outline'} onClick={() => setTrendMode('daily')}>
                30 Hari Terakhir
              </Button>
              <Button size="sm" variant={trendMode === 'period' ? 'default' : 'outline'} onClick={() => setTrendMode('period')}>
                Per Term / Periode
              </Button>
            </div>
          }
        >
          {loading ? (
            <LoadingChart />
          ) : trendData.series.some((series) => series.data.length > 0) ? (
            <Chart options={trendOptions} series={trendData.series} type="area" height={320} />
          ) : (
            <EmptyChart />
          )}
        </DashboardCard>
        <DashboardCard
          title={divisionData.title}
          description={divisionData.subtitle}
          icon={IconChartPie}
          action={
            <Button size="sm" variant="ghost" onClick={() => navigate('/admin/enrollments')}>
              Lihat <IconArrowUpRight size={16} />
            </Button>
          }
        >
          {loading ? (
            <LoadingChart />
          ) : divisionData.series.length ? (
            <Chart options={donutOptions(divisionData, 'Total Pendaftar')} series={divisionData.series} type="donut" height={310} />
          ) : (
            <EmptyChart />
          )}
        </DashboardCard>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DashboardCard
          title="Ringkasan Pendapatan per Divisi"
          description="Perbandingan pembayaran terverifikasi dan menunggu verifikasi"
          icon={IconChartLine}
        >
          {loading ? (
            <LoadingChart />
          ) : revenueData.categories.length ? (
            <Chart options={revenueOptions} series={revenueData.series} type="bar" height={310} />
          ) : (
            <EmptyChart />
          )}
        </DashboardCard>
        <DashboardCard
          title="Status Pendaftaran"
          description="Rasio kelengkapan berkas & validasi transaksi"
          icon={IconCircleCheck}
          action={
            <Button size="sm" variant="ghost" onClick={() => navigate('/finance/payments')}>
              Verifikasi <IconArrowUpRight size={16} />
            </Button>
          }
        >
          {loading ? (
            <LoadingChart />
          ) : statusData.series.length ? (
            <Chart options={donutOptions(statusData, 'Total Berkas')} series={statusData.series} type="donut" height={310} />
          ) : (
            <EmptyChart />
          )}
        </DashboardCard>
      </section>

      <DashboardCard
        title="10 Kursus Paling Populer (Peserta Terbanyak)"
        description="Peringkat berdasarkan akumulasi seluruh format kelas (Tatap Muka & Online dikonsolidasi)."
        icon={IconTrophy}
        action={
          <div className="flex gap-2">
            <Button size="sm" variant={courseViewMode === 'chart' ? 'default' : 'outline'} onClick={() => setCourseViewMode('chart')}>
              Grafik Batang
            </Button>
            <Button size="sm" variant={courseViewMode === 'table' ? 'default' : 'outline'} onClick={() => setCourseViewMode('table')}>
              Tabel Rinci
            </Button>
          </div>
        }
      >
        {loading ? (
          <LoadingChart height={380} />
        ) : courses.length && courseViewMode === 'chart' ? (
          <Chart options={courseOptions} series={courseData.series} type="bar" height={380} />
        ) : !courses.length ? (
          <EmptyChart height={380} />
        ) : courseViewMode === 'chart' ? (
          <Chart options={courseOptions} series={courseData.series} type="bar" height={380} />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3"># Rank</th>
                  <th className="px-4 py-3">Nama Kursus / Pelatihan</th>
                  <th className="px-4 py-3 text-right">Total Peserta Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course, index) => (
                  <tr key={course.course_name} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}`}
                      >
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {course.course_name}
                      {course.course_name === 'Kursus LBI' && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                          Pendaftaran Umum Non-Tes (Legacy)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-blue-700">{number(course.total)} peserta</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!courses.length && <p className="p-6 text-center text-sm text-slate-500">Belum ada data kursus.</p>}
          </div>
        )}
      </DashboardCard>
    </main>
  );
}
