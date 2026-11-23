import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '../components/MarketingUi';
import {
  IconArrowRight,
  IconCursorText,
  IconExternalLink,
  IconInfoCircle,
  IconListNumbers,
  IconSlideshow
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import MarketingActionFooter from '../components/MarketingActionFooter';
import MarketingHeader from '../components/MarketingHeader';
import MarketingImageUpload from '../components/MarketingImageUpload';
import MarketingSectionCard from '../components/MarketingSectionCard';
import MarketingStatusCard from '../components/MarketingStatusCard';
import SliderLivePreview from '../components/SliderLivePreview';

export default function MarketingSliderEdit() {
  const { contentId } = useParams();
  const navigate = useNavigate();

  const [slider, setSlider] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    marketingApi
      .getSlider(contentId)
      .then((data) => {
        setSlider(data);
      })
      .catch((error) => setFeedback({ type: 'error', message: error.message || 'Gagal mengambil slider.' }))
      .finally(() => setLoading(false));
  }, [contentId]);

  const updateField = (field, value) => {
    setSlider((current) => ({ ...current, [field]: value }));
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
    if (!slider.title?.trim()) {
      setFeedback({ type: 'error', message: 'Judul slider wajib diisi.' });
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', slider.title.trim());
      payload.append('subtitle', slider.subtitle || '');
      payload.append('cta_text', slider.cta_text || '');
      payload.append('cta_link', slider.cta_link || '');
      payload.append('sort_order', Number(slider.sort_order) || 1);
      payload.append('is_active', slider.is_active ? 1 : 0);

      if (imageFile) {
        payload.append('image_file', imageFile);
      } else if (slider.image_url) {
        payload.append('image_url', slider.image_url);
      }

      const response = await marketingApi.updateSlider(slider.id, payload);
      setSlider(response.data || slider);
      setImageFile(null);
      setFeedback({ type: 'success', message: 'Slider berhasil diperbarui.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.data?.message || error.message || 'Gagal menyimpan perubahan slider.'
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
            Memuat formulir slider...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!slider) {
    return (
      <Box style={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" icon={<IconInfoCircle size={20} />}>
          Slider tidak ditemukan.
        </Alert>
      </Box>
    );
  }

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <MarketingHeader
        title="Edit Slider Hero"
        subtitle="Perbarui konten visual, teks promosi, dan tombol call to action."
        icon={IconSlideshow}
        badge={`Slider #${slider.id}`}
        backUrl={`/marketing/sliders/${slider.id}`}
        backText="Kembali ke Detail Slider"
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

      {/* Live Preview Bar */}
      <Card variant="outlined" style={{ borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 3 }}>
        <SliderLivePreview
          title={slider.title}
          subtitle={slider.subtitle}
          ctaText={slider.cta_text}
          ctaLink={slider.cta_link}
          imageUrl={slider.image_url}
          imageFile={imageFile}
          isActive={slider.is_active}
          sortOrder={slider.sort_order}
        />
      </Card>

      {/* Main Edit Form */}
      <form onSubmit={handleSave}>
        <Stack spacing={3}>
          {/* Section 01: Teks Utama */}
          <MarketingSectionCard
            number="01"
            title="Informasi & Teks Utama"
            description="Judul utama dan deskripsi singkat yang menyapa pengunjung di hero section."
          >
            <TextField
              fullWidth
              required
              label="Judul Utama Slider"
              placeholder="Contoh: Tingkatkan Kemampuan Bahasa Asing Anda"
              value={slider.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconCursorText size={18} />
                  </InputAdornment>
                )
              }}
              helperText="Buat judul yang ringkas, jelas, dan memikat (30 - 70 karakter)."
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Subjudul / Deskripsi Pendukung"
              placeholder="Contoh: Program kursus intensif bersertifikasi resmi bersama pengajar berpengalaman LBI FIB UI."
              value={slider.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              helperText={`${(slider.subtitle || '').length} karakter. Disarankan maksimal 2 kalimat.`}
            />
          </MarketingSectionCard>

          {/* Section 02: Tombol CTA & Pengurutan */}
          <MarketingSectionCard
            number="02"
            title="Tombol Aksi (Call To Action) & Posisi"
            description="Arahkan pengunjung ke halaman pendaftaran, jadwal, atau informasi program."
          >
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teks Tombol Aksi (CTA)"
                  placeholder="Contoh: Daftar Sekarang"
                  value={slider.cta_text || ''}
                  onChange={(e) => updateField('cta_text', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconArrowRight size={18} />
                      </InputAdornment>
                    )
                  }}
                  helperText="Kosongkan jika tidak ingin menampilkan tombol aksi."
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Link URL Tujuan"
                  placeholder="Contoh: /schedules atau https://..."
                  value={slider.cta_link || ''}
                  onChange={(e) => updateField('cta_link', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconExternalLink size={18} />
                      </InputAdornment>
                    )
                  }}
                  helperText="Dapat berupa rute internal (misal: /schedules) atau URL lengkap."
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Urutan Tampilan Slider (Sort Order)"
                  value={slider.sort_order || 1}
                  onChange={(e) => updateField('sort_order', Math.max(1, parseInt(e.target.value) || 1))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconListNumbers size={18} />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1, max: 99 }
                  }}
                  helperText="Slider dengan angka urutan terkecil akan tampil paling awal di carousel."
                />
              </Grid>
            </Grid>
          </MarketingSectionCard>

          {/* Section 03: Visual & Publikasi */}
          <MarketingSectionCard
            number="03"
            title="Gambar Visual & Status Tayang"
            description="Unggah gambar beresolusi tinggi dan atur apakah slider langsung ditayangkan."
          >
            <MarketingImageUpload
              label="Gambar Hero Slider"
              helperText="Rasio 16:9 disarankan (resolusi minimal 1200 x 675 px). File maksimal 5MB."
              aspectRatio="16/9"
              imageUrl={slider.image_url}
              imageFile={imageFile}
              onFileChange={handleFileChange}
              onUrlChange={(url) => updateField('image_url', url)}
              onClear={handleClearImage}
            />

            <MarketingStatusCard
              checked={slider.is_active}
              onChange={(checked) => updateField('is_active', checked)}
              activeLabel="Slider Aktif & Tayang"
              inactiveLabel="Slider Dinonaktifkan (Draf)"
              activeDesc="Slider ini tampil dalam perputaran carousel di landing page utama."
              inactiveDesc="Slider ini disimpan tetapi disembunyikan dari pengunjung landing page."
            />
          </MarketingSectionCard>

          {/* Form Action Footer */}
          <Card variant="outlined" style={{ borderRadius: 3, overflow: 'hidden' }}>
            <MarketingActionFooter
              onCancel={() => navigate(`/marketing/sliders/${slider.id}`)}
              saveText="Simpan Perubahan Slider"
              saving={saving}
            />
          </Card>
        </Stack>
      </form>
    </Box>
  );
}
