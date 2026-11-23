// src/views/admin/terms/index.jsx
import { useState, useEffect } from 'react';
import { IconPlus, IconEdit, IconTrash, IconCalendarEvent, IconRefresh, IconStar } from '@tabler/icons-react';
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

const PROGRAMS = [
  { value: 'all', label: 'Semua Program' },
  { value: 'ppb',  label: 'PPB — Inggris & Non Inggris' },
  { value: 'ppp',  label: 'PPP — Penerjemahan & Penjurubahasaan' },
  { value: 'bipa', label: 'BIPA' },
];

const INITIAL_FORM = {
  name: '',
  program: 'ppb',
  description: '',
  academic_year: '2026',
  start_date: '',
  end_date: '',
  registration_open: '',
  registration_close: '',
  is_active: true,
  is_current: false,
  sort_order: 0,
};

export default function AdminTerms() {
  const { role } = useAuth();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const roleProgram = {
    admin_ppb: 'ppb',
    admin_ppp: 'ppp',
    admin_bipa: 'bipa',
  }[role];
  const isAdministrator = role === 'administrator';
  const visiblePrograms = isAdministrator ? PROGRAMS : PROGRAMS.filter((program) => program.value === roleProgram);
  const selectedTab = isAdministrator ? activeTab : (roleProgram || activeTab);
  const editablePrograms = isAdministrator ? PROGRAMS.filter((program) => program.value !== 'all') : visiblePrograms;

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getTerms();
      if (res?.success) setTerms(res.data || []);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memuat data term.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTerms(); }, []);

  const filtered = selectedTab === 'all'
    ? terms
    : terms.filter(t => t.program === selectedTab || (isAdministrator && t.program === 'all'));

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ ...INITIAL_FORM, program: selectedTab === 'all' ? 'ppb' : selectedTab });
    setOpenDialog(true);
  };

  const handleOpenEdit = (term) => {
    setEditingId(term.id);
    setFormData({
      name:               term.name,
      program:            term.program,
      description:        term.description || '',
      academic_year:      term.academic_year || '2026',
      start_date:         term.start_date || '',
      end_date:           term.end_date || '',
      registration_open:  term.registration_open || '',
      registration_close: term.registration_close || '',
      is_active:          term.is_active,
      is_current:         term.is_current,
      sort_order:         term.sort_order || 0,
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await adminApi.updateTerm(editingId, formData);
        setFeedback({ type: 'success', message: `Term "${formData.name}" berhasil diperbarui!` });
      } else {
        await adminApi.createTerm(formData);
        setFeedback({ type: 'success', message: `Term "${formData.name}" berhasil dibuat!` });
      }
      setOpenDialog(false);
      fetchTerms();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menyimpan term.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetCurrent = async (term) => {
    try {
      await adminApi.updateTerm(term.id, { is_current: true });
      setFeedback({ type: 'success', message: `"${term.name}" sekarang menjadi term aktif untuk ${term.program.toUpperCase()}.` });
      fetchTerms();
    } catch {
      setFeedback({ type: 'error', message: 'Gagal mengubah term aktif.' });
    }
  };

  const handleDelete = async (term) => {
    if (!window.confirm(`Nonaktifkan term "${term.name}"? Data jadwal yang terhubung tidak akan hilang.`)) return;
    try {
      await adminApi.deleteTerm(term.id);
      setFeedback({ type: 'info', message: `Term "${term.name}" dinonaktifkan.` });
      fetchTerms();
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menghapus term.' });
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const fieldChange = (field) => (event) => setFormData((current) => ({ ...current, [field]: event.target.value }));
  const feedbackVariant = feedback.type === 'error' ? 'error' : feedback.type === 'success' ? 'success' : 'info';

  return (
    <main className="space-y-5 p-4 sm:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Master Term / Periode Kursus</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola periode akademik (Term) per program. Jadwal kursus akan mengikuti tanggal dari term yang dipilih.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTerms} disabled={loading}><IconRefresh size={18} />Refresh</Button>
          <Button onClick={handleOpenCreate}><IconPlus size={18} />Tambah Term Baru</Button>
        </div>
      </header>

      <Alert variant="info">
        <IconCalendarEvent size={20} />
        <span><strong>Cara kerja Term:</strong> Setiap jadwal kursus cukup pilih satu term; tanggal mulai, tanggal selesai, dan window pendaftaran otomatis mengikuti pengaturan term ini. Tidak perlu input tanggal manual per jadwal.</span>
      </Alert>
      {feedback.message && (
        <Alert variant={feedbackVariant}>
          <span>{feedback.message}</span>
          <button type="button" className="ml-auto opacity-70 hover:opacity-100" aria-label="Tutup notifikasi" onClick={() => setFeedback({ type: '', message: '' })}>×</button>
        </Alert>
      )}

      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-2" role="tablist" aria-label="Filter program">
        {visiblePrograms.map((program) => (
          <button
            key={program.value}
            type="button"
            role="tab"
            aria-selected={selectedTab === program.value}
            onClick={() => setActiveTab(program.value)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${selectedTab === program.value ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {program.label}
            <Badge variant={selectedTab === program.value ? 'outline' : 'default'} className={selectedTab === program.value ? 'border-white/30 bg-white/15 text-white' : ''}>
              {(program.value === 'all' ? terms : terms.filter((term) => term.program === program.value || (isAdministrator && term.program === 'all'))).length}
            </Badge>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama Term</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Periode Kursus</TableHead>
              <TableHead>Window Pendaftaran</TableHead>
              <TableHead>Jadwal Terhubung</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent"><TableCell colSpan={7} className="py-12 text-center"><span className="mx-auto block size-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" /><p className="mt-2 text-sm text-slate-500">Memuat data term...</p></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent"><TableCell colSpan={7} className="py-12 text-center"><p className="text-slate-500">Belum ada term untuk program ini.</p><Button variant="outline" size="sm" className="mt-3" onClick={handleOpenCreate}>+ Tambah Term Pertama</Button></TableCell></TableRow>
            ) : filtered.map((term) => (
              <TableRow key={term.id} className={term.is_current ? 'bg-blue-50/60' : ''}>
                <TableCell>
                  <div className="flex items-start gap-2">
                    {term.is_current && <IconStar size={16} className="mt-0.5 shrink-0 text-amber-500" fill="currentColor" title="Term yang sedang aktif/berjalan" />}
                    <div>
                      <p className="font-semibold text-slate-900">{term.name}</p>
                      {term.academic_year && <p className="text-xs text-slate-500">TA {term.academic_year}</p>}
                      {term.description && <p className="mt-1 text-xs text-slate-500">{term.description}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{term.program_label || term.program.toUpperCase()}</Badge></TableCell>
                <TableCell><p className="font-medium text-blue-800">{fmtDate(term.start_date)}</p><p className="text-xs text-slate-500">s/d {fmtDate(term.end_date)}</p></TableCell>
                <TableCell><p>{fmtDate(term.registration_open)}</p><p className="text-xs text-slate-500">s/d {fmtDate(term.registration_close)}</p>{term.is_registration_open && <Badge variant="success" className="mt-1">Dibuka</Badge>}</TableCell>
                <TableCell><Badge variant={term.schedules_count > 0 ? 'default' : 'outline'}>{`${term.schedules_count || 0} jadwal`}</Badge></TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant={term.is_active ? 'success' : 'outline'}>{term.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                    {term.is_current && <Badge variant="warning">★ Current</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    {!term.is_current && <Button variant="ghost" size="icon" title="Jadikan term aktif (current) untuk program ini" aria-label={`Jadikan ${term.name} sebagai term aktif`} className="text-amber-600" onClick={() => handleSetCurrent(term)}><IconStar size={16} /></Button>}
                    <Button variant="ghost" size="icon" title="Edit Term" aria-label={`Edit ${term.name}`} className="text-blue-700" onClick={() => handleOpenEdit(term)}><IconEdit size={16} /></Button>
                    <Button variant="ghost" size="icon" title="Nonaktifkan Term" aria-label={`Nonaktifkan ${term.name}`} className="text-red-700" onClick={() => handleDelete(term)}><IconTrash size={16} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Term / Periode Kursus' : 'Tambah Term Baru'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-2">Nama Term<Input required placeholder="Contoh: Term 1 2026, Term Ganjil 2026/2027" value={formData.name} onChange={fieldChange('name')} /><span className="block text-xs font-normal text-slate-500">Nama ini yang tampil di form pendaftaran peserta</span></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Tahun Akademik<Input placeholder="2026" value={formData.academic_year} onChange={fieldChange('academic_year')} /></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-3">Program<Select required value={formData.program} onChange={fieldChange('program')}>{editablePrograms.map((program) => <option key={program.value} value={program.value}>{program.label}</option>)}{isAdministrator && <option value="all">Semua Program</option>}</Select><span className="block text-xs font-normal text-slate-500">{isAdministrator ? "Term ini berlaku untuk program apa? 'Semua Program' artinya berlaku untuk PPB, PPP, dan BIPA." : 'Anda hanya dapat mengelola term untuk program Anda.'}</span></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700 sm:col-span-3">Deskripsi (Opsional)<Input placeholder="Catatan singkat tentang term ini" value={formData.description} onChange={fieldChange('description')} /></label>
              <h3 className="border-b border-slate-200 pb-2 text-sm font-semibold text-slate-900 sm:col-span-3">Periode Kursus Berjalan</h3>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Tanggal Mulai Kursus<Input type="date" value={formData.start_date} onChange={fieldChange('start_date')} /></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Tanggal Selesai Kursus<Input type="date" value={formData.end_date} onChange={fieldChange('end_date')} /></label>
              <h3 className="border-b border-slate-200 pb-2 text-sm font-semibold text-slate-900 sm:col-span-3">Window Pendaftaran</h3>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Buka Pendaftaran<Input type="date" value={formData.registration_open} onChange={fieldChange('registration_open')} /><span className="block text-xs font-normal text-slate-500">Kapan calon peserta boleh mendaftar</span></label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700">Tutup Pendaftaran<Input type="date" value={formData.registration_close} onChange={fieldChange('registration_close')} /><span className="block text-xs font-normal text-slate-500">Batas akhir pendaftaran</span></label>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700 sm:col-span-3"><input type="checkbox" className="size-4 accent-emerald-600" checked={formData.is_active} onChange={(event) => setFormData({ ...formData, is_active: event.target.checked })} />Term Aktif (tampil di sistem)</label>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700 sm:col-span-3"><input type="checkbox" className="size-4 accent-amber-500" checked={formData.is_current} onChange={(event) => setFormData({ ...formData, is_current: event.target.checked })} />★ Set sebagai Term Berjalan Sekarang</label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)} disabled={submitting}>Batal</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Buat Term Baru'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
