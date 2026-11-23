import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '../components/MarketingUi';
import {
  IconBook2,
  IconCursorText,
  IconInfoCircle,
  IconLanguage,
  IconVideo,
  IconWorld
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import RichTextEditor from '../../../ui-component/RichTextEditor';
import { prepareMarketingServiceForEditing } from '../../../utils/marketingProgramContent';
import MarketingActionFooter from '../components/MarketingActionFooter';
import MarketingHeader from '../components/MarketingHeader';
import MarketingImageUpload from '../components/MarketingImageUpload';
import MarketingSectionCard from '../components/MarketingSectionCard';
import MarketingStatusCard from '../components/MarketingStatusCard';

const programDetails = {
  'program-bipa-129': {
    key: 'bipa',
    label: 'BIPA',
    color: '#0f766e',
    icon: IconWorld
  },
  'program-pelayanan-bahasa-127': {
    key: 'ppb',
    label: 'PPB',
    color: '#1d4ed8',
    icon: IconLanguage
  },
  'program-penerjemahan-dan-penjurubahasaan-1283': {
    key: 'ppp',
    label: 'PPP',
    color: '#7c3aed',
    icon: IconBook2
  }
};

export default function MarketingProgramEdit() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    marketingApi
      .getService(serviceId)
      .then((data) => {
        setService(prepareMarketingServiceForEditing(data));
      })
      .catch((error) => setFeedback({ type: 'error', message: error.message || 'Gagal mengambil program.' }))
      .finally(() => setLoading(false));
  }, [serviceId]);

  const updateField = (field, value) => {
    setService((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (file) => {
    setImageFile(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    updateField('image_url', '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!service.title?.trim()) {
      setFeedback({ type: 'error', message: 'Judul program wajib diisi.' });
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', service.title || '');
      payload.append('body', service.body || '');
      payload.append('summary', service.summary || '');
      payload.append('video_description', service.video_description || '');
      payload.append('image_url', service.image_url || '');
      payload.append('video_url', service.video_url || '');
      payload.append('is_active', service.is_active ? '1' : '0');

      if (imageFile) payload.append('image_file', imageFile);

      const response = await marketingApi.updateService(service.id, payload);
      setService(response.data || service);
      setImageFile(null);
      setFeedback({ type: 'success', message: 'Program berhasil diperbarui!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.data?.message || error.message || 'Gagal menyimpan program.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box style={{ display: 'grid', placeItems: 'center', minHeight: 450 }}>
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Memuat formulir program...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!service) {
    return (
      <Box style={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" icon={<IconInfoCircle size={20} />}>
          Program tidak ditemukan.
        </Alert>
      </Box>
    );
  }

  const meta = programDetails[service.slug] || {
    key: 'program',
    label: 'Program',
    color: '#2757A4',
    icon: IconBook2
  };
  const ProgramIcon = meta.icon;

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <MarketingHeader
        title={`Edit Program: ${service.title}`}
        subtitle="Perbarui deskripsi program, materi video, ringkasan, dan status publikasinya."
        icon={ProgramIcon}
        badge={`Program ${meta.label}`}
        backUrl={`/marketing/programs/${service.id}`}
        backText="Kembali ke Detail Program"
      />

      {feedback.message && (
        <Alert
          severity={feedback.type || 'info'}
          style={{ mb: 3, borderRadius: 2 }}
          onClose={() => setFeedback({ type: '', message: '' })}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Main Edit Form */}
      <form onSubmit={handleSave}>
        <Stack spacing={3}>
          {/* Section 01: Informasi Utama */}
          <MarketingSectionCard
            number="01"
            title="Informasi Utama Program"
            description="Judul program, ringkasan eksekutif, dan tautan video promosi."
          >
            <TextField
              fullWidth
              required
              label="Judul Program"
              placeholder="Contoh: Program Bahasa Indonesia untuk Penutur Asing (BIPA)"
              value={service.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconCursorText size={18} />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Ringkasan Eksekutif"
              placeholder="Tulis ringkasan singkat 1-2 kalimat untuk kartu program di landing page..."
              value={service.summary || ''}
              onChange={(e) => updateField('summary', e.target.value)}
              helperText={`${(service.summary || '').length} karakter.`}
            />

            <TextField
              fullWidth
              label="Tautan Video Promosi (YouTube / Vimeo)"
              placeholder="Contoh: https://www.youtube.com/watch?v=..."
              value={service.video_url || ''}
              onChange={(e) => updateField('video_url', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconVideo size={18} />
                  </InputAdornment>
                )
              }}
              helperText="Opsional. Masukkan tautan video YouTube untuk menampilkan preview video di halaman program."
            />
          </MarketingSectionCard>

          {/* Section BIPA Spesifik: Teks samping video */}
          {service.slug === 'program-bipa-129' && (
            <MarketingSectionCard
              number="02"
              title="Teks di Samping Video (Khusus BIPA)"
              description="Bagian teks sorotan yang tampil di samping pemutar video BIPA."
            >
              <RichTextEditor
                label="Tulis teks sorotan di samping video..."
                value={service.video_description || ''}
                onChange={(desc) => updateField('video_description', desc)}
              />
            </MarketingSectionCard>
          )}

          {/* Section: Konten Lengkap */}
          <MarketingSectionCard
            number={service.slug === 'program-bipa-129' ? '03' : '02'}
            title="Konten & Deskripsi Lengkap Program"
            description="Isi materi lengkap yang dibaca oleh calon peserta di halaman program."
          >
            <RichTextEditor
              label="Tulis deskripsi program lengkap di sini..."
              value={service.body || ''}
              onChange={(body) => updateField('body', body)}
            />
          </MarketingSectionCard>

          {/* Section: Visual & Publikasi */}
          <MarketingSectionCard
            number={service.slug === 'program-bipa-129' ? '04' : '03'}
            title="Media Visual & Publikasi"
            description="Pilih foto sampul program dan tentukan apakah program aktif ditayangkan."
          >
            <MarketingImageUpload
              label="Foto Sampul Program"
              helperText="Rasio 16:9 disarankan (minimal 1200 x 675 px). Maksimal 5MB."
              imageUrl={service.image_url}
              imageFile={imageFile}
              onFileChange={handleFileChange}
              onUrlChange={(url) => updateField('image_url', url)}
              onClear={handleClearImage}
            />

            <MarketingStatusCard
              checked={service.is_active}
              onChange={(checked) => updateField('is_active', checked)}
              activeLabel="Program Aktif di Website"
              inactiveLabel="Program Disembunyikan (Draf)"
              activeDesc="Program dan kartu divisinya tampil di halaman utama website LBI FIB UI."
              inactiveDesc="Program disimpan namun disembunyikan sementara dari publik."
            />
          </MarketingSectionCard>

          {/* Action Footer */}
          <Card variant="outlined" style={{ borderRadius: 3, overflow: 'hidden' }}>
            <MarketingActionFooter
              onCancel={() => navigate(`/marketing/programs/${service.id}`)}
              saveText="Simpan Perubahan Program"
              saving={saving}
            />
          </Card>
        </Stack>
      </form>
    </Box>
  );
}
