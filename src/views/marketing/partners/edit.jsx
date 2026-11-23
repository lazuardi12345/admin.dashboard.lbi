import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../../../components/ui/alert';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { marketingApi } from '../../../api/marketingApi';
import {
  IconBuildingStore,
  IconCursorText,
  IconExternalLink,
  IconInfoCircle
} from '@tabler/icons-react';
import MarketingActionFooter from '../components/MarketingActionFooter';
import MarketingHeader from '../components/MarketingHeader';
import MarketingImageUpload from '../components/MarketingImageUpload';
import MarketingSectionCard from '../components/MarketingSectionCard';

export default function MarketingPartnerEdit() {
  const { contentId } = useParams();
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    marketingApi
      .getPartner(contentId)
      .then(setPartner)
      .catch((error) => setFeedback({ type: 'error', message: error.message || 'Gagal mengambil data mitra.' }))
      .finally(() => setLoading(false));
  }, [contentId]);

  const updateField = (field, value) => {
    setPartner((current) => ({ ...current, [field]: value }));
  };

  const handleClearLogo = () => {
    setLogoFile(null);
    updateField('logo_url', '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!partner.name?.trim()) {
      setFeedback({ type: 'error', message: 'Nama instansi mitra wajib diisi.' });
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', partner.name.trim());
      payload.append('website_url', partner.website_url || '');

      if (logoFile) {
        payload.append('logo_file', logoFile);
      } else if (partner.logo_url) {
        payload.append('logo_url', partner.logo_url);
      }

      const response = await marketingApi.updatePartner(partner.id, payload);
      setPartner(response.data || partner);
      setLogoFile(null);
      setFeedback({ type: 'success', message: 'Data mitra berhasil diperbarui!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.data?.message || error.message || 'Gagal menyimpan data mitra.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[450px] place-items-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="size-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="text-sm text-slate-600">Memuat data mitra...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="mx-auto max-w-[800px] p-6">
        <Alert variant="error"><IconInfoCircle size={20} />Mitra tidak ditemukan.</Alert>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[900px] p-4 md:p-6 xl:p-8">
      <MarketingHeader
        title="Edit Data Mitra"
        subtitle="Perbarui nama instansi lembaga, tautan website resmi, dan logo mitra kerjasama."
        icon={IconBuildingStore}
        badge={`Mitra #${partner.id}`}
        backUrl={`/marketing/partners/${partner.id}`}
        backText="Kembali ke Detail Mitra"
      />

      {feedback.message && (
        <Alert
          variant={feedback.type === 'error' ? 'error' : feedback.type === 'success' ? 'success' : 'info'}
          className="mb-6"
        >
          <span>{feedback.message}</span>
          <button type="button" aria-label="Tutup notifikasi" onClick={() => setFeedback({ type: '', message: '' })}>×</button>
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <MarketingSectionCard
          number="01"
          title="Identitas Instansi / Lembaga"
          description="Nama resmi mitra kerjasama dan alamat website resmi instansi."
        >
          <label className="block space-y-2 text-sm font-semibold text-slate-700">
            <span>Nama Instansi / Lembaga Mitra <span className="text-red-600">*</span></span>
            <div className="relative">
              <IconCursorText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                required
                className="pl-10"
                placeholder="Contoh: Kedutaan Besar Jepang (Japan Foundation)"
                value={partner.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <span className="block text-xs font-normal text-slate-500">Nama lengkap instansi yang akan ditampilkan di landing page.</span>
          </label>

          <label className="block space-y-2 text-sm font-semibold text-slate-700">
            <span>Alamat Website Resmi (URL)</span>
            <div className="relative">
              <IconExternalLink size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="url"
                className="pl-10"
                placeholder="Contoh: https://jpf.or.id"
                value={partner.website_url || ''}
                onChange={(e) => updateField('website_url', e.target.value)}
              />
            </div>
            <span className="block text-xs font-normal text-slate-500">Tautan saat pengunjung mengklik kartu logo mitra.</span>
          </label>
        </MarketingSectionCard>

        <MarketingSectionCard
          number="02"
          title="Logo Resmi Mitra"
          description="Unggah file logo instansi berlatar belakang transparan (PNG atau SVG)."
        >
          <MarketingImageUpload
            label="Logo Instansi"
            helperText="Gunakan format PNG transparan atau SVG. Rekomendasi tinggi logo minimal 120 px."
            aspectRatio="auto"
            objectFit="contain"
            previewHeight={{ xs: 150, sm: 200 }}
            imageUrl={partner.logo_url}
            imageFile={logoFile}
            onFileChange={setLogoFile}
            onUrlChange={(url) => updateField('logo_url', url)}
            onClear={handleClearLogo}
          />
        </MarketingSectionCard>

        <Card className="overflow-hidden rounded-3xl">
          <MarketingActionFooter
            onCancel={() => navigate(`/marketing/partners/${partner.id}`)}
            saveText="Simpan Perubahan Mitra"
            saving={saving}
          />
        </Card>
      </form>
    </main>
  );
}
