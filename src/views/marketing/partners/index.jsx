// src/views/marketing/partners/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconBuildingStore,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash
} from '@tabler/icons-react';

import { marketingApi } from '../../../api/marketingApi';
import { resolveImageUrl } from '../../../api/apiClient';
import { Alert } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import MarketingActionFooter from '../components/MarketingActionFooter';
import MarketingHeader from '../components/MarketingHeader';
import MarketingImageUpload from '../components/MarketingImageUpload';
import MarketingSectionCard from '../components/MarketingSectionCard';

export default function MarketingPartners() {
  const navigate = useNavigate();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Create Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    website_url: '',
    logo_url: ''
  });
  const [newLogoFile, setNewLogoFile] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await marketingApi.getPartners();
      setPartners(Array.isArray(data) ? data : []);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal mengambil data mitra dari server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setNewPartner({ name: '', website_url: '', logo_url: '' });
    setNewLogoFile(null);
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPartner.name.trim()) {
      setFeedback({ type: 'error', message: 'Nama instansi mitra wajib diisi.' });
      return;
    }

    setCreating(true);
    try {
      const payload = new FormData();
      payload.append('name', newPartner.name.trim());
      payload.append('website_url', newPartner.website_url || '');

      if (newLogoFile) {
        payload.append('logo_file', newLogoFile);
      } else if (newPartner.logo_url) {
        payload.append('logo_url', newPartner.logo_url);
      }

      await marketingApi.createPartner(payload);
      setFeedback({ type: 'success', message: 'Mitra baru berhasil ditambahkan!' });
      setCreateOpen(false);
      fetchPartners();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.data?.message || err.message || 'Terjadi kesalahan saat menyimpan data mitra.'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await marketingApi.deletePartner(deleteTarget.id);
      setPartners((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setFeedback({ type: 'success', message: 'Data mitra berhasil dihapus.' });
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menghapus mitra.' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredPartners = partners.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.website_url?.toLowerCase().includes(q)
    );
  });

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6 xl:p-8">
      <MarketingHeader
        title="Mitra & Klien Kerjasama"
        subtitle="Kelola logo kedutaan besar, lembaga kebudayaan asing, dan universitas mitra LBI FIB UI."
        icon={IconBuildingStore}
        badge="Kerjasama & Kemitraan"
        stats={[{ label: 'Total Mitra', value: partners.length }]}
        actions={<Button className="border border-white bg-white font-bold text-[#18386E] hover:bg-[#F6DB00]" onClick={handleOpenCreate}><IconPlus size={18} />Tambah Mitra Baru</Button>}
      />

      {feedback.message && <Alert variant={feedback.type === 'error' ? 'error' : feedback.type === 'success' ? 'success' : 'info'}><span>{feedback.message}</span><button type="button" className="ml-auto" aria-label="Tutup notifikasi" onClick={() => setFeedback({ type: '', message: '' })}>×</button></Alert>}

      <Card className="flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-10" placeholder="Cari nama instansi mitra atau alamat website..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        </div>
        <Button variant="outline" onClick={fetchPartners} disabled={loading}><IconRefresh size={18} />Muat Ulang</Button>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16"><span className="size-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" /><p className="text-sm text-slate-500">Memuat data mitra...</p></div>
      ) : filteredPartners.length === 0 ? (
        <Card className="border-dashed bg-slate-50 p-8 text-center sm:p-12">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-xl bg-blue-50 text-blue-700"><IconBuildingStore size={30} /></span>
          <h2 className="text-xl font-extrabold text-slate-900">{partners.length === 0 ? 'Belum Ada Mitra Terdaftar' : 'Mitra Tidak Ditemukan'}</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">{partners.length === 0 ? 'Tambahkan lembaga, universitas, atau instansi mitra yang bekerjasama dengan LBI FIB UI.' : 'Tidak ada mitra yang cocok dengan kata kunci pencarian Anda.'}</p>
          {partners.length === 0 && <Button className="mt-5" onClick={handleOpenCreate}><IconPlus size={17} />Tambah Mitra Pertama</Button>}
        </Card>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredPartners.map((partner) => {
            const logoSrc = partner.logo_url ? resolveImageUrl(partner.logo_url) : '';
            const websiteUrl = partner.website_url
              ? partner.website_url.startsWith('http') ? partner.website_url : `https://${partner.website_url}`
              : '';
            return (
              <Card key={partner.id} className="group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                <div className="flex h-[150px] items-center justify-center overflow-hidden border-b border-slate-200 bg-slate-50 p-6">
                  {logoSrc ? <img src={logoSrc} alt={partner.name} className="max-h-[85px] max-w-[85%] object-contain transition-transform group-hover:scale-105" /> : <span className="text-xs text-slate-400">Tanpa Logo</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="line-clamp-2 min-h-[46px] text-lg font-extrabold leading-snug text-slate-900">{partner.name}</h2>
                  {websiteUrl ? <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"><IconExternalLink size={14} />Kunjungi Website</a> : <p className="mt-2 text-xs text-slate-500">Tidak ada tautan website</p>}
                  <div className="mt-auto flex justify-end gap-2 border-t border-slate-200 pt-4">
                    <Button variant="ghost" size="icon" title="Detail Mitra" aria-label={`Detail ${partner.name}`} className="bg-[#E1EFFA] text-[#198BCC] hover:bg-[#cce5f7]" onClick={() => navigate(`/marketing/partners/${partner.id}`)}><IconEye size={17} /></Button>
                    <Button variant="ghost" size="icon" title="Edit Mitra" aria-label={`Edit ${partner.name}`} className="bg-[#E1EFFA] text-[#2757A4] hover:bg-[#cce5f7]" onClick={() => navigate(`/marketing/partners/${partner.id}/edit`)}><IconEdit size={17} /></Button>
                    <Button variant="ghost" size="icon" title="Hapus Mitra" aria-label={`Hapus ${partner.name}`} className="bg-red-100 text-red-700 hover:bg-red-200" onClick={() => setDeleteTarget(partner)}><IconTrash size={17} /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <Dialog open={createOpen} onOpenChange={(open) => { if (!creating) setCreateOpen(open); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-[#2757A4] text-white"><IconBuildingStore size={22} /></span>
              <div><DialogTitle>Tambah Mitra Kerjasama Baru</DialogTitle><p className="mt-1 text-sm text-slate-500">Tampilkan instansi kedutaan, lembaga, atau universitas mitra.</p></div>
            </div>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-5">
            <MarketingSectionCard number="01" title="Identitas Instansi / Lembaga" description="Nama resmi mitra kerjasama dan alamat tautan website.">
              <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama Instansi / Lembaga Mitra<Input required placeholder="Contoh: Goethe-Institut Indonesien" value={newPartner.name} onChange={(event) => setNewPartner({ ...newPartner, name: event.target.value })} /></label>
              <label className="block space-y-1.5 text-sm font-medium text-slate-700">Tautan Website Resmi (URL)<Input placeholder="https://..." value={newPartner.website_url} onChange={(event) => setNewPartner({ ...newPartner, website_url: event.target.value })} /></label>
            </MarketingSectionCard>
            <MarketingSectionCard number="02" title="Logo Instansi" description="Unggah file logo instansi (disarankan berlatar transparan).">
              <MarketingImageUpload label="Logo Mitra" helperText="Format PNG transparan atau SVG. Maksimal 5MB." aspectRatio="auto" objectFit="contain" previewHeight={170} imageUrl={newPartner.logo_url} imageFile={newLogoFile} onFileChange={setNewLogoFile} onUrlChange={(url) => setNewPartner({ ...newPartner, logo_url: url })} onClear={() => { setNewLogoFile(null); setNewPartner({ ...newPartner, logo_url: '' }); }} />
            </MarketingSectionCard>
            <MarketingActionFooter onCancel={() => setCreateOpen(false)} saveText="Simpan Mitra Baru" saving={creating} />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!deleting && !open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Hapus Mitra Ini?</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Apakah Anda yakin ingin menghapus data mitra &quot;<strong>{deleteTarget?.name}</strong>&quot;? Tindakan ini tidak dapat dibatalkan.</p>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Batal</Button><Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}><IconTrash size={16} />{deleting ? 'Menghapus...' : 'Ya, Hapus'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
