// src/views/admin/schedules/index.jsx
import { useState, useEffect } from 'react';
import {
  IconPlus,
  IconEdit,
  IconRefresh,
  IconArrowLeft,
  IconExternalLink
} from '@tabler/icons-react';
import { Alert } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

import { adminApi } from '../../../api/adminApi';
import { useAuth } from '../../../contexts/AuthContext';

// Standard LBI FIB UI Level Presets extracted from Legacy Taxonomy & Academic System
const COURSE_LEVEL_PRESETS = {
  // PPB English
  'english conversation': ['EC-1', 'EC-2', 'EC-3', 'EC-4'],
  'general english': ['GE-1', 'GE-2', 'GE-3', 'GE-4', 'GE-5', 'GE-6', 'GE-7', 'GE-8', 'GE-9', 'GE-10'],
  'business english': ['BE-1', 'BE-2', 'BE-3', 'BE-4', 'B-Presentation and Report Writing'],
  'eap': ['EAP-1', 'EAP-2', 'EAP-3', 'EAP-4'],
  'academic purposes': ['EAP-1', 'EAP-2', 'EAP-3', 'EAP-4'],
  'grammar': ['GW-1', 'GW-2', 'GW-3'],
  'writing': ['GW-1', 'GW-2', 'GW-3', 'Writing and Speaking'],
  'legal english': ['LE-1', 'LE-2'],
  'ielts': ['IELTS-Intro', 'IELTS-1', 'IELTS-2', 'IELTS-3', 'GF-IELTS'],
  'toefl': ['iBT Preparation', 'ITP Preparation'],

  // PPB Non Inggris
  'arab': ['ARB-1', 'ARB-2', 'ARB-3', 'ARB-4', 'ARB-5', 'Arab Tamhidi'],
  'belanda': ['BEL-1', 'BEL-2', 'BEL-3'],
  'jepang dasar': ['JPD-1', 'JPD-1B', 'JPD-2', 'JPD-2B', 'JPD-2C', 'JPD-2D', 'JPD-3', 'JPD-3B', 'JPD-3C', 'JPD-4', 'JPD-4B', 'JPD-5', 'JPD-6', 'JPD-7'],
  'jepang menengah': ['JPM-1', 'JPM-2', 'JPM-3'],
  'jepang': ['JPD-1', 'JPD-2', 'JPD-3', 'JPD-4', 'JPD-5', 'JPD-6', 'JPD-7', 'JPM-1', 'JPM-2', 'JPM-3', 'JP-INTRO-1', 'JP-INTRO-2'],
  'korea': ['KORD-1', 'KORD-2', 'KORD-3', 'KORM-1', 'KORM-2', 'KORM-3', 'K-TOPIK-2'],
  'jerman': ['JER-A1.1', 'JER-A1.2', 'JER-A1.3', 'JER-A2.1'],
  'mandarin dasar': ['MAN-1', 'MAN-2', 'MAN-3', 'MAN-4', 'MAN-5', 'MAN-6', 'MAN-7'],
  'mandarin menengah': ['MANM-1', 'MANM-2', 'MANM-3', 'MANM-4'],
  'mandarin': ['MAN-1', 'MAN-2', 'MAN-3', 'MAN-4', 'MAN-5', 'MAN-6', 'MAN-7', 'MANM-1', 'MANM-2', 'MANM-3', 'MANM-4'],
  'prancis': ['PRA-A.1.1', 'PRA-A.1.2', 'PRA-A.2.1'],
  'rusia': ['RUS-1', 'RUS-2'],
  'spanyol': ['SPA-A1-1', 'SPA-A1-2', 'SPA-A2-1', 'SPA-B1-3', 'SPA-B2-1', 'SPA-B2-2'],
  'isyarat': ['BJK-DASAR', 'Level Dasar', 'Level Lanjutan'],
  'italia': ['IT-1', 'IT-2', 'A1', 'A2'],

  // BIPA
  'bipa': ['BIPA 1', 'BIPA 2', 'BIPA 3', 'BIPA 4'],

  // PPP (Penerjemahan & Penjurubahasaan)
  'hukum': ['Tingkat 1', 'Tingkat 2', 'Dasar', 'Lanjutan'],
  'teks hukum': ['Tingkat 1', 'Tingkat 2'],
  'penerjemahan': ['Dasar', 'Menengah', 'Lanjutan', 'Tingkat 1', 'Tingkat 2'],
  'penjurubahasaan': ['Novice', 'Paraprofesional', 'Profesional'],
  'ppp': ['Dasar', 'Menengah', 'Lanjutan', 'Tingkat 1', 'Tingkat 2', 'Novice', 'Paraprofesional', 'Profesional']
};

const getLevelOptions = (programName = '', division = '', dynamicPresets = null) => {
  const presets = (dynamicPresets && Object.keys(dynamicPresets).length > 0)
    ? dynamicPresets
    : COURSE_LEVEL_PRESETS;
  const name = (programName || '').toLowerCase();
  for (const [key, list] of Object.entries(presets)) {
    if (name.includes(key)) {
      return list;
    }
  }
  if (division === 'bipa') return presets['bipa'] || ['BIPA 1', 'BIPA 2', 'BIPA 3', 'BIPA 4'];
  if (division === 'ppp') return presets['ppp'] || ['Dasar', 'Menengah', 'Lanjutan', 'Tingkat 1', 'Tingkat 2'];
  if (division === 'ppb' || division === 'ppb_english') return presets['general english'] || ['GE-1', 'GE-2', 'GE-3', 'EC-1', 'EC-2'];
  if (division === 'ppb_foreign') return presets['arab'] || ['ARB-1', 'ARB-2', 'ARB-3'];

  return [
    'Dasar', 'Menengah', 'Lanjut', 'Tingkat 1', 'Tingkat 2',
    'A1', 'A2', 'B1', 'B2', 'C1', 'C2',
    'Beginner', 'Intermediate', 'Advanced'
  ];
};

const DAY_PRESETS = [
  'Sabtu',
  'Senin & Rabu',
  'Selasa & Kamis',
  'Senin & Kamis',
  'Rabu & Jumat',
  'Minggu'
];

const TIME_PRESETS = [
  '08.30 - 13.00 WIB',
  '08.30 - 12.30 WIB',
  '09.00 - 13.00 WIB',
  '13.00 - 17.00 WIB',
  '17.00 - 19.00 WIB',
  '19.00 - 21.00 WIB'
];

const getDivisionGroup = (division) => {
  const normalized = String(division || '').toLowerCase();
  if (['ppb', 'ppb_english', 'testing'].includes(normalized)) return 'ppb';
  if (normalized === 'ppb_foreign') return 'ppb_foreign';
  return normalized;
};

const getDivisionLabel = (division) => ({
  ppb: 'PPB (Inggris)',
  ppb_english: 'PPB (Inggris)',
  ppb_foreign: 'PPB Non Inggris',
  ppp: 'PPP',
  bipa: 'BIPA',
  testing: 'PPB (Inggris)',
}[String(division || '').toLowerCase()] || String(division || '-').toUpperCase());

const getRoleDivisions = (role) => ({
  admin_ppb: ['ppb', 'ppb_english', 'ppb_foreign', 'testing'],
  admin_bipa: ['bipa'],
  admin_ppp: ['ppp']
}[role] || null);

const LOCATION_PRESETS = [
  'Online via Zoom Cloud Meetings',
  'Kampus UI Depok (Gedung VIII FIB UI)',
  'Kampus UI Salemba (Gedung IASTH Lt. 3)',
  'Hybrid (Kampus UI Depok & Zoom)'
];

const INITIAL_FORM = {
  course_catalog_id: '',
  program_name: '',
  division: 'ppb',
  batch: 'Term 1 2026',
  term_id: '',
  level: '',
  format: 'daring',
  selected_day: '',
  selected_time: '',
  schedule_text: '',
  capacity: 25,
  fee: '',
  fee_display: '',
  location: 'Online via Zoom Cloud Meetings',
  is_open: true,
  is_active: true
};

const formatFeeAmount = (amount) => amount === null || amount === undefined || amount === ''
  ? 'Tarif belum diatur'
  : `Rp ${Number(amount).toLocaleString('id-ID')}`;

export default function AdminSchedules() {
  const { role } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [schedulePageData, setSchedulePageData] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [terms, setTerms] = useState([]);
  const [masterOptions, setMasterOptions] = useState({
    days: [],
    times: [],
    formats: [],
    locations: [],
    level_presets: {},
    divisions: []
  });
  const [loading, setLoading] = useState(true);
  const [schedulePageLoading, setSchedulePageLoading] = useState(false);
  const [schedulePagination, setSchedulePagination] = useState(null);
  const [schedulePage, setSchedulePage] = useState(0);
  const [scheduleRowsPerPage, setScheduleRowsPerPage] = useState(10);
  const [schedulePageRefreshKey, setSchedulePageRefreshKey] = useState(0);
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [selectedCatalogId, setSelectedCatalogId] = useState(null);
  const [formatFilter, setFormatFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [catalogLevels, setCatalogLevels] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feePreview, setFeePreview] = useState({ loading: false, registration: null, tuition: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, catalogsRes, masterRes, termsRes] = await Promise.all([
        adminApi.getSchedules(),
        adminApi.getCourseCatalogs().catch(() => ({ data: [] })),
        adminApi.getMasterScheduleOptions().catch(() => null),
        adminApi.getTerms().catch(() => null)
      ]);

      if (schedulesRes?.success) {
        setSchedules(schedulesRes.data || []);
      }
      if (catalogsRes?.data) {
        const list = Array.isArray(catalogsRes.data)
          ? catalogsRes.data
          : Array.isArray(catalogsRes.data.data)
          ? catalogsRes.data.data
          : Array.isArray(catalogsRes)
          ? catalogsRes
          : [];
        setCatalogs(list);
      }
      if (masterRes?.data) {
        setMasterOptions(masterRes.data);
      }
      if (termsRes?.success) {
        setTerms(termsRes.data || []);
      }
    } catch {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat jadwal kursus.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedCatalogId) {
      setSchedulePagination(null);
      setSchedulePageLoading(false);
      return undefined;
    }

    let isCurrentRequest = true;
    setSchedulePageLoading(true);
    adminApi.getSchedules({
      page: schedulePage + 1,
      per_page: scheduleRowsPerPage,
      course_catalog_id: selectedCatalogId,
      format: formatFilter,
      search: searchTerm.trim()
    }).then((response) => {
      if (!isCurrentRequest) return;
      if (!response?.success || !Array.isArray(response.data) || !response.meta) {
        throw new Error(response?.message || 'Respons pagination jadwal kursus tidak valid.');
      }
      setSchedulePageData(response.data);
      setSchedulePagination(response.meta);
    }).catch((error) => {
      if (!isCurrentRequest) return;
      setSchedulePageData([]);
      setSchedulePagination(null);
      setFeedback({ type: 'error', message: error.message || 'Gagal memuat jadwal kursus.' });
    }).finally(() => {
      if (isCurrentRequest) setSchedulePageLoading(false);
    });

    return () => { isCurrentRequest = false; };
  }, [selectedCatalogId, schedulePage, scheduleRowsPerPage, formatFilter, searchTerm, schedulePageRefreshKey]);

  useEffect(() => {
    if (!schedulePagination) return;
    const lastPage = Math.max(0, Number(schedulePagination.last_page || 1) - 1);
    if (schedulePage > lastPage) setSchedulePage(lastPage);
  }, [schedulePagination, schedulePage]);

  useEffect(() => {
    if (!formData.course_catalog_id || !formData.term_id) {
      setFeePreview({ loading: false, registration: null, tuition: null });
      return undefined;
    }

    let active = true;
    setFeePreview((current) => ({ ...current, loading: true }));
    const registrationProgram = ['ppb', 'ppb_english', 'ppb_foreign', 'testing'].includes(formData.division)
      ? 'ppb'
      : formData.division;
    const registrationFilters = {
      division: registrationProgram,
      course_catalog_id: formData.course_catalog_id,
      term_id: formData.term_id
    };
    const tuitionFilters = {
      ...registrationFilters,
      division: formData.division,
      course_level_id: formData.course_level_id,
      course_schedule_id: editingId || undefined
    };

    Promise.all([
      adminApi.getResolvedCourseFee({ ...registrationFilters, fee_type: 'registration' }),
      adminApi.getResolvedCourseFee({ ...tuitionFilters, fee_type: 'tuition' })
    ]).then(([registrationResponse, tuitionResponse]) => {
      if (active) {
        setFeePreview({
          loading: false,
          registration: registrationResponse?.data || null,
          tuition: tuitionResponse?.data || null
        });
      }
    }).catch(() => {
      if (active) setFeePreview({ loading: false, registration: null, tuition: null });
    });

    return () => { active = false; };
  }, [formData.course_catalog_id, formData.course_level_id, formData.division, formData.term_id, editingId]);

  const handleOpenCreate = async () => {
    setEditingId(null);
    setCatalogLevels([]);
    setFormData(INITIAL_FORM);
    if (selectedCatalog) {
      await handleCatalogSelect(selectedCatalog.id);
    }
    setOpenDialog(true);
  };

  const handleFormatChange = (newFormat) => {
    let loc = formData.location;
    if (newFormat === 'daring') {
      loc = 'Online via Zoom Cloud Meetings';
    } else if (newFormat === 'luring') {
      loc = 'Kampus UI Depok (Gedung VIII FIB UI)';
    } else if (newFormat === 'hybrid') {
      loc = 'Hybrid (Kampus UI Depok & Zoom)';
    }
    setFormData((prev) => ({
      ...prev,
      format: newFormat,
      location: loc
    }));
  };

  const handleDayTimeChange = (type, value) => {
    setFormData((prev) => {
      const nextDay = type === 'day' ? value : prev.selected_day;
      const nextTime = type === 'time' ? value : prev.selected_time;
      let combined = '';
      if (nextDay && nextDay !== 'custom' && nextTime && nextTime !== 'custom') {
        combined = `${nextDay}, ${nextTime}`;
      } else if (nextDay && nextDay !== 'custom') {
        combined = nextDay;
      } else if (nextTime && nextTime !== 'custom') {
        combined = nextTime;
      }
      return {
        ...prev,
        selected_day: nextDay,
        selected_time: nextTime,
        schedule_text: combined || prev.schedule_text
      };
    });
  };

  const handleOpenEdit = async (sched) => {
    setEditingId(sched.id);
    if (sched.course_catalog_id) {
      try {
        const res = await adminApi.getLevelsByCourse(sched.course_catalog_id);
        if (res?.success && Array.isArray(res.data)) {
          setCatalogLevels(res.data);
        } else {
          setCatalogLevels([]);
        }
      } catch {
        setCatalogLevels([]);
      }
    } else {
      setCatalogLevels([]);
    }

    const dayFound = DAY_PRESETS.find((d) => (sched.schedule_text || '').toLowerCase().includes(d.toLowerCase())) || '';
    const timeFound = TIME_PRESETS.find((t) => (sched.schedule_text || '').includes(t.replace(' WIB', ''))) || '';

    setFormData({
      course_catalog_id: sched.course_catalog_id || '',
      course_level_id: sched.course_level_id || '',
      program_name: sched.program_name || '',
      division: sched.division || 'ppb',
      batch: sched.batch || '',
      term_id: sched.term_id || '',
      level: sched.level || '',
      format: sched.format || 'daring',
      selected_day: dayFound,
      selected_time: timeFound,
      schedule_text: sched.schedule_text || '',
      capacity: sched.capacity || 25,
      fee: sched.fee || '',
      fee_display: sched.fee_display || '',
      location: sched.location || 'Online via Zoom Cloud Meetings',
      is_open: Boolean(sched.is_open),
      is_active: Boolean(sched.is_active)
    });
    setOpenDialog(true);
  };

  // When catalog is selected in form, auto-fill program_name, division, and smart level suggestion from database
  const handleCatalogSelect = async (catalogId) => {
    const selected = catalogs.find((c) => String(c.id) === String(catalogId));
    const progName = selected ? selected.title : formData.program_name;
    const div = selected ? (selected.division || formData.division) : formData.division;

    let dbLevels = [];
    if (catalogId) {
      try {
        const res = await adminApi.getLevelsByCourse(catalogId);
        if (res?.success && Array.isArray(res.data)) {
          dbLevels = res.data;
        }
      } catch {
        console.error('Error fetching levels:', err);
      }
    }
    setCatalogLevels(dbLevels);

    const levelOpts = dbLevels.length > 0
      ? dbLevels.map((l) => l.name)
      : getLevelOptions(progName, div, masterOptions.level_presets);

    const defaultLevel = dbLevels.length > 0 ? dbLevels[0].name : (levelOpts.length > 0 ? levelOpts[0] : '');
    const defaultLevelId = dbLevels.length > 0 ? dbLevels[0].id : undefined;
    const currentTerm = terms.find((term) => String(term.id) === String(formData.term_id));
    const termMatchesDivision = currentTerm && (
      currentTerm.program === 'all' ||
      currentTerm.program === div ||
      (['ppb', 'ppb_english', 'ppb_foreign'].includes(div) && currentTerm.program === 'ppb')
    );

    setFormData((prev) => {
      const sameCatalog = String(prev.course_catalog_id) === String(catalogId);
      return {
        ...prev,
        course_catalog_id: catalogId,
        course_level_id: sameCatalog ? prev.course_level_id : defaultLevelId,
        program_name: progName,
        division: div,
        level: sameCatalog ? prev.level : defaultLevel,
        term_id: termMatchesDivision ? prev.term_id : '',
        batch: termMatchesDivision ? prev.batch : '',
        start_date: termMatchesDivision ? prev.start_date : '',
        end_date: termMatchesDivision ? prev.end_date : '',
        registration_open: termMatchesDivision ? prev.registration_open : '',
        registration_close: termMatchesDivision ? prev.registration_close : '',
        service_id: selected ? selected.service_id : undefined
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_catalog_id && !editingId) {
      setFeedback({ type: 'error', message: 'Silakan pilih kursus dari katalog terlebih dahulu.' });
      return;
    }
    if (!activeTermsForProgram.some((term) => String(term.id) === String(formData.term_id))) {
      setFeedback({ type: 'error', message: 'Pilih term aktif dari master term terlebih dahulu.' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10) || 25,
        fee: Number(feePreview.tuition?.amount ?? 0),
        fee_display: feePreview.tuition?.amount !== undefined && feePreview.tuition?.amount !== null
          ? formatFeeAmount(feePreview.tuition.amount)
          : 'Tarif belum diatur'
      };

      if (editingId) {
        await adminApi.updateSchedule(editingId, payload);
        setFeedback({ type: 'success', message: 'Jadwal kursus berhasil diperbarui!' });
      } else {
        await adminApi.createSchedule(payload);
        setFeedback({ type: 'success', message: 'Jadwal kursus baru berhasil dibuat dan otomatis terhubung ke katalog!' });
      }
      setOpenDialog(false);
      fetchData();
      setSchedulePageRefreshKey((key) => key + 1);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan jadwal.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleOpen = async (sched) => {
    try {
      await adminApi.updateSchedule(sched.id, {
        is_open: !sched.is_open
      });
      setFeedback({
        type: 'info',
        message: `Pendaftaran jadwal ${sched.program_name} (${sched.batch || ''}) diubah menjadi ${!sched.is_open ? 'DIBUKA' : 'DITUTUP'}.`
      });
      fetchData();
      setSchedulePageRefreshKey((key) => key + 1);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal mengubah status pendaftaran.' });
    }
  };

  // Filtered schedules
  const filtered = (selectedCatalogId ? schedulePageData : schedules).filter((s) => {
    if (selectedCatalogId && String(s.course_catalog_id) !== String(selectedCatalogId)) return false;
    const matchDiv = divisionFilter === 'all' || getDivisionGroup(s.division) === divisionFilter;
    const normalizedFormat = String(s.format || '').toLowerCase();
    const matchFmt =
      formatFilter === 'all' ||
      normalizedFormat === formatFilter ||
      (formatFilter === 'daring' && normalizedFormat === 'online') ||
      (formatFilter === 'luring' && normalizedFormat === 'offline');
    const searchable = [s.program_name, s.course_catalog?.title, s.batch, s.level, s.location, s.schedule_text, s.division]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchSearch =
      !searchTerm ||
      searchable.includes(searchTerm.trim().toLowerCase());
    return matchDiv && matchFmt && matchSearch;
  });
  const roleDivisions = getRoleDivisions(role);
  const showProgramColumn = !roleDivisions || role === 'admin_ppb';
  const activeTermsForProgram = terms.filter((term) =>
    term.is_active && (
      term.program === 'all' ||
      term.program === formData.division ||
      (['ppb', 'ppb_english', 'ppb_foreign'].includes(formData.division) && term.program === 'ppb')
    )
  );
  const visibleCatalogs = catalogs.filter((catalog) =>
    (!roleDivisions || roleDivisions.includes(catalog.division)) &&
    (divisionFilter === 'all' || getDivisionGroup(catalog.division) === divisionFilter)
  );
  const filteredCatalogs = visibleCatalogs.filter((catalog) =>
    !searchTerm || String(catalog.title || '').toLowerCase().includes(searchTerm.trim().toLowerCase())
  );
  const selectedCatalog = visibleCatalogs.find((catalog) => String(catalog.id) === String(selectedCatalogId));

  const setField = (field) => (event) => setFormData((current) => ({ ...current, [field]: event.target.value }));
  const feedbackVariant = feedback.type === 'error' ? 'error' : feedback.type === 'success' ? 'success' : 'info';
  const dateLabel = (date, options) => date ? new Date(date).toLocaleDateString('id-ID', options || { day: '2-digit', month: 'short', year: 'numeric' }) : '?';
  const levels = catalogLevels.length ? catalogLevels.map((level) => level.name) : getLevelOptions(formData.program_name, formData.division, masterOptions.level_presets);
  const formats = masterOptions.formats?.length ? masterOptions.formats : [{ value: 'daring', label: 'Daring (Online)' }, { value: 'luring', label: 'Luring (Tatap Muka)' }, { value: 'hybrid', label: 'Hybrid' }];
  const selectedTerm = activeTermsForProgram.find((term) => String(term.id) === String(formData.term_id));
  return (
    <main className="space-y-5 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">{selectedCatalog ? `Jadwal ${selectedCatalog.title}` : 'Jadwal Kursus'}</h1><p className="mt-1 text-sm text-slate-500">{selectedCatalog ? 'Kelola jadwal kelas untuk kursus ini.' : 'Pilih kursus untuk melihat dan mengelola jadwal kelasnya.'}</p></div><div className="flex flex-wrap gap-2">{selectedCatalog && <Button variant="outline" onClick={() => { setSelectedCatalogId(null); setSchedulePage(0); fetchData(); }}><IconArrowLeft size={18} />Daftar Kursus</Button>}<Button variant="outline" onClick={() => { fetchData(); setSchedulePageRefreshKey((key) => key + 1); }} disabled={loading}><IconRefresh size={18} />Refresh</Button><Button onClick={handleOpenCreate} disabled={!selectedCatalog}><IconPlus size={18} />Tambah Jadwal</Button></div></header>
      {feedback.message && <Alert variant={feedbackVariant}><span>{feedback.message}</span><button type="button" className="ml-auto" aria-label="Tutup notifikasi" onClick={() => setFeedback({ type: '', message: '' })}>?</button></Alert>}
      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {(!roleDivisions || (role === 'admin_ppb' && !selectedCatalog)) && <label className="space-y-1.5 text-sm font-medium">{role === 'admin_ppb' ? 'Kelompok PPB' : 'Divisi Program'}<Select value={divisionFilter} onChange={(event) => setDivisionFilter(event.target.value)}><option value="all">Semua Divisi</option><option value="ppb">PPB (Inggris)</option><option value="ppb_foreign">PPB Non Inggris</option>{role !== 'admin_ppb' && <><option value="ppp">PPP</option><option value="bipa">BIPA</option></>}</Select></label>}
        {selectedCatalog && <label className="space-y-1.5 text-sm font-medium">Format Belajar<Select value={formatFilter} onChange={(event) => { setFormatFilter(event.target.value); setSchedulePage(0); }}><option value="all">Semua Format</option><option value="daring">Daring (Online)</option><option value="luring">Luring (Tatap Muka)</option><option value="hybrid">Hybrid</option></Select></label>}
        <label className="space-y-1.5 text-sm font-medium">{selectedCatalog ? 'Cari jadwal atau level' : 'Cari nama kursus'}<Input placeholder={selectedCatalog ? 'Cari jadwal atau level...' : 'Cari nama kursus...'} value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setSchedulePage(0); }} /></label>
      </Card>
      {!selectedCatalog ? <Card className="overflow-x-auto"><Table className="min-w-[700px]"><TableHeader className="bg-slate-50"><TableRow className="hover:bg-transparent"><TableHead>Kursus</TableHead>{showProgramColumn && <TableHead>{role === 'admin_ppb' ? 'Kelompok PPB' : 'Program'}</TableHead>}<TableHead className="text-center">Jumlah Jadwal</TableHead><TableHead className="text-right">Buka</TableHead></TableRow></TableHeader><TableBody>{loading ? <TableRow className="hover:bg-transparent"><TableCell colSpan={roleDivisions ? 3 : 4} className="py-10 text-center"><span className="mx-auto block size-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" /></TableCell></TableRow> : filteredCatalogs.length === 0 ? <TableRow className="hover:bg-transparent"><TableCell colSpan={roleDivisions ? 3 : 4} className="py-10 text-center text-slate-500">Tidak ada kursus yang cocok.</TableCell></TableRow> : filteredCatalogs.map((catalog) => <TableRow key={catalog.id} className="cursor-pointer" onClick={() => { setSchedulePage(0); setSelectedCatalogId(catalog.id); }}><TableCell className="font-semibold">{catalog.title}</TableCell>{showProgramColumn && <TableCell><Badge variant="outline">{getDivisionLabel(catalog.division)}</Badge></TableCell>}<TableCell className="text-center">{schedules.filter((schedule) => String(schedule.course_catalog_id) === String(catalog.id)).length}</TableCell><TableCell className="text-right"><IconExternalLink size={18} className="ml-auto" /></TableCell></TableRow>)}</TableBody></Table></Card> : <Card className="overflow-x-auto"><Table className="min-w-[1050px]"><TableHeader className="bg-slate-50"><TableRow className="hover:bg-transparent"><TableHead>Kursus / Program</TableHead><TableHead>Divisi</TableHead><TableHead>Batch / Periode</TableHead><TableHead>Jadwal Hari & Jam</TableHead><TableHead>Format & Lokasi</TableHead><TableHead>Biaya Kursus</TableHead><TableHead className="text-center">Buka Pendaftaran</TableHead><TableHead className="text-center">Aksi</TableHead></TableRow></TableHeader><TableBody>{loading || schedulePageLoading ? <TableRow className="hover:bg-transparent"><TableCell colSpan={8} className="py-10 text-center"><span className="mx-auto block size-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" /><p className="mt-2 text-sm text-slate-500">Memuat daftar jadwal kursus...</p></TableCell></TableRow> : filtered.length === 0 ? <TableRow className="hover:bg-transparent"><TableCell colSpan={8} className="py-10 text-center text-slate-500">Tidak ada jadwal kursus yang cocok.</TableCell></TableRow> : filtered.map((row) => <TableRow key={row.id}><TableCell><p className="font-semibold">{row.program_name}</p><p className="text-xs text-slate-500">Level: {row.level || 'Semua Level'}</p></TableCell><TableCell><Badge variant="outline">{getDivisionLabel(row.division)}</Badge></TableCell><TableCell><p>{row.batch || '-'}</p>{row.start_date && <p className="text-xs text-slate-500">Mulai: {row.start_date}</p>}</TableCell><TableCell>{row.schedule_text || '-'}</TableCell><TableCell><Badge variant={row.format === 'daring' || row.format === 'online' ? 'default' : 'success'}>{row.format === 'daring' || row.format === 'online' ? 'Daring' : row.format === 'luring' || row.format === 'offline' ? 'Luring (Tatap Muka)' : 'Hybrid'}</Badge><p className="mt-1 text-xs text-slate-500">{row.location}</p></TableCell><TableCell><p className="font-semibold text-blue-800">{row.fee ? `Rp ${parseInt(row.fee, 10).toLocaleString('id-ID')}` : (row.fee_display || 'Gratis')}</p><p className="text-xs text-slate-500">Kuota: {row.capacity} kursi</p></TableCell><TableCell className="text-center"><button type="button" onClick={() => handleToggleOpen(row)} title="Klik untuk Buka/Tutup pendaftaran"><Badge variant={row.is_open ? 'success' : 'outline'} className="cursor-pointer">{row.is_open ? 'Pendaftaran Dibuka' : 'Ditutup'}</Badge></button></TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" aria-label={`Edit jadwal ${row.program_name}`} onClick={() => handleOpenEdit(row)}><IconEdit size={18} /></Button></TableCell></TableRow>)}</TableBody></Table>{!loading && !schedulePageLoading && schedulePagination && <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between"><label className="flex items-center gap-2 text-sm">Jadwal per halaman<Select className="h-9 w-20" value={scheduleRowsPerPage} onChange={(event) => { setScheduleRowsPerPage(Number(event.target.value)); setSchedulePage(0); }}>{[5, 10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}</Select></label><div className="flex items-center gap-2 text-sm"><span>{Number(schedulePagination.total || 0) === 0 ? '0?0 dari 0' : `${schedulePage * scheduleRowsPerPage + 1}?${Math.min((schedulePage + 1) * scheduleRowsPerPage, Number(schedulePagination.total || 0))} dari ${schedulePagination.total}`}</span><Button variant="outline" size="sm" disabled={schedulePage <= 0} onClick={() => setSchedulePage((page) => Math.max(0, page - 1))}>Sebelumnya</Button><Button variant="outline" size="sm" disabled={schedulePage + 1 >= Number(schedulePagination.last_page || 1)} onClick={() => setSchedulePage((page) => page + 1)}>Berikutnya</Button></div></div>}</Card>}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}><DialogContent className="sm:max-w-4xl"><DialogHeader><DialogTitle>{editingId ? 'Edit Jadwal Kursus' : 'Tambah Jadwal Kursus Baru'}</DialogTitle></DialogHeader><form onSubmit={handleSubmit} className="space-y-5">
        <section className="space-y-3"><h3 className="text-sm font-bold text-blue-800">1. Hubungkan ke Katalog Kursus</h3><label className="block space-y-1.5 text-sm font-medium">Pilih Kursus (Course Catalog)<Select required value={formData.course_catalog_id} onChange={(event) => handleCatalogSelect(event.target.value)}><option value="">-- Pilih dari Daftar Kursus --</option>{visibleCatalogs.map((catalog) => <option key={catalog.id} value={catalog.id}>[{String(catalog.division || '').toUpperCase()}] {catalog.title}</option>)}</Select><span className="block text-xs font-normal text-slate-500">Memilih kursus akan otomatis memunculkan jadwal di website calon peserta.</span></label></section>
        <section className="space-y-3 border-t pt-4"><h3 className="text-sm font-bold text-blue-800">2. Detail Batch & Jadwal Belajar</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm font-medium">Nama Program / Kursus<Input required value={formData.program_name} onChange={setField('program_name')} /></label>
          <label className="space-y-1.5 text-sm font-medium lg:col-span-2">Term / Periode<Select required value={formData.term_id || ''} onChange={(event) => { const term = activeTermsForProgram.find((item) => String(item.id) === String(event.target.value)); setFormData((current) => ({ ...current, term_id: event.target.value, batch: term?.name || '', start_date: term?.start_date || '', end_date: term?.end_date || '', registration_open: term?.registration_open || '', registration_close: term?.registration_close || '' })); }}><option value="">-- Pilih Term Aktif --</option>{activeTermsForProgram.map((term) => <option key={term.id} value={term.id}>{term.name} [{term.program.toUpperCase()}]{term.is_current ? ' ? Current' : ''} ? {dateLabel(term.start_date)} s/d {dateLabel(term.end_date)}</option>)}</Select><span className="block text-xs font-normal text-slate-500">Pilih term aktif dari master.</span></label>
          <label className="space-y-1.5 text-sm font-medium">Divisi<Select value={formData.division} onChange={setField('division')}><option value="ppb">PPB (Inggris)</option><option value="ppb_english">PPB Bahasa Inggris</option><option value="ppb_foreign">PPB Non Inggris</option><option value="ppp">PPP (Penerjemahan)</option><option value="bipa">BIPA</option></Select></label>
          <label className="space-y-1.5 text-sm font-medium">Level Kursus<Input list="schedule-levels" value={formData.level || ''} onChange={(event) => { const level = event.target.value; const found = catalogLevels.find((item) => item.name === level); setFormData((current) => ({ ...current, level, course_level_id: found ? found.id : current.course_level_id })); }} /><datalist id="schedule-levels">{levels.map((level) => <option key={level} value={level} />)}</datalist><span className="block text-xs font-normal text-slate-500">{catalogLevels.length ? 'Level resmi master kursus' : 'Rekomendasi otomatis sesuai kursus'}</span></label>
          <label className="space-y-1.5 text-sm font-medium">Format Belajar<Select value={formData.format} onChange={(event) => handleFormatChange(event.target.value)}>{formats.map((format) => <option key={format.value} value={format.value}>{format.label}</option>)}</Select></label>
          <label className="space-y-1.5 text-sm font-medium">Pilihan Hari<Select value={formData.selected_day || ''} onChange={(event) => handleDayTimeChange('day', event.target.value)}><option value="">-- Pilih Hari Belajar --</option>{(masterOptions.days?.length ? masterOptions.days : DAY_PRESETS).map((day) => <option key={day} value={day}>{day}</option>)}<option value="custom">Kustom / Lainnya</option></Select></label>
          <label className="space-y-1.5 text-sm font-medium">Sesi Waktu / Jam<Select value={formData.selected_time || ''} onChange={(event) => handleDayTimeChange('time', event.target.value)}><option value="">-- Pilih Jam Belajar --</option>{(masterOptions.times?.length ? masterOptions.times : TIME_PRESETS).map((time) => <option key={time} value={time}>{time}</option>)}<option value="custom">Kustom / Lainnya</option></Select></label>
          <label className="space-y-1.5 text-sm font-medium sm:col-span-2">Teks Jadwal yang Tampil di Website<Input required value={formData.schedule_text} onChange={setField('schedule_text')} /><span className="block text-xs font-normal text-slate-500">Tersusun otomatis dari hari & jam di atas (bisa disesuaikan bebas)</span></label>
          <label className="space-y-1.5 text-sm font-medium">Lokasi Kursus / Ruang<Input list="schedule-locations" value={formData.location || ''} onChange={setField('location')} /><datalist id="schedule-locations">{(masterOptions.locations?.length ? masterOptions.locations : LOCATION_PRESETS).map((location) => <option key={location} value={location} />)}</datalist></label>
        </div></section>
        {selectedTerm && <section className="rounded-lg border border-blue-200 bg-blue-50 p-4"><h3 className="text-sm font-bold text-blue-800">?? Detail Term: {selectedTerm.name}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><p><span className="block text-xs text-slate-500">Kursus Berjalan</span>{dateLabel(selectedTerm.start_date, { day: '2-digit', month: 'long', year: 'numeric' })} s/d {dateLabel(selectedTerm.end_date, { day: '2-digit', month: 'long', year: 'numeric' })}</p><p><span className="block text-xs text-slate-500">Window Pendaftaran</span>{dateLabel(selectedTerm.registration_open, { day: '2-digit', month: 'long', year: 'numeric' })} s/d {dateLabel(selectedTerm.registration_close, { day: '2-digit', month: 'long', year: 'numeric' })}</p></div></section>}
        <section className="space-y-3 border-t pt-4"><h3 className="text-sm font-bold text-blue-800">3. Biaya & Kuota Kelas</h3><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm font-medium">Biaya Registrasi (Master Tarif)<Input readOnly value={feePreview.loading ? 'Memuat tarif...' : formatFeeAmount(feePreview.registration?.amount)} /><span className="block text-xs font-normal text-slate-500">{feePreview.registration?.name || 'Atur tarif registrasi pada menu Master Tarif.'}</span></label><label className="space-y-1.5 text-sm font-medium">Biaya Kursus (Master Tarif)<Input readOnly value={feePreview.loading ? 'Memuat tarif...' : formatFeeAmount(feePreview.tuition?.amount)} /><span className="block text-xs font-normal text-slate-500">{feePreview.tuition?.name || 'Atur tarif kursus pada menu Master Tarif.'}</span></label><label className="space-y-1.5 text-sm font-medium">Kapasitas Kuota Kelas (Orang)<Input required type="number" min="1" value={formData.capacity} onChange={setField('capacity')} /></label></div></section>
        <div className="grid gap-3 border-t pt-4 sm:grid-cols-2"><label className="flex items-center gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" className="size-4 accent-emerald-600" checked={formData.is_open} onChange={(event) => setFormData((current) => ({ ...current, is_open: event.target.checked }))} />Buka Pendaftaran (Calon siswa bisa mendaftar via web)</label><label className="flex items-center gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" className="size-4 accent-blue-700" checked={formData.is_active} onChange={(event) => setFormData((current) => ({ ...current, is_active: event.target.checked }))} />Aktifkan Jadwal (Tampil di Website)</label></div>
        <DialogFooter><Button variant="outline" onClick={() => setOpenDialog(false)} disabled={submitting}>Batal</Button><Button type="submit" disabled={submitting || feePreview.loading || !formData.term_id}>{submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Buat Jadwal Kursus'}</Button></DialogFooter>
      </form></DialogContent></Dialog>
    </main>
  );
}
