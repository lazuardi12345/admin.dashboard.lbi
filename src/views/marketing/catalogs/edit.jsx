import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '../components/MarketingUi';
import {
  IconBook2,
  IconCursorText,
  IconExternalLink,
  IconInfoCircle,
  IconListNumbers,
  IconPlus,
  IconTag,
  IconTrash
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import RichTextEditor from '../../../ui-component/RichTextEditor';
import MarketingActionFooter from '../components/MarketingActionFooter';
import MarketingHeader from '../components/MarketingHeader';
import MarketingImageUpload from '../components/MarketingImageUpload';
import MarketingSectionCard from '../components/MarketingSectionCard';
import MarketingStatusCard from '../components/MarketingStatusCard';

const divisionLabels = {
  bipa: 'BIPA (Bahasa Indonesia Penutur Asing)',
  ppb_english: 'PPB Bahasa Inggris',
  ppb_foreign: 'PPB Non Inggris (Jepang, Korea, dll)',
  testing: 'Tes Kemampuan Bahasa',
  ppp: 'PPP (Penerjemahan & Penjurubahasaan)'
};

export default function MarketingCatalogEdit() {
  const { catalogId } = useParams();
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    marketingApi
      .getCourseCatalog(catalogId)
      .then((data) => setCatalog(data ? { ...data, payment_steps: data.payment_steps || [] } : null))
      .catch((error) => setFeedback({ type: 'error', message: error.message || 'Gagal mengambil course catalog.' }))
      .finally(() => setLoading(false));
  }, [catalogId]);

  const updateField = (field, value) => {
    setCatalog((current) => ({ ...current, [field]: value }));
  };

  const updatePaymentStep = (index, field, value) => {
    const steps = [...(catalog.payment_steps || [])];
    steps[index] = { ...steps[index], [field]: value };
    updateField('payment_steps', steps);
  };

  const addPaymentStep = () => {
    updateField('payment_steps', [
      ...(catalog.payment_steps || []),
      { title: '', description: '' }
    ]);
  };

  const removePaymentStep = (index) => {
    updateField(
      'payment_steps',
      (catalog.payment_steps || []).filter((_, stepIndex) => stepIndex !== index)
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!catalog.title?.trim()) {
      setFeedback({ type: 'error', message: 'Nama course wajib diisi.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        service_id: catalog.service?.id || catalog.service_id,
        title: catalog.title || '',
        slug: catalog.slug || '',
        summary: catalog.summary || '',
        description: catalog.description || '',
        division: catalog.division || 'ppb_foreign',
        category: catalog.category || '',
        level: catalog.level || '',
        learning_outcomes: catalog.learning_outcomes || '',
        target_audience: catalog.target_audience || '',
        instructor_info: catalog.instructor_info || '',
        duration: catalog.duration || '',
        registration_url: catalog.registration_url || '',
        payment_steps: (catalog.payment_steps || []).filter((step) => step.title?.trim()),
        image_url: catalog.image_url || '',
        is_active: Boolean(catalog.is_active),
        sort_order: Number(catalog.sort_order || 0)
      };

      const response = await marketingApi.updateCourseCatalog(catalog.id, payload);
      setCatalog({
        ...(response.data || catalog),
        payment_steps: response.data?.payment_steps || payload.payment_steps
      });
      setFeedback({ type: 'success', message: 'Course catalog berhasil diperbarui!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.data?.message || error.message || 'Gagal menyimpan course catalog.'
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
            Memuat formulir course catalog...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!catalog) {
    return (
      <Box style={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" icon={<IconInfoCircle size={20} />}>
          Course catalog tidak ditemukan.
        </Alert>
      </Box>
    );
  }

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <MarketingHeader
        title={`Edit Course: ${catalog.title || 'Tanpa Judul'}`}
        subtitle="Perbarui silabus, tingkatan level, capaian belajar, dan panduan pembayaran di landing page."
        icon={IconBook2}
        badge={`Catalog #${catalog.id}`}
        backUrl="/marketing/catalogs"
        backText="Kembali ke Daftar Course"
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

      <form onSubmit={handleSave}>
        <Stack spacing={3}>
          {/* Section 01: Identitas Course */}
          <MarketingSectionCard
            number="01"
            title="Identitas & Program Course"
            description="Informasi utama yang muncul pada heading dan kartu kursus."
          >
            <TextField
              fullWidth
              required
              label="Nama Lengkap Course"
              value={catalog.title || ''}
              onChange={(event) => updateField('title', event.target.value)}
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
              minRows={2.5}
              label="Ringkasan Singkat Course"
              value={catalog.summary || ''}
              onChange={(event) => updateField('summary', event.target.value)}
              helperText={`${(catalog.summary || '').length} karakter.`}
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Divisi Program</InputLabel>
                  <Select
                    value={catalog.division || 'ppb_foreign'}
                    label="Divisi Program"
                    onChange={(event) => updateField('division', event.target.value)}
                  >
                    {Object.entries(divisionLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Kategori"
                  placeholder="Contoh: placement_test"
                  value={catalog.category || ''}
                  onChange={(event) => updateField('category', event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconTag size={18} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Tingkatan (Level)"
                  placeholder="Contoh: Beginner - Advanced"
                  value={catalog.level || ''}
                  onChange={(event) => updateField('level', event.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Durasi Pelaksanaan"
                  placeholder="Contoh: 48 jam / 12 pertemuan"
                  value={catalog.duration || ''}
                  onChange={(event) => updateField('duration', event.target.value)}
                />
              </Grid>
            </Grid>
          </MarketingSectionCard>

          {/* Section 02: Konten Detail */}
          <MarketingSectionCard
            number="02"
            title="Deskripsi & Capaian Belajar"
            description="Detail kurikulum yang tampil pada halaman detail course di landing page."
          >
            <RichTextEditor
              label="Deskripsi lengkap silabus dan materi course"
              value={catalog.description || ''}
              onChange={(description) => updateField('description', description)}
            />

            <TextField
              fullWidth
              multiline
              minRows={3.5}
              label="Capaian Pembelajaran (Learning Outcomes)"
              placeholder="Satu outcome per baris"
              value={catalog.learning_outcomes || ''}
              onChange={(event) => updateField('learning_outcomes', event.target.value)}
              helperText="Tuliskan setiap hasil belajar dengan baris baru."
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Target Peserta (Audience)"
                  value={catalog.target_audience || ''}
                  onChange={(event) => updateField('target_audience', event.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Informasi Pengajar (Instructors)"
                  value={catalog.instructor_info || ''}
                  onChange={(event) => updateField('instructor_info', event.target.value)}
                />
              </Grid>
            </Grid>
          </MarketingSectionCard>

          {/* Section 03: Pendaftaran & Pembayaran */}
          <MarketingSectionCard
            number="03"
            title="Pendaftaran & Tahapan Pembayaran"
            description="Panduan pendaftaran dan langkah pembayaran untuk peserta."
          >
            <TextField
              fullWidth
              label="Tautan URL Pendaftaran Khusus"
              placeholder="https://..."
              value={catalog.registration_url || ''}
              onChange={(event) => updateField('registration_url', event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconExternalLink size={18} />
                  </InputAdornment>
                )
              }}
            />

            <Box>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                style={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="subtitle1" style={{ fontWeight: 800 }}>
                    Tahapan Pembayaran Kursus
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Langkah pembayaran yang akan dipandu kepada calon peserta.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconPlus size={16} />}
                  onClick={addPaymentStep}
                  style={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Tambah Tahapan
                </Button>
              </Stack>

              {(catalog.payment_steps || []).length === 0 ? (
                <Box
                  style={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: 'grey.50'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Belum ada tahapan pembayaran khusus. Klik &quot;Tambah Tahapan&quot; bila diperlukan.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {(catalog.payment_steps || []).map((step, index) => (
                    <Card
                      key={index}
                      variant="outlined"
                      style={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}
                    >
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                        <Box
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: 'primary.50',
                            color: 'primary.main',
                            fontSize: 12,
                            fontWeight: 800,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0
                          }}
                        >
                          {index + 1}
                        </Box>

                        <TextField
                          fullWidth
                          size="small"
                          label={`Nama Tahapan ${index + 1}`}
                          value={step.title}
                          onChange={(e) => updatePaymentStep(index, 'title', e.target.value)}
                        />

                        <TextField
                          fullWidth
                          size="small"
                          label="Keterangan Langkah"
                          value={step.description}
                          onChange={(e) => updatePaymentStep(index, 'description', e.target.value)}
                        />

                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removePaymentStep(index)}
                          style={{ alignSelf: { xs: 'flex-end', md: 'center' } }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          </MarketingSectionCard>

          {/* Section 04: Visual & Publikasi */}
          <MarketingSectionCard
            number="04"
            title="Gambar Visual & Status Publikasi"
            description="Pilih gambar kartu kursus dan atur apakah langsung tayang di katalog."
          >
            <MarketingImageUpload
              label="Gambar Kartu Kursus (Course Cover)"
              helperText="Rasio 16:9 disarankan (minimal 800 x 450 px). Maksimal 5MB."
              imageUrl={catalog.image_url}
              imageFile={imageFile}
              onFileChange={(file) => {
                setImageFile(file);
                updateField('image_url', URL.createObjectURL(file));
              }}
              onUrlChange={(url) => updateField('image_url', url)}
              onClear={() => {
                setImageFile(null);
                updateField('image_url', '');
              }}
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Urutan Tampilan di Katalog"
                  value={catalog.sort_order || 0}
                  onChange={(event) =>
                    updateField('sort_order', Math.max(0, parseInt(event.target.value) || 0))
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconListNumbers size={18} />
                      </InputAdornment>
                    ),
                    inputProps: { min: 0 }
                  }}
                  helperText="Urutan 0 akan tampil paling atas dalam kategori yang sama."
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <MarketingStatusCard
                  checked={catalog.is_active}
                  onChange={(checked) => updateField('is_active', checked)}
                  activeLabel="Course Tayang di Katalog"
                  inactiveLabel="Course Disembunyikan (Draf)"
                  activeDesc="Dapat dilihat dan dipilih oleh calon peserta di landing page."
                  inactiveDesc="Tersimpan di dashboard namun belum dipublikasikan."
                />
              </Grid>
            </Grid>
          </MarketingSectionCard>

          {/* Action Footer */}
          <Card variant="outlined" style={{ borderRadius: 3, overflow: 'hidden' }}>
            <MarketingActionFooter
              onCancel={() => navigate('/marketing/catalogs')}
              saveText="Simpan Perubahan Course"
              saving={saving}
            />
          </Card>
        </Stack>
      </form>
    </Box>
  );
}
