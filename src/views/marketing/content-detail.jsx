import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { IconArrowLeft, IconBuildingStore, IconEdit, IconExternalLink, IconTrash, IconWorld } from '@tabler/icons-react';
import { marketingApi } from '../../api/marketingApi';
import { resolveImageUrl } from '../../api/apiClient';
import MarketingHeader from './components/MarketingHeader';

const config = {
  slider: {
    title: 'Detail Slider',
    back: '/marketing/sliders',
    fetch: 'getSlider',
    delete: 'deleteSlider',
    edit: 'Edit Slider',
    image: 'image_url',
    icon: IconWorld
  },
  banner: {
    title: 'Detail Banner',
    back: '/marketing/banners',
    fetch: 'getBanner',
    delete: 'deleteBanner',
    edit: 'Edit Banner',
    image: 'image_url',
    icon: IconWorld
  },
  partner: {
    title: 'Detail Mitra & Kerjasama',
    back: '/marketing/partners',
    fetch: 'getPartner',
    delete: 'deletePartner',
    edit: 'Edit Mitra',
    image: 'logo_url',
    icon: IconBuildingStore
  }
};

export default function MarketingContentDetail({ contentType = 'partner' }) {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const current = config[contentType] || config.partner;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    marketingApi[current.fetch](contentId)
      .then(setItem)
      .catch((requestError) => setError(requestError.message || `Gagal mengambil ${contentType}.`))
      .finally(() => setLoading(false));
  }, [contentId, contentType, current.fetch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (marketingApi[current.delete]) {
        await marketingApi[current.delete](contentId);
      }
      navigate(current.back);
    } catch (err) {
      setError(err.message || 'Gagal menghapus data.');
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[450px] place-items-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="size-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="text-sm text-slate-600">Memuat informasi...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <main className="mx-auto max-w-[800px] p-6">
        <Alert variant="error" className="mb-4">{error || 'Data tidak ditemukan.'}</Alert>
        <Button variant="outline" onClick={() => navigate(current.back)}>
          <IconArrowLeft size={17} /> Kembali ke Daftar
        </Button>
      </main>
    );
  }

  const title = item.title || item.name;
  const logoOrImage = item[current.image];
  const webUrl = item.website_url;

  return (
    <main className="mx-auto max-w-[1000px] p-4 md:p-6 xl:p-8">
      <MarketingHeader
        title={title}
        subtitle="Profil instansi mitra kerjasama dan pratinjau logo di website LBI FIB UI."
        icon={current.icon}
        badge={current.title}
        backUrl={current.back}
        backText="Kembali ke Daftar Mitra"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => navigate(`${current.back}/${item.id}/edit`)}
              className="rounded-lg bg-white px-4 font-bold text-[#2757A4] hover:bg-blue-50"
            >
              <IconEdit size={17} /> {current.edit}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(true)}
              className="border-white/40 bg-white/10 font-bold text-white hover:border-white hover:bg-red-500/20 hover:text-white"
            >
              <IconTrash size={17} /> Hapus
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <Card className="overflow-hidden rounded-2xl">
            <div className="relative flex h-[260px] items-center justify-center border-b border-slate-200 bg-slate-50 p-8">
              {logoOrImage ? (
                <img
                  src={resolveImageUrl(logoOrImage)}
                  alt={title}
                  className="max-h-40 max-w-[85%] object-contain drop-shadow-sm"
                />
              ) : (
                <p className="text-sm text-slate-500">Belum ada logo diunggah</p>
              )}
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700">Instansi Mitra Kerjasama</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h2>
              {webUrl ? (
                <div className="mt-6">
                  <a
                    href={webUrl.startsWith('http') ? webUrl : `https://${webUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
                  >
                    Kunjungi Website Resmi <IconExternalLink size={16} />
                  </a>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">Tidak ada tautan website terlampir.</p>
              )}
            </div>
          </Card>
        </div>
        <div className="md:col-span-5">
          <Card className="rounded-2xl p-5 sm:p-6">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Informasi Kemitraan</h2>
            <dl className="mt-4 divide-y divide-slate-200">
              <div className="py-3">
                <dt className="text-xs text-slate-500">ID Rekaman:</dt>
                <dd className="mt-1 font-bold text-slate-900">#{item.id}</dd>
              </div>
              <div className="py-3">
                <dt className="text-xs text-slate-500">Nama Lengkap:</dt>
                <dd className="mt-1 font-bold text-slate-900">{title}</dd>
              </div>
              <div className="py-3">
                <dt className="text-xs text-slate-500">Tautan Web:</dt>
                <dd className="mt-1 break-all text-sm font-semibold text-blue-700">{webUrl || '-'}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={(open) => !deleting && setDeleteConfirmOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-extrabold">Hapus Data Mitra Ini?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin menghapus data mitra &quot;<strong>{title}</strong>&quot;? Tindakan ini tidak dapat
            dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              <IconTrash size={16} /> {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
