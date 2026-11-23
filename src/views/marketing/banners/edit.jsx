import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '../components/MarketingUi';
import {
  IconCursorText,
  IconExternalLink,
  IconInfoCircle,
  IconSpeakerphone,
  IconTag
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import BannerLivePreview from '../components/BannerLivePreview';
import MarketingActionFooter from '../components/MarketingActionFooter';
import MarketingHeader from '../components/MarketingHeader';
import MarketingImageUpload from '../components/MarketingImageUpload';
import MarketingSectionCard from '../components/MarketingSectionCard';
import MarketingStatusCard from '../components/MarketingStatusCard';

const categories = [
  { value: 'promo', label: 'Promo & Diskon' },
  { value: 'announcement', label: 'Pengumuman Resmi' },
  { value: 'info', label: 'Informasi Kursus' },
  { value: 'event', label: 'Event / Webinar' }
];

export default function MarketingBannerEdit() {
  const { contentId } = useParams();
  const navigate = useNavigate();

  const [banner, setBanner] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    marketingApi
      .getBanner(contentId)
      .then((data) => {
        setBanner(data);
      })
      .catch((error) => setFeedback({ type: 'error', message: error.message || 'Gagal mengambil banner.' }))
      .finally(() => setLoading(false));
  }, [contentId]);

  const updateField = (field, value) => {
    setBanner((current) => ({ ...current, [field]: value }));
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
    if (!banner.title?.trim()) {
      setFeedback({ type: 'error', message: 'Judul banner wajib diisi.' });
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', banner.title.trim());
      payload.append('category', banner.category || 'promo');
      payload.append('description', banner.description || '');
      payload.append('link_url', banner.link_url || '');
      payload.append('is_active', banner.is_active ? 1 : 0);

      if (imageFile) {
        payload.append('image_file', imageFile);
      } else if (banner.image_url) {
        payload.append('image_url', banner.image_url);
      }

      const response = await marketingApi.updateBanner(banner.id, payload);
      setBanner(response.data || banner);
      setImageFile(null);
      setFeedback({ type: 'success', message: 'Banner berhasil diperbarui.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.data?.message || error.message || 'Gagal menyimpan perubahan banner.'
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
            Memuat formulir banner...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!banner) {
    return (
      <Box style={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" icon={<IconInfoCircle size={20} />}>
          Banner tidak ditemukan.
        </Alert>
      </Box>
    );
  }

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <MarketingHeader
        title="Edit Banner Pengumuman"
        subtitle="Perbarui materi promo, pengumuman jadwal, atau tautan informasi banner."
        icon={IconSpeakerphone}
        badge={`Banner #${banner.id}`}
        backUrl={`/marketing/banners/${banner.id}`}
        backText="Kembali ke Detail Banner"
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

      {/* Live Preview Card */}
      <Card variant="outlined" style={{ borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 3 }}>
        <BannerLivePreview
          title={banner.title}
          category={banner.category}
          description={banner.description}
          linkUrl={banner.link_url}
          imageUrl={banner.image_url}
          imageFile={imageFile}
          isActive={banner.is_active}
        />
      </Card>

      {/* Main Edit Form */}
      <form onSubmit={handleSave}>
        <Stack spacing={3}>
          {/* Section 01: Identitas & Kategori */}
          <MarketingSectionCard
            number="01"
            title="Informasi & Kategori Banner"
            description="Tentukan judul utama dan jenis banner yang ditampilkan."
          >
            <TextField
              fullWidth
              required
              label="Judul Banner / Pengumuman"
              placeholder="Contoh: Pendaftaran Semester Gasal Telah Dibuka!"
              value={banner.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconCursorText size={18} />
                  </InputAdornment>
                )
              }}
              helperText="Judul banner yang singkat, padat, dan informatif."
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Kategori Banner</InputLabel>
                  <Select
                    value={banner.category || 'promo'}
                    label="Kategori Banner"
                    onChange={(e) => updateField('category', e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <IconTag size={18} />
                      </InputAdornment>
                    }
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Tautan URL Aksi (Link)"
                  placeholder="Contoh: /schedules atau https://..."
                  value={banner.link_url || ''}
                  onChange={(e) => updateField('link_url', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconExternalLink size={18} />
                      </InputAdornment>
                    )
                  }}
                  helperText="Tautan saat pengunjung mengklik tombol aksi di banner."
                />
              </Grid>
            </Grid>
          </MarketingSectionCard>

          {/* Section 02: Deskripsi Lengkap */}
          <MarketingSectionCard
            number="02"
            title="Pesan & Deskripsi Banner"
            description="Tulis penjelasan lengkap, diskon, atau informasi kegiatan yang perlu diketahui publik."
          >
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Deskripsi Lengkap Banner"
              placeholder="Jelaskan detail penawaran promo, syarat & ketentuan, jadwal pelaksanaan, atau info kursus..."
              value={banner.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              helperText={`${(banner.description || '').length} karakter tertulis.`}
            />
          </MarketingSectionCard>

          {/* Section 03: Visual & Publikasi */}
          <MarketingSectionCard
            number="03"
            title="Gambar Visual & Status Tayang"
            description="Unggah gambar grafis banner dan atur apakah banner langsung tayang ke publik."
          >
            <MarketingImageUpload
              label="Gambar Banner"
              helperText="Rasio 4:3 atau banner landscape (minimal 800 x 600 px). File maksimal 5MB."
              aspectRatio="4/3"
              imageUrl={banner.image_url}
              imageFile={imageFile}
              onFileChange={handleFileChange}
              onUrlChange={(url) => updateField('image_url', url)}
              onClear={handleClearImage}
            />

            <MarketingStatusCard
              checked={banner.is_active}
              onChange={(checked) => updateField('is_active', checked)}
              activeLabel="Banner Aktif & Tayang"
              inactiveLabel="Banner Disembunyikan (Draf)"
              activeDesc="Banner tampil di bagian promo dan pengumuman landing page."
              inactiveDesc="Banner disimpan namun tidak dapat dilihat oleh pengunjung."
            />
          </MarketingSectionCard>

          {/* Form Action Footer */}
          <Card variant="outlined" style={{ borderRadius: 3, overflow: 'hidden' }}>
            <MarketingActionFooter
              onCancel={() => navigate(`/marketing/banners/${banner.id}`)}
              saveText="Simpan Perubahan Banner"
              saving={saving}
            />
          </Card>
        </Stack>
      </form>
    </Box>
  );
}
