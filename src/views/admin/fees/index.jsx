import { useEffect, useState } from 'react';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
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

const INITIAL_FORM = {
  name: '',
  fee_type: 'registration',
  division: 'ppb',
  course_catalog_id: '',
  course_level_id: '',
  term_id: '',
  course_schedule_id: '',
  amount: '',
  effective_from: '',
  effective_until: '',
  is_active: true,
};

const FEE_TYPES = [
  { value: 'registration', label: 'Biaya Registrasi' },
  { value: 'tuition', label: 'Biaya Kursus' },
];

const PROGRAMS = [
  { value: 'ppb', label: 'PPB' },
  { value: 'ppb_english', label: 'PPB Bahasa Inggris' },
  { value: 'ppb_foreign', label: 'PPB Non Inggris' },
  { value: 'testing', label: 'Tes Bahasa' },
  { value: 'bipa', label: 'BIPA' },
  { value: 'ppp', label: 'PPP' },
];

const PROGRAM_GROUPS = [
  { value: 'ppb', label: 'PPB & Tes Bahasa', divisions: ['ppb', 'ppb_english', 'ppb_foreign', 'testing'] },
  { value: 'ppp', label: 'PPP', divisions: ['ppp'] },
  { value: 'bipa', label: 'BIPA', divisions: ['bipa'] },
];

const ROLE_PROGRAM = {
  admin_ppb: 'ppb',
  admin_bipa: 'bipa',
  admin_ppp: 'ppp',
};

const programGroupFor = (division) => PROGRAM_GROUPS.find((group) => group.divisions.includes(division))?.value || null;

const asList = (response) => Array.isArray(response?.data) ? response.data : response?.data?.data || [];

export default function AdminCourseFees() {
  const { role } = useAuth();
  const [rules, setRules] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [levels, setLevels] = useState([]);
  const [terms, setTerms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [selectedProgram, setSelectedProgram] = useState('ppb');
  const [selectedFeeType, setSelectedFeeType] = useState('registration');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isSuperAdmin = role === 'administrator';
  const roleProgram = ROLE_PROGRAM[role];
  const activeProgram = PROGRAM_GROUPS.find((program) => program.value === (roleProgram || selectedProgram)) || PROGRAM_GROUPS[0];

  const loadData = async () => {
    setLoading(true);
    try {
      const [ruleResponse, catalogResponse, termResponse, scheduleResponse] = await Promise.all([
        adminApi.getCourseFeeRules(),
        adminApi.getCourseCatalogs(),
        adminApi.getTerms('all'),
        adminApi.getSchedules(),
      ]);
      setRules(asList(ruleResponse).filter((rule) => rule.fee_type !== 'placement_test'));
      setCatalogs(asList(catalogResponse));
      setTerms(asList(termResponse));
      setSchedules(asList(scheduleResponse));
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal memuat master tarif.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditingRule(null);
    setForm({ ...INITIAL_FORM, division: activeProgram.divisions[0], fee_type: selectedFeeType });
    setLevels([]);
    setDialogOpen(true);
  };

  const openEdit = async (rule) => {
    setSelectedFeeType(rule.fee_type);
    setPage(0);
    setEditingRule(rule);
    setForm({
      name: rule.name || '',
      fee_type: rule.fee_type || 'registration',
      division: rule.division || 'ppb',
      course_catalog_id: rule.course_catalog_id || '',
      course_level_id: rule.course_level_id || '',
      term_id: rule.term_id || '',
      course_schedule_id: rule.course_schedule_id || '',
      amount: rule.amount ?? '',
      effective_from: rule.effective_from?.slice(0, 10) || '',
      effective_until: rule.effective_until?.slice(0, 10) || '',
      is_active: Boolean(rule.is_active),
    });
    if (rule.course_catalog_id) {
      const response = await adminApi.getLevelsByCourse(rule.course_catalog_id);
      setLevels(asList(response));
    } else {
      setLevels([]);
    }
    setDialogOpen(true);
  };

  const handleCatalogChange = async (catalogId) => {
    const catalog = catalogs.find((item) => String(item.id) === String(catalogId));
    setForm((current) => ({ ...current, course_catalog_id: catalogId, course_level_id: '', ...(catalog?.division ? { division: catalog.division } : {}) }));
    if (!catalogId) {
      setLevels([]);
      return;
    }
    try {
      const response = await adminApi.getLevelsByCourse(catalogId);
      setLevels(asList(response));
    } catch {
      setLevels([]);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });
    const payload = {
      ...form,
      course_catalog_id: form.course_catalog_id || null,
      course_level_id: form.course_level_id || null,
      term_id: form.term_id || null,
      course_schedule_id: form.course_schedule_id || null,
      amount: Number(form.amount),
    };
    try {
      if (editingRule) await adminApi.updateCourseFeeRule(editingRule.id, payload);
      else await adminApi.createCourseFeeRule(payload);
      setDialogOpen(false);
      setFeedback({ type: 'success', message: 'Master tarif berhasil disimpan.' });
      await loadData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.data?.message || error.message || 'Gagal menyimpan tarif.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (rule) => {
    try {
      await adminApi.deleteCourseFeeRule(rule.id);
      setFeedback({ type: 'success', message: `Tarif “${rule.name}” dinonaktifkan.` });
      await loadData();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal menonaktifkan tarif.' });
    }
  };

  const formatAmount = (amount) => `Rp ${Number(amount || 0).toLocaleString('id-ID')}`;
  const divisionLabel = (division) => division === 'testing' ? 'Tes Bahasa' : division?.toUpperCase() || 'Semua program';
  const catalogLabel = (rule) => rule.courseCatalog?.title
    || rule.course_catalog?.title
    || rule.courseLevel?.courseCatalog?.title
    || rule.course_level?.course_catalog?.title
    || rule.courseSchedule?.courseCatalog?.title
    || rule.course_schedule?.course_catalog?.title
    || 'Semua katalog';
  const levelLabel = (rule) => rule.courseLevel?.name
    || rule.course_level?.name
    || rule.courseSchedule?.courseLevel?.name
    || rule.course_schedule?.course_level?.name
    || 'Semua level';
  const ruleDivision = (rule) => rule.division
    || rule.courseCatalog?.division
    || rule.course_catalog?.division
    || rule.courseLevel?.courseCatalog?.division
    || rule.course_level?.course_catalog?.division
    || rule.courseSchedule?.division
    || rule.course_schedule?.division
    || rule.courseSchedule?.courseCatalog?.division
    || rule.course_schedule?.course_catalog?.division;
  const visibleRules = rules.filter((rule) => {
    if (rule.fee_type !== selectedFeeType) return false;
    const division = ruleDivision(rule);
    if (!division) return isSuperAdmin;
    return programGroupFor(division) === activeProgram.value;
  });
  const pageCount = Math.max(1, Math.ceil(visibleRules.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const paginatedRules = visibleRules.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);
  const visibleCatalogs = catalogs.filter((catalog) => isSuperAdmin && !catalog.division
    ? true
    : activeProgram.divisions.includes(catalog.division));
  const visibleSchedules = schedules.filter((schedule) => activeProgram.divisions.includes(schedule.division));

  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const alertVariant = feedback.type === 'error' ? 'error' : feedback.type === 'success' ? 'success' : 'info';

  return (
    <main className="space-y-5 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Master Tarif</h1>
          <p className="mt-1 text-sm text-slate-500">Atur biaya pendaftaran tes bahasa, registrasi program, dan kursus berdasarkan katalog atau term.</p>
        </div>
        <Button onClick={openCreate}><IconPlus size={18} />Tambah Tarif</Button>
      </header>

      {feedback.message && (
        <Alert variant={alertVariant}>
          <span>{feedback.message}</span>
          <button type="button" className="opacity-70 hover:opacity-100" aria-label="Tutup notifikasi" onClick={() => setFeedback({ type: '', message: '' })}>×</button>
        </Alert>
      )}

      {isSuperAdmin ? (
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-2" role="tablist" aria-label="Program master tarif">
          {PROGRAM_GROUPS.map((program) => (
            <button
              key={program.value}
              type="button"
              role="tab"
              aria-selected={activeProgram.value === program.value}
              onClick={() => { setSelectedProgram(program.value); setPage(0); }}
              className={`rounded-md px-4 py-2 text-sm font-medium ${activeProgram.value === program.value ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {program.label}
            </button>
          ))}
        </div>
      ) : (
        <Alert variant="info">Anda hanya dapat melihat dan mengelola tarif program {activeProgram.label}.</Alert>
      )}

      <div className="flex rounded-lg border border-slate-200 bg-white p-1" role="tablist" aria-label="Jenis pembayaran">
        {[
          { value: 'registration', label: 'Pembayaran Registrasi' },
          { value: 'tuition', label: 'Pembayaran Kursus' }
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selectedFeeType === item.value}
            onClick={() => { setSelectedFeeType(item.value); setPage(0); }}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${selectedFeeType === item.value ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama Tarif</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Program / Kursus</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Term</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent"><TableCell colSpan={8} className="py-12 text-center"><span className="mx-auto block size-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" /></TableCell></TableRow>
            ) : visibleRules.length === 0 ? (
              <TableRow className="hover:bg-transparent"><TableCell colSpan={8} className="py-12 text-center text-slate-500">Belum ada tarif. Tambahkan tarif sebelum menerima pendaftaran berbayar.</TableCell></TableRow>
            ) : paginatedRules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium text-slate-900">{rule.name}</TableCell>
                <TableCell>{FEE_TYPES.find((type) => type.value === rule.fee_type)?.label || rule.fee_type}</TableCell>
                <TableCell>{catalogLabel(rule)} · {divisionLabel(rule.division)}</TableCell>
                <TableCell>{levelLabel(rule)}</TableCell>
                <TableCell>{rule.term?.name || 'Semua term'}</TableCell>
                <TableCell className="whitespace-nowrap text-right font-semibold">{formatAmount(rule.amount)}</TableCell>
                <TableCell><Badge variant={rule.is_active ? 'success' : 'outline'}>{rule.is_active ? 'Aktif' : 'Nonaktif'}</Badge></TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(rule)}><IconEdit size={15} />Ubah</Button>
                  {rule.is_active && <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={() => handleDeactivate(rule)}><IconTrash size={15} />Nonaktifkan</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Baris per halaman:
            <Select className="h-9 w-20" value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}>
              {[5, 10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </Select>
          </label>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-600 sm:justify-end">
            <span>{visibleRules.length === 0 ? '0–0 dari 0' : `${currentPage * rowsPerPage + 1}–${Math.min((currentPage + 1) * rowsPerPage, visibleRules.length)} dari ${visibleRules.length}`}</span>
            <Button variant="outline" size="sm" disabled={currentPage <= 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Sebelumnya</Button>
            <Button variant="outline" size="sm" disabled={currentPage >= pageCount - 1} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>Berikutnya</Button>
          </div>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!saving) setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingRule ? 'Ubah Tarif' : 'Tambah Tarif'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Nama tarif<Input required value={form.name} onChange={setField('name')} /></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Jenis biaya<Select value={form.fee_type} onChange={setField('fee_type')}>{FEE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</Select></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Program<Select value={form.division} onChange={(event) => setForm({ ...form, division: event.target.value, course_catalog_id: '', course_level_id: '', course_schedule_id: '' })}>{PROGRAMS.filter((program) => activeProgram.divisions.includes(program.value)).map((program) => <option key={program.value} value={program.value}>{program.label}</option>)}</Select></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Katalog (opsional)<Select value={form.course_catalog_id} onChange={(event) => handleCatalogChange(event.target.value)}><option value="">Semua katalog pada program</option>{visibleCatalogs.map((catalog) => <option key={catalog.id} value={catalog.id}>{catalog.title}</option>)}</Select></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Level (opsional)<Select value={form.course_level_id} onChange={setField('course_level_id')}><option value="">Semua level</option>{levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}</Select></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Term (opsional)<Select value={form.term_id} onChange={setField('term_id')}><option value="">Semua term</option>{terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}</Select></label>
              {form.fee_type === 'tuition' && (
                <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
                  Jadwal kursus spesifik (opsional)
                  <Select
                    value={form.course_schedule_id}
                    onChange={(event) => {
                      const scheduleId = event.target.value;
                      const schedule = schedules.find((item) => String(item.id) === String(scheduleId));
                      setForm((current) => ({
                        ...current,
                        course_schedule_id: scheduleId,
                        ...(schedule ? {
                          division: schedule.division || current.division,
                          course_catalog_id: schedule.course_catalog_id || current.course_catalog_id,
                          course_level_id: schedule.course_level_id || current.course_level_id,
                          term_id: schedule.term_id || current.term_id,
                        } : {}),
                      }));
                    }}
                  >
                    <option value="">Tarif umum sesuai level/katalog</option>
                    {visibleSchedules.map((schedule) => <option key={schedule.id} value={schedule.id}>{schedule.program_name} · {schedule.level || 'Level'} · {schedule.batch || 'Term'} · {schedule.location || schedule.format}</option>)}
                  </Select>
                </label>
              )}
              {form.fee_type === 'tuition' && <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 sm:col-span-2">Biaya kursus diatur sebagai tarif Tuition dan akan digunakan saat peserta memilih jadwal pada levelnya.</div>}
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Nominal (Rp)<Input required type="number" min="0" step="1000" value={form.amount} onChange={setField('amount')} /></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Berlaku mulai<Input type="date" value={form.effective_from} onChange={setField('effective_from')} /></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Berlaku sampai<Input type="date" value={form.effective_until} onChange={setField('effective_until')} /></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Status<Select value={form.is_active ? 'active' : 'inactive'} onChange={(event) => setForm({ ...form, is_active: event.target.value === 'active' })}><option value="active">Aktif</option><option value="inactive">Nonaktif</option></Select></label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>Batal</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Tarif'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
