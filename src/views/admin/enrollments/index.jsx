// src/views/admin/enrollments/index.jsx
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Pagination,
  Tabs,
  Tab,
  Avatar,
  InputAdornment
} from './enrollmentUi';
import {
  IconEye,
  IconEdit,
  IconRefresh,
  IconUser,
  IconSchool,
  IconSearch,
  IconCheck,
  IconCalendarEvent,
  IconWorld,
  IconFileText,
  IconCertificate,
  IconCreditCard,
  IconDownload,
  IconX,
  IconId,
  IconPhone,
  IconMail,
  IconBook2,
  IconKey
} from '@tabler/icons-react';

import { adminApi } from '../../../api/adminApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useSearchParams, useLocation } from 'react-router-dom';
import { parseBoolean, createWorkflowEditData } from './utils/enrollmentData';

const ADMIN_ONLY_METADATA_KEYS = new Set([
  'admin_workflow', 'identity_documents', 'bipa_documents',
  'registration_fee_type', 'registration_fee_rule_id'
]);
const PPB_PERSONAL_METADATA_KEYS = new Set([
  'nationality', 'identity_type', 'identity_number', 'kitas_number', 'passport_number',
  'emergency_phone', 'address', 'profile'
]);

const PARTICIPANT_METADATA_DEFAULTS = {
  ppb: {
    test_language: '',
    test_date: '',
    nationality: 'wni',
    identity_type: 'ktp',
    student_category: 'baru',
    identity_number: '',
    emergency_phone: '',
    kitas_number: '',
    passport_number: '',
    information_sources: [],
    information_source_other: '',
    relief_requested: false,
    terms_accepted: false,
    address: '',
    notes: '',
    profile: { birth_place: '', birth_date: '', gender: '', education: '', occupation: '', address: '' }
  },
  bipa: {
    bipa: {
      birth_date: '', birth_place: '', gender: '', education: '', occupation: '', address: '',
      emergency_contact: '', nationality: '', passport_number: '', country_of_origin: '',
      native_language: '', visa_type: 'tourist', kitas_number: '', proficiency_level: 'beginner',
      purpose_of_study: '', information_source: '', terms_accepted: false, notes: ''
    }
  },
  ppp: {
    ppp: {
      applicant_category: 'individual', organization_name: '', service_type: 'ept_toefl',
      service_purpose: 'graduation_ui', document_language_from: '', document_language_to: '',
      document_type: '', document_count: '', deadline_date: '', test_date_preference: '',
      test_location: 'depok', participant_count: '', identity_number: '', birth_date: '',
      terms_accepted: false, notes: ''
    }
  }
};

const createParticipantEditData = (enrollment) => {
  const division = String(enrollment.division || '').toLowerCase();
  const schemaKey = division.startsWith('ppb') ? 'ppb' : division;
  const defaults = PARTICIPANT_METADATA_DEFAULTS[schemaKey] || {};
  const metadata = Object.fromEntries(
    Object.entries(enrollment.metadata || {}).filter(([key]) => !ADMIN_ONLY_METADATA_KEYS.has(key))
  );
  const mergedMetadata = { ...defaults, ...metadata };

  for (const key of ['profile', 'bipa', 'ppp']) {
    if (defaults[key] || metadata[key]) {
      mergedMetadata[key] = { ...(defaults[key] || {}), ...(metadata[key] || {}) };
    }
  }
  if (schemaKey === 'ppb') {
    const accountProfile = enrollment.participant_profile || enrollment.user?.profile || {};
    const savedProfile = metadata.profile || {};
    mergedMetadata.nationality = String(mergedMetadata.nationality || 'wni').toLowerCase();
    mergedMetadata.profile = Object.fromEntries(
      Object.keys(defaults.profile).map((key) => [
        key,
        savedProfile[key] || metadata[key] || accountProfile[key] || ''
      ])
    );
    if (mergedMetadata.nationality === 'wni' && !mergedMetadata.identity_number) {
      mergedMetadata.identity_number = accountProfile.identity_number || '';
    }
  }

  return {
    student_name: enrollment.student_name || '',
    student_email: enrollment.student_email || '',
    student_phone: enrollment.student_phone || '',
    metadata: mergedMetadata
  };
};

const createEnrollmentEditData = (enrollment) => {
  if (!enrollment) return {};
  return {
    division: enrollment.division || '',
    student_type: enrollment.student_type || '',
    registration_track: enrollment.registration_track || '',
    term_id: enrollment.term_id != null ? String(enrollment.term_id) : '',
    term_period: enrollment.term_period || enrollment.term?.name || '',
    course_catalog_id: enrollment.course_catalog_id != null ? String(enrollment.course_catalog_id) : '',
    course_name: enrollment.course_name || '',
    course_level_id: enrollment.course_level_id != null ? String(enrollment.course_level_id) : '',
    level_name: enrollment.level_name || '',
    course_schedule_id: enrollment.course_schedule_id != null ? String(enrollment.course_schedule_id) : '',
    campus_location: enrollment.campus_location || '',
    learning_mode: enrollment.learning_mode || '',
    schedule_days: enrollment.schedule_days || '',
    schedule_time: enrollment.schedule_time || '',
    discount_percent: enrollment.discount_percent ?? 0,
    registration_fee: enrollment.registration_fee ?? 0,
    tuition_fee: enrollment.tuition_fee ?? 0,
  };
};

const formatParticipantLabel = (key) => key
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase());

const PARTICIPANT_FIELD_LABELS = {
  test_language: 'Bahasa Tes Penempatan',
  test_date: 'Tanggal Tes Penempatan',
  test_date_preference: 'Preferensi Tanggal Tes',
  test_location: 'Preferensi Lokasi Tes',
  information_sources: 'Sumber Informasi LBI',
  information_source_other: 'Sumber Informasi Lainnya',
  student_category: 'Kategori Peserta',
  terms_accepted: 'Persetujuan Syarat & Ketentuan',
  relief_requested: 'Permintaan Keringanan'
};

const PARTICIPANT_FIELD_OPTIONS = {
  nationality: [['wni', 'WNI'], ['wna', 'WNA']],
  identity_type: [['ktp', 'KTP'], ['sim', 'SIM'], ['kia', 'KIA'], ['student_card', 'Kartu Pelajar']],
  gender: [['L', 'Laki-laki'], ['P', 'Perempuan']],
  visa_type: [['tourist', 'Turis (Tourist)'], ['student_kitas', 'Pelajar / Mahasiswa (KITAS)'], ['diplomatic', 'Diplomatik'], ['other', 'Lainnya']],
  proficiency_level: [['beginner', 'Pemula (Beginner)'], ['intermediate', 'Menengah (Intermediate)'], ['advanced', 'Mahir (Advanced)']],
  applicant_category: [['individual', 'Individu / Perorangan'], ['corporate', 'Perusahaan'], ['institution', 'Institusi / Instansi']],
  service_type: [['ept_toefl', 'EPT / TOEFL'], ['translation', 'Penerjemahan Dokumen'], ['interpreting', 'Penjurubahasaan (Interpreting)'], ['in_house_training', 'In-house Training'], ['special_test', 'Tes Khusus']],
  service_purpose: [['graduation_ui', 'Syarat Kelulusan UI'], ['scholarship', 'Beasiswa'], ['job_application', 'Lamaran Kerja'], ['legal', 'Keperluan Hukum']],
  test_location: [['depok', 'Kampus UI Depok'], ['salemba', 'Kampus UI Salemba'], ['online', 'Daring (Online)']]
};

const renderParticipantMetadata = (metadata, onChange, parentPath = 'metadata') =>
  Object.entries(metadata || {}).map(([key, value]) => {
    if (ADMIN_ONLY_METADATA_KEYS.has(key)) return null;
    if (parentPath === 'metadata' && PPB_PERSONAL_METADATA_KEYS.has(key)) return null;
    const path = `${parentPath}.${key}`;
    const label = PARTICIPANT_FIELD_LABELS[key] || formatParticipantLabel(key);

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return (
        <Box key={path} className="[grid-column:1_/_-1] [margin-top:8px]">
          <Typography variant="subtitle2" fontWeight={700} className="[margin-bottom:8px] [color:#334155]">
            {label}
          </Typography>
          <Box className="[padding-left:16px] [border-left:2px_solid_#cbd5e1] [display:grid] [grid-template-columns:1fr] [@media(min-width:600px)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:12px]">
            {renderParticipantMetadata(value, onChange, path)}
          </Box>
        </Box>
      );
    }

    if (typeof value === 'boolean' || ['terms_accepted', 'relief_requested'].includes(key)) {
      const checked = parseBoolean(value);
      return (
        <TextField key={path} select fullWidth size="small" label={label} value={checked ? 'yes' : 'no'} onChange={(event) => onChange(path, event.target.value === 'yes')}>
          <MenuItem value="yes">Ya / Disetujui</MenuItem>
          <MenuItem value="no">Tidak</MenuItem>
        </TextField>
      );
    }

    if (PARTICIPANT_FIELD_OPTIONS[key]) {
      return (
        <TextField key={path} select fullWidth size="small" label={label} value={value ?? ''} onChange={(event) => onChange(path, event.target.value)}>
          <MenuItem value="">Pilih opsi</MenuItem>
          {PARTICIPANT_FIELD_OPTIONS[key].map(([optionValue, optionLabel]) => (
            <MenuItem key={optionValue} value={optionValue}>{optionLabel}</MenuItem>
          ))}
        </TextField>
      );
    }

    const isArray = Array.isArray(value);
    const isDate = /(^date$|_date$)/.test(key);
    const isNumber = typeof value === 'number';
    return (
      <TextField
        key={path}
        fullWidth
        size="small"
        multiline={isArray || key === 'notes' || key === 'address'}
        minRows={isArray || key === 'notes' || key === 'address' ? 2 : undefined}
        type={isDate ? 'date' : isNumber ? 'number' : 'text'}
        label={label}
        value={isArray ? value.join(', ') : value ?? ''}
        onChange={(event) => onChange(path, isArray ? event.target.value.split(',').map((item) => item.trim()).filter(Boolean) : isNumber ? Number(event.target.value) : event.target.value)}
      />
    );
  });

export default function AdminEnrollments({ defaultStage }) {
  const { role } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const requestedDivision = searchParams.get('division');

  // Strict page stage based on sidebar route (No duplication inside content)
  const isRegistrationsPath = location.pathname.includes('/registrations');
  const isCoursesPath = location.pathname.includes('/courses');
  const currentStage = defaultStage || (isCoursesPath ? 'courses' : isRegistrationsPath ? 'registrations' : (searchParams.get('stage') || 'registrations'));

  const roleDivision = {
    admin_bipa: 'bipa',
    admin_ppp: 'ppp'
  }[role] || '';

  const programOptions = useMemo(() => {
    if (role === 'admin_ppb') {
      return [
        ['all', 'PPB & Tes Bahasa', <IconSchool size={16} key="ppb-all" />],
        ['ppb', 'PPB Inggris', <IconSchool size={16} key="ppb-en" />],
        ['ppb_foreign', 'PPB Non Inggris', <IconWorld size={16} key="ppb-fn" />],
        ['testing', 'Tes Bahasa', <IconCertificate size={16} key="ppb-test" />]
      ];
    }
    if (roleDivision) {
      return [[roleDivision, roleDivision.toUpperCase(), roleDivision === 'bipa' ? <IconWorld size={16} key="bipa" /> : <IconFileText size={16} key="ppp" />]];
    }
    return [
      ['all', 'Semua Program', <IconSchool size={16} key="all" />],
      ['ppb', 'PPB Inggris', <IconSchool size={16} key="ppb" />],
      ['ppb_foreign', 'PPB Non Inggris', <IconWorld size={16} key="ppb-fn" />],
      ['testing', 'Tes Bahasa', <IconCertificate size={16} key="test" />],
      ['bipa', 'BIPA (Asing)', <IconWorld size={16} key="bipa" />],
      ['ppp', 'PPP (Penerjemahan)', <IconFileText size={16} key="ppp" />]
    ];
  }, [role, roleDivision]);

  // Data states
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [divisionFilter, setDivisionFilter] = useState(requestedDivision || roleDivision || 'all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [termFilter, setTermFilter] = useState('all');
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageRange, setPageRange] = useState({ from: 0, to: 0 });
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Dialog & Form States
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState(0);
  const [targetStatus, setTargetStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [workflowData, setWorkflowData] = useState({});
  const [participantData, setParticipantData] = useState({});
  const [enrollmentData, setEnrollmentData] = useState({});
  const [courseLevels, setCourseLevels] = useState([]);
  const [courseCatalogOptions, setCourseCatalogOptions] = useState([]);
  const [savingWorkflow, setSavingWorkflow] = useState(false);
  const detailRequestId = useRef(0);
  const [detailLoadError, setDetailLoadError] = useState('');

  // Inject Payment Modal States (Offline & Maintenance Fallback)
  const [injectModalOpen, setInjectModalOpen] = useState(false);
  const [injectLoading, setInjectLoading] = useState(false);
  const [injectForm, setInjectForm] = useState({
    payment_for: 'tuition',
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    channel: 'cash',
    reference_number: '',
    note: ''
  });

  // Cache Master Data in Ref
  const masterCache = useRef({
    catalogs: null,
    schedules: null,
    terms: null
  });

  useEffect(() => {
    const canViewLanguageTests = role === 'administrator' || role === 'admin_ppb';
    if (requestedDivision === 'testing' && canViewLanguageTests) {
      setDivisionFilter('testing');
    }
  }, [requestedDivision, role]);

  const fetchTerms = useCallback(async (progScope = '') => {
    try {
      const prog = progScope === 'all' ? '' : (progScope.startsWith('ppb') || progScope === 'testing') ? 'ppb' : progScope;
      const res = await adminApi.getTerms(prog);
      if (res?.success && Array.isArray(res.data)) {
        setTerms(res.data);
        masterCache.current.terms = res.data;
      }
    } catch (err) {
      console.error('Failed to load terms:', err);
    }
  }, []);

  useEffect(() => {
    fetchTerms(divisionFilter);
  }, [divisionFilter, fetchTerms]);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        division: divisionFilter === 'all' ? '' : divisionFilter,
        term_id: termFilter === 'all' ? '' : termFilter,
        registration_track: trackFilter === 'all' ? '' : trackFilter,
        status: statusFilter === 'all' ? '' : statusFilter,
        workflow_stage: currentStage,
        search: submittedSearchTerm,
        page
      };
      const res = await adminApi.getEnrollments(params);
      if (!res?.success || !Array.isArray(res.data) || !res.meta) {
        throw new Error(res?.message || 'Gagal memuat data pendaftaran.');
      }
      setEnrollments(res.data);
      setTotalPages(res.meta.last_page || 1);
      setTotalCount(res.meta.total || 0);
      setPageRange({ from: res.meta.from || 0, to: res.meta.to || 0 });
      setFeedback({ type: '', message: '' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat daftar pendaftaran.' });
    } finally {
      setLoading(false);
    }
  }, [divisionFilter, termFilter, trackFilter, statusFilter, currentStage, submittedSearchTerm, page]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    if (selectedEnrollment) {
      setParticipantData(createParticipantEditData(selectedEnrollment));
      setEnrollmentData(createEnrollmentEditData(selectedEnrollment));
      setWorkflowData(createWorkflowEditData(selectedEnrollment));
    }
  }, [selectedEnrollment]);

  const handleProgramTabChange = (event, newValue) => {
    setDivisionFilter(newValue);
    setTermFilter('all');
    setTrackFilter('all');
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearchTerm(searchTerm.trim());
    setPage(1);
  };

  const closeEnrollmentDetail = () => {
    detailRequestId.current += 1;
    setDetailDialogOpen(false);
    setSelectedEnrollment(null);
  };

  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  const handleOpenStatusDialog = (enr) => {
    setSelectedEnrollment(enr);
    setTargetStatus(enr.status || 'pending_payment');
    setStatusDialogOpen(true);
  };

  const handleOpenEnrollmentDetail = async (enrollment, event) => {
    event?.currentTarget?.blur();
    const requestId = ++detailRequestId.current;
    setDetailLoadError('');
    setDialogTab(0);

    setSelectedEnrollment(enrollment);
    setParticipantData(createParticipantEditData(enrollment));
    setEnrollmentData(createEnrollmentEditData(enrollment));
    setDetailDialogOpen(true);

    const asList = (response) => Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.data) ? response.data.data : [];

    try {
      const detailResponse = await adminApi.getEnrollmentDetail(enrollment.id);
      if (detailResponse?.success) {
        const raw = detailResponse.data;
        const fullEnrollment = (raw && typeof raw === 'object' && raw.data) ? raw.data : raw;
        if (fullEnrollment?.id && requestId === detailRequestId.current) {
          setSelectedEnrollment(fullEnrollment);
          setParticipantData(createParticipantEditData(fullEnrollment));
          setEnrollmentData(createEnrollmentEditData(fullEnrollment));
        }
      }

      if (!masterCache.current.catalogs) {
        const catRes = await adminApi.getCourseCatalogs();
        masterCache.current.catalogs = asList(catRes);
      }
      setCourseCatalogOptions(masterCache.current.catalogs || []);

      if (!masterCache.current.schedules) {
        const schedRes = await adminApi.getSchedules();
        masterCache.current.schedules = asList(schedRes);
      }
      const catalogId = enrollment.course_catalog_id;
      if (catalogId) {
        const lvlRes = await adminApi.getLevelsByCourse(catalogId);
        if (requestId === detailRequestId.current) {
          setCourseLevels(asList(lvlRes));
        }
      }
    } catch (err) {
      console.error('Failed to load detail dialog options:', err);
      if (requestId === detailRequestId.current) {
        setDetailLoadError(err.message || 'Sebagian data detail gagal dimuat.');
      }
    }
  };

  const handleEnrollmentFieldChange = (key, value) => {
    setEnrollmentData((current) => ({ ...current, [key]: value }));
  };

  const handleEnrollmentDivisionChange = (division) => {
    setEnrollmentData((current) => ({
      ...current,
      division,
      course_catalog_id: '',
      course_name: '',
      course_level_id: '',
      level_name: '',
      course_schedule_id: '',
      schedule_days: '',
      schedule_time: '',
      learning_mode: ''
    }));
    setCourseLevels([]);
  };

  const handleEnrollmentCatalogChange = async (catalogId) => {
    const catalog = courseCatalogOptions.find((item) => String(item.id) === String(catalogId));
    setEnrollmentData((current) => ({
      ...current,
      course_catalog_id: catalogId,
      course_name: catalog?.title || '',
      division: catalog?.division || current.division,
      course_level_id: '',
      level_name: '',
      course_schedule_id: '',
      schedule_days: '',
      schedule_time: '',
      learning_mode: ''
    }));
    if (!catalogId) {
      setCourseLevels([]);
      return;
    }
    try {
      const response = await adminApi.getLevelsByCourse(catalogId);
      setCourseLevels(Array.isArray(response?.data) ? response.data : response?.data?.data || []);
    } catch {
      setCourseLevels([]);
    }
  };

  const handleParticipantFieldChange = (path, value) => {
    const keys = path.split('.');
    setParticipantData((current) => {
      const next = { ...current, metadata: { ...current.metadata } };
      let source = next;
      for (const key of keys.slice(0, -1)) {
        source[key] = { ...source[key] };
        source = source[key];
      }
      source[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handlePpbNationalityChange = (nationality) => {
    setParticipantData((current) => ({
      ...current,
      metadata: {
        ...current.metadata,
        nationality,
        ...(nationality === 'wni'
          ? { kitas_number: '', passport_number: '' }
          : { identity_type: '', identity_number: '' })
      }
    }));
  };

  const handleSaveAllChanges = async () => {
    if (!selectedEnrollment) return;
    setSavingWorkflow(true);
    try {
      const response = await adminApi.updateEnrollmentWorkflow(selectedEnrollment.id, {
        participant_fields: participantData,
        enrollment_fields: enrollmentData,
        ...workflowData
      });
      const updatedEnrollment = response?.data || response;
      setSelectedEnrollment(updatedEnrollment);
      setParticipantData(createParticipantEditData(updatedEnrollment));
      setEnrollmentData(createEnrollmentEditData(updatedEnrollment));
      setWorkflowData((current) => ({ ...current, course_level_id: updatedEnrollment.course_level_id || current.course_level_id }));
      setEnrollments((current) => current.map((item) => item.id === updatedEnrollment.id ? { ...item, ...updatedEnrollment } : item));
      setFeedback({ type: 'success', message: 'Semua perubahan pendaftaran berhasil disimpan!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan perubahan pendaftaran.' });
    } finally {
      setSavingWorkflow(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!selectedEnrollment) return;
    setUpdatingStatus(true);
    try {
      await adminApi.updateEnrollmentStatus(selectedEnrollment.id, targetStatus);
      setFeedback({ type: 'success', message: `Status pendaftaran #${selectedEnrollment.id} berhasil diubah ke ${targetStatus}.` });
      closeStatusDialog();
      fetchEnrollments();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal mengubah status.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Helper: returns true when this enrollment already has ALL relevant charges paid/verified
  const isEnrollmentFullyPaid = (enr) => {
    if (!enr) return false;
    const PAID_STATUSES = ['paid', 'approved', 'confirmed', 'verified', 'success', 'lunas', 'active'];
    const payStatus = String(enr.payment_status || '').toLowerCase();
    const enrStatus = String(enr.status || '').toLowerCase();
    // If any verified payment exists, consider paid
    const hasVerifiedPayment = Array.isArray(enr.payments) && enr.payments.some((p) =>
      PAID_STATUSES.includes(String(p.status || '').toLowerCase())
    );
    return hasVerifiedPayment || PAID_STATUSES.includes(payStatus) || ['confirmed', 'active', 'approved'].includes(enrStatus);
  };

  const handleOpenInjectModal = (targetEnrollment = null) => {
    const enr = targetEnrollment || selectedEnrollment;
    if (!enr) return;
    const isCourseMode = currentStage === 'courses';
    const defaultFor = isCourseMode ? 'tuition' : 'registration';
    const defaultAmount = isCourseMode
      ? Number(enr.tuition_fee || 0)
      : Number(enr.registration_fee || 160000);

    setInjectForm({
      payment_for: defaultFor,
      payment_date: new Date().toISOString().split('T')[0],
      amount: defaultAmount,
      channel: 'cash',
      reference_number: '',
      note: ''
    });
    setInjectModalOpen(true);
  };

  const handleSubmitInjectPayment = async (e) => {
    if (e) e.preventDefault();
    if (!selectedEnrollment) return;
    if (!injectForm.amount || Number(injectForm.amount) <= 0) {
      setFeedback({ type: 'error', message: 'Nominal pembayaran harus lebih dari 0' });
      return;
    }
    if (!injectForm.payment_date) {
      setFeedback({ type: 'error', message: 'Tanggal pembayaran harus diisi' });
      return;
    }

    setInjectLoading(true);
    try {
      const res = await adminApi.injectPayment(selectedEnrollment.id, injectForm);
      setFeedback({
        type: 'success',
        message: 'Pembayaran berhasil di-inject lunas dan langsung tercatat di modul Finance.'
      });
      setInjectModalOpen(false);
      const updated = res?.data || res;
      if (updated) {
        setSelectedEnrollment(updated);
        setEnrollments((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
      }
      fetchEnrollments();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal melakukan inject pembayaran.'
      });
    } finally {
      setInjectLoading(false);
    }
  };

  // Harmonized Status Chips (Tenang, elegan, konsisten dengan enterprise theme)
  const getStatusChip = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'approved' || s === 'paid' || s === 'confirmed') {
      return (
        <Chip
          label={s === 'approved' ? 'Disetujui' : 'Confirmed'}
          size="small"
          className="[font-weight:600] [background-color:#ecfdf5] [color:#047857] [border:1px_solid_#a7f3d0]"
        />
      );
    }
    if (s === 'placement_test' || s === 'schedule_selection') {
      return (
        <Chip
          label={s === 'placement_test' ? 'Menunggu Tes' : 'Pilih Jadwal'}
          size="small"
          className="[font-weight:600] [background-color:#eff6ff] [color:#1d4ed8] [border:1px_solid_#bfdbfe]"
        />
      );
    }
    if (s === 'pending_payment' || s === 'pending') {
      return (
        <Chip
          label={s === 'pending_payment' ? 'Pending Bayar' : 'Pending'}
          size="small"
          className="[font-weight:600] [background-color:#fffbeb] [color:#b45309] [border:1px_solid_#fde68a]"
        />
      );
    }
    if (s === 'rejected' || s === 'cancelled') {
      return (
        <Chip
          label={s === 'rejected' ? 'Ditolak' : 'Dibatalkan'}
          size="small"
          className="[font-weight:600] [background-color:#fef2f2] [color:#b91c1c] [border:1px_solid_#fecaca]"
        />
      );
    }
    return <Chip label={status || 'Ditunda'} size="small" variant="outlined" className="[color:#64748b]" />;
  };

  const getPaymentChip = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'verified' || normalized === 'confirmed') {
      return (
        <Chip
          label="Lunas · Terverifikasi"
          size="small"
          className="[font-weight:600] [background-color:#ecfdf5] [color:#047857] [border:1px_solid_#a7f3d0]"
        />
      );
    }
    if (normalized === 'rejected') {
      return (
        <Chip
          label="Ditolak"
          size="small"
          className="[font-weight:600] [background-color:#fef2f2] [color:#b91c1c] [border:1px_solid_#fecaca]"
        />
      );
    }
    return (
      <Chip
        label="Menunggu verifikasi"
        size="small"
        className="[font-weight:600] [background-color:#fffbeb] [color:#b45309] [border:1px_solid_#fde68a]"
      />
    );
  };

  // Program Badge: Palet Slate Netral Elegan (Bukan Pelangi)
  const getDivisionBadge = (division) => {
    const d = String(division || '').toLowerCase();
    const label = d === 'testing' ? 'Tes Bahasa' : d.startsWith('ppb') ? 'PPB' : d === 'bipa' ? 'BIPA' : d === 'ppp' ? 'PPP' : division?.toUpperCase();
    return (
      <Chip
        label={label}
        size="small"
        className="[font-weight:700] [background-color:#f1f5f9] [color:#334155] [border:1px_solid_#e2e8f0] [font-size:0.75rem]"
      />
    );
  };

  const getTrackBadge = (track) => {
    if (track === 'language_test') {
      return <Chip label="Tes Bahasa" size="small" variant="outlined" className="[font-weight:600] [color:#475569]" />;
    }
    if (track === 'placement_test') {
      return <Chip label="Placement Test" size="small" variant="outlined" className="[font-weight:600] [color:#475569]" />;
    }
    return <Chip label="Kelas Langsung" size="small" variant="outlined" className="[font-weight:600] [color:#475569]" />;
  };

  const currentDivisionKey = String(selectedEnrollment?.division || '').toLowerCase();
  const isPpb = currentDivisionKey.startsWith('ppb');
  const isBipa = currentDivisionKey === 'bipa';
  const isPpp = currentDivisionKey === 'ppp';

  const pageTitle = requestedDivision === 'testing'
    ? 'Data Tes Bahasa & EPT'
    : currentStage === 'courses'
      ? 'Data Peserta Kursus & Akademik'
      : 'Data Registrasi & Pendaftaran Peserta';

  const pageDescription = requestedDivision === 'testing'
    ? 'Pantau data peserta tes penempatan & tes bahasa, jadwal preferensi, serta hasil tes.'
    : currentStage === 'courses'
      ? 'Pantau peserta kelas aktif, penetapan jadwal belajar, status kelulusan, dan biaya kursus (tuition).'
      : 'Kelola data pendaftaran awal peserta, verifikasi identitas, dan status pembayaran biaya registrasi.';

  return (
    <Box className="[padding:16px] [@media(min-width:900px)]:[padding:24px]">
      {/* ── CLEAN ENTERPRISE HEADER (NO OVERPOWERING BANNER) ── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        className="[margin-bottom:20px]"
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" className="[margin-bottom:4px]">
            <Typography variant="h3" fontWeight={700} className="[color:#1e293b]">
              {pageTitle}
            </Typography>
            <Chip
              label={currentStage === 'courses' ? 'Akademik' : requestedDivision === 'testing' ? 'Testing' : 'Registrasi'}
              size="small"
              className="[background-color:#f1f5f9] [color:#475569] [font-weight:600] [border:1px_solid_#e2e8f0]"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {pageDescription}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<IconRefresh size={18} />}
            onClick={() => {
              masterCache.current = { catalogs: null, schedules: null, terms: null };
              fetchTerms(divisionFilter);
              fetchEnrollments();
            }}
            disabled={loading}
            className="[border-radius:8px] [border-color:#cbd5e1] [color:#334155] [font-weight:600] [text-transform:none] [&:hover]:[border-color:#94a3b8] [&:hover]:[background-color:#f8fafc] [white-space:nowrap]"
          >
            Muat Ulang
          </Button>
        </Stack>
      </Stack>

      {feedback.message && (
        <Alert severity={feedback.type || 'info'} className="[margin-bottom:20px]" onClose={() => setFeedback({ type: '', message: '' })}>
          {feedback.message}
        </Alert>
      )}

      {/* ── FILTER & PROGRAM TABS CARD ── */}
      <Card variant="outlined" className="[margin-bottom:20px] [border-radius:8px] [background-color:#ffffff] [border-color:#e2e8f0]">
        <CardContent className="[padding:16px] [@media(min-width:600px)]:[padding:20px]">
          {/* Program Tabs */}
          {programOptions.length > 1 && (
            <Box className="[margin-bottom:16px] [border-bottom:1px_solid_#e2e8f0]">
              <Tabs
                value={divisionFilter}
                onChange={handleProgramTabChange}
                variant="scrollable"
                allowScrollButtonsMobile
                className="min-h-[42px] overflow-x-auto"
              >
                {programOptions.map(([value, label, icon]) => (
                  <Tab key={value} label={label} value={value} icon={icon} iconPosition="start" />
                ))}
              </Tabs>
            </Box>
          )}

          {/* Clean Filter Controls */}
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={1.5} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Periode Term"
                  value={termFilter}
                  onChange={(e) => {
                    setTermFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Semua Periode Term</MenuItem>
                  {terms.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name} {t.is_current ? '⭐ (Aktif)' : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Jalur Pendaftaran"
                  value={trackFilter}
                  onChange={(e) => {
                    setTrackFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Semua Jalur</MenuItem>
                  <MenuItem value="no_test">Kelas Langsung</MenuItem>
                  <MenuItem value="placement_test">Placement Test</MenuItem>
                  <MenuItem value="language_test">Tes Bahasa</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status Pendaftaran"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">Semua Status</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="placement_test">Menunggu Tes</MenuItem>
                  <MenuItem value="schedule_selection">Pilih Jadwal</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="pending_payment">Pending Payment</MenuItem>
                  <MenuItem value="postponed">Ditunda</MenuItem>
                  <MenuItem value="rejected">Ditolak</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 8, md: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Cari Nama, Email, No. Reg..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconSearch size={16} color="#94a3b8" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4, md: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  className="[height:40px] [font-weight:700] [text-transform:none] [background-color:#1e40af] [&:hover]:[background-color:#1e3a8a]"
                >
                  Cari
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* ── MAIN TABLE ── */}
      <TableContainer
        component={Paper}
        variant="outlined"
        className="[border-radius:8px] [border-color:#e2e8f0] [overflow-x:auto] [width:100%] [&::-webkit-scrollbar]:[height:8px] [&::-webkit-scrollbar-track]:[background-color:#f1f5f9] [&::-webkit-scrollbar-track]:[border-radius:16px] [&::-webkit-scrollbar-thumb]:[background-color:#cbd5e1] [&::-webkit-scrollbar-thumb]:[border-radius:16px] [&::-webkit-scrollbar-thumb]:[&:hover]:[background-color:#94a3b8]"
      >
        <Table className="[min-width:1100px]">
          <TableHead className="[background-color:#f8fafc]">
            <TableRow>
              <TableCell className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [white-space:nowrap] [min-width:150px]">No. Registrasi</TableCell>
              <TableCell className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [white-space:nowrap] [min-width:200px]">Peserta</TableCell>
              <TableCell className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [white-space:nowrap] [min-width:110px]">Program</TableCell>
              <TableCell className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [white-space:nowrap] [min-width:140px]">Jalur</TableCell>
              <TableCell className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [min-width:200px]">Kursus / Layanan</TableCell>
              <TableCell className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [white-space:nowrap] [min-width:140px]">Periode Term</TableCell>
              <TableCell className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [white-space:nowrap] [min-width:140px]">{currentStage === 'courses' ? 'Biaya Kursus' : 'Biaya Registrasi'}</TableCell>
              <TableCell className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [white-space:nowrap] [min-width:140px]">Pembayaran</TableCell>
              <TableCell className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [white-space:nowrap] [min-width:140px]">Status</TableCell>
              <TableCell
                align="center"
                className="[font-weight:700] [color:#475569] [font-size:0.8rem] [text-transform:uppercase] [white-space:nowrap] [min-width:100px] [position:sticky] [right:0px] [background-color:#f8fafc] [z-index:2] [border-left:1px_solid_#e2e8f0] [box-shadow:-4px_0_8px_rgba(0,0,0,0.03)]"
              >
                Aksi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" className="[padding-top:48px] [padding-bottom:48px]">
                  <CircularProgress size={32} className="[color:#1e40af]" />
                  <Typography variant="body2" className="[margin-top:12px] [color:#64748b] [font-weight:600]">
                    Memuat data...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" className="[padding-top:48px] [padding-bottom:48px]">
                  <Typography variant="body1" fontWeight={600} color="text.secondary">
                    Tidak ada data pendaftaran yang sesuai dengan filter.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enr) => (
                <TableRow
                  key={enr.id}
                  hover
                  className="[&:hover]:[background-color:#f8fafc] [&:hover_.sticky-action-cell]:[background-color:#f8fafc]"
                >
                  <TableCell className="[font-family:monospace] [font-weight:700] [color:#334155] [font-size:0.875rem] [white-space:nowrap]">
                    {enr.registration_number || `#${enr.id}`}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar className="[width:32px] [height:32px] [background-color:#f1f5f9] [color:#334155] [font-weight:700] [font-size:0.8rem] [border:1px_solid_#e2e8f0]">
                        {enr.student_name ? enr.student_name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700} color="#0f172a">{enr.student_name}</Typography>
                        <Typography variant="caption" color="#64748b">{enr.student_email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{getDivisionBadge(enr.division)}</TableCell>
                  <TableCell>{getTrackBadge(enr.registration_track)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="#1e293b">{enr.course_name}</Typography>
                    {enr.level_name && (
                      <Typography variant="caption" color="#64748b" display="block">Level: {enr.level_name}</Typography>
                    )}
                  </TableCell>
                  <TableCell className="[white-space:nowrap]">
                    <Chip
                      icon={<IconCalendarEvent size={13} color="#64748b" />}
                      label={enr.term?.name || enr.term_period || '-'}
                      size="small"
                      variant="outlined"
                      className="[font-size:0.75rem] [font-weight:600] [color:#475569] [border-color:#e2e8f0]"
                    />
                  </TableCell>
                  <TableCell className="[white-space:nowrap]">
                    <Typography variant="body2" fontWeight={700} color="#0f172a">
                      Rp {parseInt(currentStage === 'courses' ? enr.tuition_fee || 0 : enr.registration_fee || 0).toLocaleString('id-ID')}
                    </Typography>
                  </TableCell>
                  <TableCell className="[white-space:nowrap]">
                    {(() => {
                      const paymentType = currentStage === 'courses' ? 'tuition' : 'registration';
                      const payment = (enr.payments || [])
                        .filter((item) => item.payment_for === paymentType || (!item.payment_for && paymentType === 'registration'))
                        .sort((left, right) => String(right.created_at || '').localeCompare(String(left.created_at || '')))[0];
                      return payment
                        ? getPaymentChip(payment.status)
                        : currentStage === 'courses' && enr.metadata?.admin_workflow?.payment_injected_date
                          ? <Chip label="Injection dicatat" size="small" className="[background-color:#ecfdf5] [color:#047857] [border:1px_solid_#a7f3d0] [font-weight:600]" />
                          : <Chip label="Belum bayar" size="small" variant="outlined" className="[color:#94a3b8] [border-color:#e2e8f0]" />;
                    })()}
                  </TableCell>
                  <TableCell className="[white-space:nowrap]">{getStatusChip(enr.status)}</TableCell>
                  <TableCell
                    align="center"
                    className="sticky-action-cell [position:sticky] [right:0px] [background-color:#ffffff] [z-index:1] [border-left:1px_solid_#e2e8f0] [box-shadow:-4px_0_8px_rgba(0,0,0,0.03)] [transition:background-color_0.15s_ease]"
                  >
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Lihat & Edit Detail Form">
                        <IconButton size="small" onClick={(event) => handleOpenEnrollmentDetail(enr, event)} className="[color:#334155] [&:hover]:[background-color:#f1f5f9]">
                          <IconEye size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ubah Status">
                        <IconButton size="small" onClick={() => handleOpenStatusDialog(enr)} className="[color:#475569] [&:hover]:[background-color:#f1f5f9]">
                          <IconEdit size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalCount > 0 && (
        <Box className="[display:flex] [justify-content:space-between] [align-items:center] [margin-top:20px] [flex-wrap:wrap] [gap:16px]">
          <Typography variant="body2" color="text.secondary">
            Menampilkan <strong>{pageRange.from}–{pageRange.to}</strong> dari <strong>{totalCount}</strong> data
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, val) => setPage(val)}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* ── DETAIL MODAL (CLEAN ENTERPRISE DIALOG) ── */}
      <Dialog
        open={detailDialogOpen}
        onClose={closeEnrollmentDetail}
        maxWidth="lg"
        fullWidth
      >
        {/* Clean Dialog Header */}
        <Box className="[background-color:#ffffff] [color:#0f172a] [padding-left:24px] [padding-right:24px] [padding-top:16px] [padding-bottom:16px] [display:flex] [justify-content:space-between] [align-items:center] [border-bottom:1px_solid_#e2e8f0]">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" className="[background-color:#f1f5f9] [color:#475569] [padding-left:8px] [padding-right:8px] [padding-top:2.4px] [padding-bottom:2.4px] [border-radius:4px] [font-weight:700]">
                {currentStage === 'courses' ? 'KURSUS & AKADEMIK' : 'FORMULIR REGISTRASI'}
              </Typography>
              <Typography variant="caption" className="[color:#64748b] [font-weight:600]">
                {selectedEnrollment?.division?.toUpperCase()}
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={800} className="[color:#1e293b] [margin-top:4px]">
              {selectedEnrollment?.registration_number || `#${selectedEnrollment?.id}`}
            </Typography>
          </Box>
          <IconButton onClick={closeEnrollmentDetail} className="[color:#64748b] [&:hover]:[background-color:#f1f5f9]">
            <IconX size={20} />
          </IconButton>
        </Box>

        {selectedEnrollment && (
          <Box className="[background-color:#f8fafc] [padding-left:24px] [padding-right:24px] [padding-top:14px] [padding-bottom:14px] [border-bottom:1px_solid_#e2e8f0]">
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 8 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar className="[width:44px] [height:44px] [background-color:#e2e8f0] [color:#1e293b] [font-size:1.1rem] [font-weight:700]">
                    {selectedEnrollment.student_name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="#0f172a">
                      {selectedEnrollment.student_name}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" className="[color:#64748b] [font-size:0.85rem] [margin-top:2px]" flexWrap="wrap">
                      <Box className="[display:flex] [align-items:center] [gap:4px]">
                        <IconMail size={15} /> {selectedEnrollment.student_email}
                      </Box>
                      {selectedEnrollment.student_phone && (
                        <Box className="[display:flex] [align-items:center] [gap:4px]">
                          <IconPhone size={15} /> {selectedEnrollment.student_phone}
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }} className="[text-align:left] [@media(min-width:600px)]:[text-align:right]">
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} alignItems="center">
                  {getStatusChip(selectedEnrollment.status)}
                  <Chip
                    label={isPpb ? 'PPB' : isBipa ? 'BIPA' : isPpp ? 'PPP' : 'TES'}
                    size="small"
                    variant="outlined"
                    className="[font-weight:700] [color:#475569] [border-color:#cbd5e1]"
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Dialog Subtabs */}
        <Box className="[border-bottom:1px_solid_#e2e8f0] [padding-left:24px] [padding-right:24px] [background-color:#ffffff]">
          <Tabs
            value={dialogTab}
            onChange={(e, val) => setDialogTab(val)}
            className="min-h-[44px] overflow-x-auto"
          >
            <Tab value={0} icon={<IconSchool size={16} />} iconPosition="start" label="Program & Kursus" />
            <Tab value={1} icon={<IconUser size={16} />} iconPosition="start" label="Data Pribadi & Profil" />
            <Tab value={2} icon={<IconCreditCard size={16} />} iconPosition="start" label="Riwayat Pembayaran" />
            <Tab value={3} icon={<IconCertificate size={16} />} iconPosition="start" label="Dokumen & Administrasi" />
          </Tabs>
        </Box>

        <DialogContent className="[padding:24px] [background-color:#ffffff]">
          {detailLoadError && <Alert severity="warning" className="[margin-bottom:16px]">{detailLoadError}</Alert>}

          {selectedEnrollment && (
            <Box>
              {/* ── TAB 0: PROGRAM & KURSUS ── */}
              {dialogTab === 0 && (
                <Stack spacing={2}>
                  <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                    <CardContent className="[padding:16px]">
                      <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[margin-bottom:12px] [display:flex] [align-items:center] [gap:8px]">
                        <IconBook2 size={16} color="#475569" /> Program & Jalur Pendaftaran
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Divisi / Program"
                            value={enrollmentData.division || selectedEnrollment?.division || ''}
                            onChange={(event) => handleEnrollmentDivisionChange(event.target.value)}
                          >
                            <MenuItem value="ppb">PPB (Bahasa Inggris)</MenuItem>
                            <MenuItem value="ppb_foreign">PPB (Bahasa Non-Inggris)</MenuItem>
                            <MenuItem value="testing">Tes Bahasa (Testing)</MenuItem>
                            <MenuItem value="bipa">BIPA (Penutur Asing)</MenuItem>
                            <MenuItem value="ppp">PPP (Penerjemahan)</MenuItem>
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Jalur Pendaftaran"
                            value={enrollmentData.registration_track || selectedEnrollment?.registration_track || ''}
                            onChange={(event) => handleEnrollmentFieldChange('registration_track', event.target.value)}
                          >
                            <MenuItem value="no_test">Tanpa Tes / Langsung</MenuItem>
                            <MenuItem value="placement_test">Placement Test</MenuItem>
                            <MenuItem value="language_test">Tes Bahasa</MenuItem>
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Jenis Peserta"
                            value={enrollmentData.student_type ?? selectedEnrollment?.student_type ?? ''}
                            onChange={(event) => handleEnrollmentFieldChange('student_type', event.target.value)}
                            placeholder="Contoh: Baru / Lanjutan"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                    <CardContent className="[padding:16px]">
                      <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[margin-bottom:12px] [display:flex] [align-items:center] [gap:8px]">
                        <IconSchool size={16} color="#475569" /> Kelas, Jadwal & Format Belajar
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Periode Term"
                            value={String(enrollmentData.term_id ?? selectedEnrollment?.term_id ?? '')}
                            onChange={(event) => {
                              const term = terms.find((item) => String(item.id) === String(event.target.value));
                              setEnrollmentData((current) => ({
                                ...current,
                                term_id: event.target.value,
                                term_period: term?.name || '',
                                course_schedule_id: '',
                                schedule_days: '',
                                schedule_time: ''
                              }));
                            }}
                          >
                            <MenuItem value="">Pilih term</MenuItem>
                            {terms.map((term) => (
                              <MenuItem key={term.id} value={String(term.id)}>
                                {term.name} &bull; {term.program?.toUpperCase()}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Katalog Kursus"
                            value={String(enrollmentData.course_catalog_id ?? selectedEnrollment?.course_catalog_id ?? '')}
                            onChange={(event) => handleEnrollmentCatalogChange(event.target.value)}
                          >
                            <MenuItem value="">Pilih kursus</MenuItem>
                            {courseCatalogOptions.map((catalog) => (
                              <MenuItem key={catalog.id} value={String(catalog.id)}>
                                {catalog.title} [{catalog.division?.toUpperCase()}]
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Level Kursus"
                            value={String(enrollmentData.course_level_id ?? selectedEnrollment?.course_level_id ?? '')}
                            onChange={(event) => {
                              const level = courseLevels.find((item) => String(item.id) === String(event.target.value));
                              setEnrollmentData((current) => ({
                                ...current,
                                course_level_id: event.target.value,
                                level_name: level?.name || ''
                              }));
                            }}
                          >
                            <MenuItem value="">Belum ditetapkan</MenuItem>
                            {courseLevels.map((lvl) => (
                              <MenuItem key={lvl.id} value={String(lvl.id)}>
                                {lvl.name} (Tingkat {lvl.level_order})
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Format Belajar"
                            value={enrollmentData.learning_mode || selectedEnrollment?.learning_mode || ''}
                            onChange={(event) => handleEnrollmentFieldChange('learning_mode', event.target.value)}
                          >
                            <MenuItem value="">Pilih format</MenuItem>
                            <MenuItem value="luring">Luring (Tatap Muka)</MenuItem>
                            <MenuItem value="daring">Daring (Online)</MenuItem>
                            <MenuItem value="hybrid">Hybrid</MenuItem>
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Lokasi Kampus"
                            value={enrollmentData.campus_location || selectedEnrollment?.campus_location || ''}
                            onChange={(event) => handleEnrollmentFieldChange('campus_location', event.target.value)}
                          >
                            <MenuItem value="">Pilih lokasi</MenuItem>
                            <MenuItem value="depok">Kampus UI Depok</MenuItem>
                            <MenuItem value="salemba">Kampus UI Salemba</MenuItem>
                            <MenuItem value="online">Online / Daring</MenuItem>
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Hari Jadwal"
                            value={enrollmentData.schedule_days ?? selectedEnrollment?.schedule_days ?? ''}
                            onChange={(event) => handleEnrollmentFieldChange('schedule_days', event.target.value)}
                            placeholder="Contoh: Senin & Rabu"
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Jam Jadwal"
                            value={enrollmentData.schedule_time ?? selectedEnrollment?.schedule_time ?? ''}
                            onChange={(event) => handleEnrollmentFieldChange('schedule_time', event.target.value)}
                            placeholder="Contoh: 17:00 - 19:30 WIB"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                    <CardContent className="[padding:16px]">
                      <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[margin-bottom:12px] [display:flex] [align-items:center] [gap:8px]">
                        <IconCreditCard size={16} color="#475569" /> Tarif & Biaya Tagihan
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Biaya Registrasi (Rp)"
                            value={enrollmentData.registration_fee ?? selectedEnrollment?.registration_fee ?? 0}
                            onChange={(event) => handleEnrollmentFieldChange('registration_fee', event.target.value)}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Biaya Kursus / Tuition (Rp)"
                            value={enrollmentData.tuition_fee ?? selectedEnrollment?.tuition_fee ?? 0}
                            onChange={(event) => handleEnrollmentFieldChange('tuition_fee', event.target.value)}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Diskon Keringanan (%)"
                            value={enrollmentData.discount_percent ?? selectedEnrollment?.discount_percent ?? 0}
                            onChange={(event) => handleEnrollmentFieldChange('discount_percent', event.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* TOKEN CODE DPT / SERIAL NUMBER PLACEMENT TEST */}
                  {selectedEnrollment?.metadata?.placement_test_token && (
                    <Card variant="outlined" className="[border-radius:6px] [border-color:#fde68a] [background-color:#fffbeb]">
                      <CardContent className="[padding:16px]">
                        <Stack direction="row" justifyContent="space-between" alignItems="center" className="[margin-bottom:12px]">
                          <Typography variant="subtitle2" fontWeight={700} color="#b45309" className="[display:flex] [align-items:center] [gap:8px]">
                            <IconKey size={16} color="#b45309" /> Serial Number / Token DPT (Placement Test)
                          </Typography>
                          <Chip
                            label="Disembunyikan dari Tampilan Siswa di Web"
                            size="small"
                            className="[background-color:#fef3c7] [color:#92400e] [font-weight:600] [font-size:0.75rem]"
                          />
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary">Nomor Serial / Token Code</Typography>
                            <Box className="[padding:10px] [margin-top:4px] [background-color:#ffffff] [border:1px_dashed_#d97706] [border-radius:6px] [font-family:monospace] [font-weight:700] [font-size:1.05rem] [color:#92400e] [letter-spacing:0.5px]">
                              {selectedEnrollment.metadata.placement_test_token.token_code}
                            </Box>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">Waktu Mulai Aktif</Typography>
                            <Typography variant="body2" fontWeight={600} color="#1e293b" className="[margin-top:6px]">
                              {selectedEnrollment.metadata.placement_test_token.activation_start_date || '-'}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 3 }}>
                            <Typography variant="caption" color="text.secondary">Waktu Berakhir</Typography>
                            <Typography variant="body2" fontWeight={600} color="#ef4444" className="[margin-top:6px]">
                              {selectedEnrollment.metadata.placement_test_token.expiry_date || '-'}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Alert severity="info" className="[margin-top:16px] [padding-top:4px] [padding-bottom:4px] [font-size:0.8rem] [background-color:#eff6ff] [color:#1e40af]">
                          Serial number ini dialokasikan khusus untuk pendaftar PPB Inggris jalur tes penempatan dan dikirimkan langsung ke email peserta (<strong>{selectedEnrollment.student_email}</strong>) setelah status pembayaran lunas/terverifikasi.
                        </Alert>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              )}

              {/* ── TAB 1: DATA PRIBADI & PROFIL ── */}
              {dialogTab === 1 && (
                <Stack spacing={2}>
                  <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                    <CardContent className="[padding:16px]">
                      <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[margin-bottom:12px] [display:flex] [align-items:center] [gap:8px]">
                        <IconUser size={16} color="#475569" /> Kontak Utama Peserta
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Nama Lengkap"
                            value={participantData.student_name ?? selectedEnrollment?.student_name ?? ''}
                            onChange={(event) => handleParticipantFieldChange('student_name', event.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="email"
                            label="Email Aktif"
                            value={participantData.student_email ?? selectedEnrollment?.student_email ?? ''}
                            onChange={(event) => handleParticipantFieldChange('student_email', event.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Nomor Telepon / WhatsApp"
                            value={participantData.student_phone ?? selectedEnrollment?.student_phone ?? ''}
                            onChange={(event) => handleParticipantFieldChange('student_phone', event.target.value)}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* KHUSUS PROGRAM PPB */}
                  {isPpb && (
                    <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                      <CardContent className="[padding:16px]">
                        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[margin-bottom:12px] [display:flex] [align-items:center] [gap:8px]">
                          <IconId size={16} color="#475569" /> Identitas & Data Pribadi Peserta PPB
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Kewarganegaraan"
                              value={participantData.metadata?.nationality || 'wni'}
                              onChange={(event) => handlePpbNationalityChange(event.target.value)}
                            >
                              <MenuItem value="wni">WNI (Warga Negara Indonesia)</MenuItem>
                              <MenuItem value="wna">WNA (Warga Negara Asing)</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nomor Telepon Darurat"
                              value={participantData.metadata?.emergency_phone || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.emergency_phone', event.target.value)}
                            />
                          </Grid>

                          {participantData.metadata?.nationality === 'wna' ? (
                            <>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Nomor Paspor"
                                  value={participantData.metadata?.passport_number || ''}
                                  onChange={(event) => handleParticipantFieldChange('metadata.passport_number', event.target.value)}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Nomor KITAS (opsional)"
                                  value={participantData.metadata?.kitas_number || ''}
                                  onChange={(event) => handleParticipantFieldChange('metadata.kitas_number', event.target.value)}
                                />
                              </Grid>
                            </>
                          ) : (
                            <>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  select
                                  fullWidth
                                  size="small"
                                  label="Jenis Identitas"
                                  value={participantData.metadata?.identity_type || 'ktp'}
                                  onChange={(event) => handleParticipantFieldChange('metadata.identity_type', event.target.value)}
                                >
                                  <MenuItem value="ktp">KTP</MenuItem>
                                  <MenuItem value="sim">SIM</MenuItem>
                                  <MenuItem value="kia">KIA</MenuItem>
                                  <MenuItem value="student_card">Kartu Pelajar</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Nomor Identitas (NIK)"
                                  value={participantData.metadata?.identity_number || selectedEnrollment?.participant_profile?.identity_number || ''}
                                  onChange={(event) => handleParticipantFieldChange('metadata.identity_number', event.target.value)}
                                />
                              </Grid>
                            </>
                          )}

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Tempat Lahir"
                              value={participantData.metadata?.profile?.birth_place || selectedEnrollment?.participant_profile?.birth_place || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.profile.birth_place', event.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="date"
                              label="Tanggal Lahir"
                              value={participantData.metadata?.profile?.birth_date || selectedEnrollment?.participant_profile?.birth_date || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.profile.birth_date', event.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Jenis Kelamin"
                              value={participantData.metadata?.profile?.gender || selectedEnrollment?.participant_profile?.gender || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.profile.gender', event.target.value)}
                            >
                              <MenuItem value="">Pilih gender</MenuItem>
                              <MenuItem value="L">Laki-laki</MenuItem>
                              <MenuItem value="P">Perempuan</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Pendidikan Terakhir"
                              value={participantData.metadata?.profile?.education || selectedEnrollment?.participant_profile?.education || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.profile.education', event.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Pekerjaan"
                              value={participantData.metadata?.profile?.occupation || selectedEnrollment?.participant_profile?.occupation || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.profile.occupation', event.target.value)}
                            />
                          </Grid>
                          <Grid size={12}>
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              minRows={2}
                              label="Alamat Lengkap Domisili"
                              value={participantData.metadata?.profile?.address || participantData.metadata?.address || selectedEnrollment?.participant_profile?.address || ''}
                              onChange={(event) => {
                                handleParticipantFieldChange('metadata.profile.address', event.target.value);
                                handleParticipantFieldChange('metadata.address', event.target.value);
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  {/* KHUSUS PROGRAM BIPA */}
                  {isBipa && (
                    <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                      <CardContent className="[padding:16px]">
                        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[margin-bottom:12px] [display:flex] [align-items:center] [gap:8px]">
                          <IconWorld size={16} color="#475569" /> Data Khusus Penutur Asing (BIPA)
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Negara Asal (Country of Origin)"
                              value={participantData.metadata?.bipa?.country_of_origin || participantData.metadata?.nationality || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.bipa.country_of_origin', event.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Bahasa Ibu (Native Language)"
                              value={participantData.metadata?.bipa?.native_language || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.bipa.native_language', event.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nomor Paspor"
                              value={participantData.metadata?.bipa?.passport_number || participantData.metadata?.passport_number || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.bipa.passport_number', event.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Jenis Visa"
                              value={participantData.metadata?.bipa?.visa_type || 'tourist'}
                              onChange={(event) => handleParticipantFieldChange('metadata.bipa.visa_type', event.target.value)}
                            >
                              <MenuItem value="tourist">Visa Turis</MenuItem>
                              <MenuItem value="student_kitas">KITAS Pelajar / Mahasiswa</MenuItem>
                              <MenuItem value="diplomatic">Visa Diplomatik</MenuItem>
                              <MenuItem value="other">Lainnya</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Tingkat Kemampuan Bahasa Awal"
                              value={participantData.metadata?.bipa?.proficiency_level || 'beginner'}
                              onChange={(event) => handleParticipantFieldChange('metadata.bipa.proficiency_level', event.target.value)}
                            >
                              <MenuItem value="beginner">Pemula (Beginner)</MenuItem>
                              <MenuItem value="intermediate">Menengah (Intermediate)</MenuItem>
                              <MenuItem value="advanced">Mahir (Advanced)</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Kontak Darurat di Indonesia"
                              value={participantData.metadata?.bipa?.emergency_contact || participantData.metadata?.emergency_phone || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.bipa.emergency_contact', event.target.value)}
                            />
                          </Grid>
                          <Grid size={12}>
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              minRows={2}
                              label="Alamat Tempat Tinggal di Indonesia"
                              value={participantData.metadata?.bipa?.address || participantData.metadata?.address || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.bipa.address', event.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  {/* KHUSUS PROGRAM PPP */}
                  {isPpp && (
                    <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                      <CardContent className="[padding:16px]">
                        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[margin-bottom:12px] [display:flex] [align-items:center] [gap:8px]">
                          <IconFileText size={16} color="#475569" /> Data Pemohon & Layanan PPP
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Kategori Pemohon"
                              value={participantData.metadata?.ppp?.applicant_category || 'individual'}
                              onChange={(event) => handleParticipantFieldChange('metadata.ppp.applicant_category', event.target.value)}
                            >
                              <MenuItem value="individual">Individu / Pribadi</MenuItem>
                              <MenuItem value="corporate">Perusahaan (Corporate)</MenuItem>
                              <MenuItem value="institution">Institusi / Lembaga</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nama Instansi / Perusahaan (Jika Ada)"
                              value={participantData.metadata?.ppp?.organization_name || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.ppp.organization_name', event.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Jenis Layanan"
                              value={participantData.metadata?.ppp?.service_type || 'ept_toefl'}
                              onChange={(event) => handleParticipantFieldChange('metadata.ppp.service_type', event.target.value)}
                            >
                              <MenuItem value="ept_toefl">EPT / TOEFL Preparation</MenuItem>
                              <MenuItem value="translation">Penerjemahan Dokumen</MenuItem>
                              <MenuItem value="interpreting">Penjurubahasaan (Interpreting)</MenuItem>
                              <MenuItem value="in_house_training">In-house Training</MenuItem>
                              <MenuItem value="special_test">Tes Bahasa Khusus</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Keperluan Layanan"
                              value={participantData.metadata?.ppp?.service_purpose || 'graduation_ui'}
                              onChange={(event) => handleParticipantFieldChange('metadata.ppp.service_purpose', event.target.value)}
                            >
                              <MenuItem value="graduation_ui">Wisuda / Kelulusan UI</MenuItem>
                              <MenuItem value="scholarship">Beasiswa</MenuItem>
                              <MenuItem value="job_application">Lamaran Pekerjaan</MenuItem>
                              <MenuItem value="legal">Keperluan Hukum / Legalitas</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Bahasa Asal & Sasaran Terjemahan"
                              value={`${participantData.metadata?.ppp?.document_language_from || 'Indonesia'} → ${participantData.metadata?.ppp?.document_language_to || 'Inggris'}`}
                              placeholder="Contoh: Indonesia → Inggris"
                              onChange={(event) => handleParticipantFieldChange('metadata.ppp.notes', event.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              size="small"
                              type="date"
                              label="Target Tanggal Selesai (Deadline)"
                              value={participantData.metadata?.ppp?.deadline_date || ''}
                              onChange={(event) => handleParticipantFieldChange('metadata.ppp.deadline_date', event.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  <Box className="[display:grid] [grid-template-columns:1fr] [@media(min-width:600px)]:[grid-template-columns:repeat(2,_minmax(0,_1fr))] [gap:12px]">
                    {renderParticipantMetadata(participantData.metadata, handleParticipantFieldChange)}
                  </Box>
                </Stack>
              )}

              {/* ── TAB 2: RIWAYAT PEMBAYARAN ── */}
              {dialogTab === 2 && (
                <Stack spacing={2}>
                  <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                    <CardContent className="[padding:16px]">
                      <Box className="[margin-bottom:16px] [display:flex] [justify-content:space-between] [align-items:center] [flex-wrap:wrap] [gap:12px]">
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[display:flex] [align-items:center] [gap:8px]">
                            <IconCreditCard size={16} color="#475569" /> Status Tagihan & Riwayat Transaksi
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Mencakup pembayaran online otomatis (BNI VA & Xendit) serta transaksi offline kasir yang di-inject.
                          </Typography>
                        </Box>
                        {!isEnrollmentFullyPaid(selectedEnrollment) && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<IconCreditCard size={16} />}
                          onClick={() => handleOpenInjectModal(selectedEnrollment)}
                          className="[background-color:#047857] [&:hover]:[background-color:#065f46] [text-transform:none] [font-weight:600] [border-radius:6px] [box-shadow:none]"
                        >
                          Inject Pembayaran Lunas
                        </Button>
                        )}
                      </Box>
                      {selectedEnrollment.payments?.length ? (
                        <Stack spacing={1.5}>
                          {selectedEnrollment.payments.map((payment) => (
                            <Box key={payment.id} className="[padding:16px] [border-radius:6px] [border:1px_solid_#e2e8f0] [background-color:#f8fafc]">
                              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={700} color="#0f172a">
                                    {payment.payment_for === 'tuition' ? 'Biaya Kursus (Tuition)' : 'Biaya Registrasi Awal'}
                                    {' — '}
                                    <span className="text-emerald-700">Rp {Number(payment.amount || 0).toLocaleString('id-ID')}</span>
                                  </Typography>
                                  <Typography variant="caption" color="#64748b" className="[margin-top:2px] [display:block]">
                                    Metode: <strong>{payment.bank_name || 'Virtual Account'}</strong> &bull; Tanggal: {payment.payment_date || '-'}
                                  </Typography>
                                  {payment.account_number && (
                                    <Typography variant="caption" className="[color:#334155] [font-family:monospace] [display:block] [margin-top:4px]">
                                      No. Rek / VA: {payment.account_number}
                                    </Typography>
                                  )}
                                </Box>
                                <Box>{getPaymentChip(payment.status)}</Box>
                              </Stack>
                              {payment.verified_note && (
                                <Alert severity="success" className="[margin-top:12px] [padding-top:4px] [padding-bottom:4px]">
                                  Catatan Verifikasi: {payment.verified_note}
                                </Alert>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      ) : selectedEnrollment.metadata?.admin_workflow?.payment_injected_date ? (
                        <Alert severity="info">
                          Pembayaran manual (injection) telah dicatat pada tanggal <strong>{selectedEnrollment.metadata.admin_workflow.payment_injected_date}</strong>.
                        </Alert>
                      ) : (
                        <Box className="[text-align:center] [padding-top:32px] [padding-bottom:32px] [color:#64748b]">
                          <IconCreditCard size={36} color="#94a3b8" className="mb-2" />
                          <Typography variant="body2">Belum ada riwayat pembayaran yang tercatat.</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Stack>
              )}

              {/* ── TAB 3: DOKUMEN & ADMINISTRASI ── */}
              {dialogTab === 3 && (
                <Stack spacing={2}>
                  {(Object.keys(selectedEnrollment.metadata?.identity_documents || {}).length > 0 || Object.keys(selectedEnrollment.metadata?.bipa_documents || {}).length > 0) && (
                    <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                      <CardContent className="[padding:16px]">
                        <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[margin-bottom:12px] [display:flex] [align-items:center] [gap:8px]">
                          <IconDownload size={16} color="#475569" /> Berkas & Dokumen Terunggah
                        </Typography>
                        <Grid container spacing={1.5}>
                          {Object.entries(selectedEnrollment.metadata.identity_documents || {}).map(([documentType]) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={documentType}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<IconDownload size={16} />}
                                onClick={() => adminApi.downloadEnrollmentDocument(selectedEnrollment.id, documentType)}
                                className="[justify-content:flex-start] [padding-top:6px] [padding-bottom:6px] [text-transform:none] [color:#334155] [border-color:#cbd5e1]"
                              >
                                Unduh {documentType === 'identity_document' ? `Identitas (${selectedEnrollment.metadata.identity_type?.toUpperCase() || 'KTP'})` : documentType === 'kitas_document' ? 'KITAS' : 'Paspor'}
                              </Button>
                            </Grid>
                          ))}
                          {Object.entries(selectedEnrollment.metadata.bipa_documents || {}).map(([documentType]) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={documentType}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<IconDownload size={16} />}
                                onClick={() => adminApi.downloadEnrollmentDocument(selectedEnrollment.id, documentType)}
                                className="[justify-content:flex-start] [padding-top:6px] [padding-bottom:6px] [text-transform:none] [color:#334155] [border-color:#cbd5e1]"
                              >
                                Unduh {documentType === 'bipa_photo' ? 'Pas Foto BIPA' : documentType === 'bipa_passport_copy' ? 'Salinan Paspor' : 'Surat Sponsor'}
                              </Button>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  )}

                  <Card variant="outlined" className="[border-radius:6px] [border-color:#e2e8f0]">
                    <CardContent className="[padding:16px]">
                      <Typography variant="subtitle2" fontWeight={700} color="#1e293b" className="[margin-bottom:12px] [display:flex] [align-items:center] [gap:8px]">
                        <IconCheck size={16} color="#475569" /> Checklist Administrasi & Status Akademik
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1.5} className="[margin-bottom:16px]">
                        <FormControlLabel
                          control={<Checkbox checked={parseBoolean(workflowData.test_complete)} onChange={(event) => setWorkflowData((data) => ({ ...data, test_complete: event.target.checked }))} />}
                          label="Tes Penempatan Selesai"
                        />
                        {selectedEnrollment.metadata?.nationality === 'wna' && (
                          <FormControlLabel
                            control={<Checkbox checked={parseBoolean(workflowData.wna_verified)} onChange={(event) => setWorkflowData((data) => ({ ...data, wna_verified: event.target.checked }))} />}
                            label="Verifikasi Dokumen WNA Selesai"
                          />
                        )}
                        <FormControlLabel
                          control={<Checkbox checked={parseBoolean(workflowData.relief_requested)} onChange={(event) => setWorkflowData((data) => ({ ...data, relief_requested: event.target.checked }))} />}
                          label="Ajukan Keringanan Biaya"
                        />
                        {workflowData.relief_requested && (
                          <FormControlLabel
                            control={<Checkbox checked={parseBoolean(workflowData.relief_approved)} onChange={(event) => setWorkflowData((data) => ({ ...data, relief_approved: event.target.checked }))} />}
                            label="Keringanan Biaya Disetujui"
                          />
                        )}
                      </Stack>

                      <Grid container spacing={2}>
                        {selectedEnrollment.registration_track === 'placement_test' && (
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label="Hasil Tes Penempatan"
                              value={workflowData.placement_test_result || ''}
                              onChange={(event) => setWorkflowData((data) => ({ ...data, placement_test_result: event.target.value }))}
                            >
                              <MenuItem value="">Belum ditetapkan</MenuItem>
                              <MenuItem value="lulus">Lulus</MenuItem>
                              <MenuItem value="tidak_lulus">Tidak Lulus</MenuItem>
                              <MenuItem value="tidak_perlu">Tidak Perlu Tes</MenuItem>
                            </TextField>
                          </Grid>
                        )}

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Hasil Kelulusan Kursus"
                            value={workflowData.completion_status || ''}
                            onChange={(event) => setWorkflowData((data) => ({ ...data, completion_status: event.target.value }))}
                          >
                            <MenuItem value="">Belum dinilai</MenuItem>
                            <MenuItem value="lulus">Lulus (Tamat Level)</MenuItem>
                            <MenuItem value="tidak_lulus">Tidak Lulus</MenuItem>
                            <MenuItem value="dalam_proses">Sedang Belajar (Dalam Proses)</MenuItem>
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            type="date"
                            fullWidth
                            size="small"
                            label="Tanggal Payment Injected (Manual)"
                            value={workflowData.payment_injected_date || ''}
                            onChange={(event) => setWorkflowData((data) => ({ ...data, payment_injected_date: event.target.value }))}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Stack>
              )}
            </Box>
          )}
        </DialogContent>

        {/* Clean Dialog Actions */}
        <DialogActions className="[padding-left:24px] [padding-right:24px] [padding-top:14px] [padding-bottom:14px] [background-color:#ffffff] [border-top:1px_solid_#e2e8f0] [justify-content:space-between]">
          <Button onClick={closeEnrollmentDetail} className="[font-weight:600] [color:#64748b] [text-transform:none]">
            Tutup
          </Button>

          <Stack direction="row" spacing={1.5}>
            {!isEnrollmentFullyPaid(selectedEnrollment) && (
            <Button
              variant="outlined"
              startIcon={<IconCreditCard size={16} />}
              onClick={() => handleOpenInjectModal(selectedEnrollment)}
              className="[font-weight:600] [text-transform:none] [border-color:#a7f3d0] [color:#047857] [&:hover]:[background-color:#ecfdf5] [&:hover]:[border-color:#047857]"
            >
              Inject Lunas
            </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<IconEdit size={16} />}
              onClick={() => handleOpenStatusDialog(selectedEnrollment)}
              className="[font-weight:600] [text-transform:none] [border-color:#cbd5e1] [color:#334155]"
            >
              Ubah Status
            </Button>
            <Button
              variant="contained"
              startIcon={<IconCheck size={18} />}
              onClick={handleSaveAllChanges}
              disabled={savingWorkflow}
              className="[font-weight:700] [padding-left:20px] [padding-right:20px] [text-transform:none] [background-color:#1e40af] [&:hover]:[background-color:#1e3a8a]"
            >
              {savingWorkflow ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* ── CHANGE STATUS DIALOG ── */}
      <Dialog
        open={statusDialogOpen}
        onClose={closeStatusDialog}
        maxWidth="xs"
        fullWidth
      >
        <Box className="[padding:20px] [padding-bottom:8px]">
          <Typography variant="h5" fontWeight={700} color="#1e293b">Ubah Status Pendaftaran</Typography>
        </Box>
        <DialogContent className="[padding-top:8px]">
          <Typography variant="body2" color="text.secondary" className="[margin-bottom:16px]">
            Pilih status baru untuk pendaftaran <strong>{selectedEnrollment?.registration_number || `#${selectedEnrollment?.id}`}</strong>:
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            label="Status Baru"
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value)}
          >
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="placement_test">Placement Test</MenuItem>
            <MenuItem value="schedule_selection">Schedule Selection</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="pending_payment">Pending Payment</MenuItem>
            <MenuItem value="postponed">Postponed</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions className="[padding-left:20px] [padding-right:20px] [padding-bottom:20px]">
          <Button onClick={closeStatusDialog} disabled={updatingStatus} className="[text-transform:none] [color:#64748b]">Batal</Button>
          <Button variant="contained" onClick={handleSaveStatus} disabled={updatingStatus} className="[font-weight:600] [text-transform:none] [background-color:#1e40af]">
            {updatingStatus ? 'Menyimpan...' : 'Simpan Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── INJECT PAYMENT DIALOG (OFFLINE & MAINTENANCE FALLBACK) ── */}
      <Dialog
        open={injectModalOpen}
        onClose={() => !injectLoading && setInjectModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box className="[padding:20px] [padding-bottom:12px] [border-bottom:1px_solid_#e2e8f0]">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar className="[background-color:#ecfdf5] [color:#047857]">
              <IconCreditCard size={22} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} color="#1e293b">
                Inject Pembayaran Lunas
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Digunakan untuk pembayaran offline (kasir/teller/EDC) atau saat BNI/Xendit maintenance.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <DialogContent className="[padding-top:20px]">
          <Alert severity="info" className="[margin-bottom:20px] [background-color:#eff6ff] [color:#1e40af] [border:1px_solid_#bfdbfe]">
            Data pembayaran yang di-inject akan <strong>langsung berstatus Terverifikasi (Lunas)</strong> dan otomatis tercatat di laporan penerimaan modul <strong>Finance</strong>.
          </Alert>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Jenis Tagihan"
                value={injectForm.payment_for}
                onChange={(e) => {
                  const pFor = e.target.value;
                  const defaultAmt = pFor === 'tuition'
                    ? Number(selectedEnrollment?.tuition_fee || 0)
                    : Number(selectedEnrollment?.registration_fee || 160000);
                  setInjectForm((prev) => ({
                    ...prev,
                    payment_for: pFor,
                    amount: defaultAmt
                  }));
                }}
              >
                <MenuItem value="registration">Biaya Registrasi Awal</MenuItem>
                <MenuItem value="tuition">Biaya Kursus (Tuition)</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Metode / Kanal Pembayaran"
                value={injectForm.channel}
                onChange={(e) => setInjectForm((prev) => ({ ...prev, channel: e.target.value }))}
              >
                <MenuItem value="cash">💵 Kasir Tunai LBI FIB UI (Offline)</MenuItem>
                <MenuItem value="edc">💳 Mesin EDC / Kartu Debit/Kredit Kantor</MenuItem>
                <MenuItem value="bni_va_manual">🏛️ BNI VA (Inject Manual / Maintenance)</MenuItem>
                <MenuItem value="xendit_manual">⚡ Xendit Gateway (Inject Manual / Maintenance)</MenuItem>
                <MenuItem value="bank_transfer">🏦 Transfer Bank Offline / Teller</MenuItem>
                <MenuItem value="other">📝 Pembayaran Manual Lainnya</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Tanggal Pembayaran"
                value={injectForm.payment_date}
                onChange={(e) => setInjectForm((prev) => ({ ...prev, payment_date: e.target.value }))}
                helperText="Tanggal uang fisik diterima / mutasi bank"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Nominal Pembayaran (Rp)"
                value={injectForm.amount}
                onChange={(e) => setInjectForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                label="No. Kuitansi Fisik / Ref Mutasi / Struk"
                placeholder="Contoh: KWT-2026-089 / TRX-BNI-9842"
                value={injectForm.reference_number}
                onChange={(e) => setInjectForm((prev) => ({ ...prev, reference_number: e.target.value }))}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Catatan Verifikasi / Alasan Inject"
                placeholder="Contoh: Pembayaran tunai di loket kasir LBI FIB UI, atau BNI callback maintenance"
                value={injectForm.note}
                onChange={(e) => setInjectForm((prev) => ({ ...prev, note: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className="[padding-left:20px] [padding-right:20px] [padding-bottom:20px] [padding-top:8px] [border-top:1px_solid_#e2e8f0]">
          <Button
            onClick={() => setInjectModalOpen(false)}
            disabled={injectLoading}
            className="[text-transform:none] [color:#64748b]"
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitInjectPayment}
            disabled={injectLoading}
            className="[font-weight:600] [text-transform:none] [background-color:#047857] [&:hover]:[background-color:#065f46] [padding-left:24px] [padding-right:24px]"
          >
            {injectLoading ? 'Memproses Inject...' : 'Simpan & Nyatakan Lunas'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
