import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const divisions = [
  { value: 'bipa', label: 'BIPA (Bahasa Indonesia Penutur Asing)' },
  { value: 'ppb_english', label: 'PPB Bahasa Inggris' },
  { value: 'ppb_foreign', label: 'PPB Non Inggris (Jepang, Korea, dll)' },
  { value: 'testing', label: 'Tes Kemampuan Bahasa' },
  { value: 'ppp', label: 'PPP (Penerjemahan & Penjurubahasaan)' }
];

export default function MarketingCatalogNew() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    service_id: '',
    title: '',
    summary: '',
    description: '',
    division: 'ppb_foreign',
    category: '',
    level: '',
    duration: '',
    learning_outcomes: '',
    target_audience: '',
    instructor_info: '',
    registration_url: '',
    payment_steps: [],
    image_url: '',
    is_active: true,
    sort_order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    marketingApi
      .getServices()
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setServices(items);
        if (items.length) {
          setForm((current) => ({ ...current, service_id: current.service_id || items[0].id }));
        }
      })
      .catch((error) => setFeedback({ type: 'error', message: error.message || 'Gagal mengambil daftar program.' }))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateStep = (index, field, value) => {
    const updated = form.payment_steps.map((step, stepIndex) =>
      stepIndex === index ? { ...step, [field]: value } : step
    );
    updateField('payment_steps', updated);
  };

  const addStep = () => {
    updateField('payment_steps', [
      ...form.payment_steps,
      { title: '', description: '' }
    ]);
  };

  const removeStep = (index) => {
    updateField(
      'payment_steps',
      form.payment_steps.filter((_, stepIndex) => stepIndex !== index)
    );
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.service_id || !form.title.trim()) {
      setFeedback({ type: 'error', message: 'Program induk dan nama course wajib diisi.' });
      return;
    }
    setSaving(true);
    try {
      const response = await marketingApi.createCourseCatalog({
        ...form,
        service_id: Number(form.service_id),
        payment_steps: form.payment_steps.filter((step) => step.title?.trim()),
        sort_order: Number(form.sort_order || 0)
      });
      const created = response.data;
      setFeedback({ type: 'success', message: 'Course catalog berhasil ditambahkan.' });
      if (created?.id) navigate(`/marketing/catalogs/${created.id}/edit`);
      else navigate('/marketing/catalogs');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.data?.message || error.message || 'Gagal menambahkan course catalog.'
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
            Menyiapkan formulir course baru...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <MarketingHeader
        title="Tambah Course Baru"
        subtitle="Buat katalog kursus baru dengan kurikulum, target peserta, dan panduan pembayaran untuk landing page."
        icon={IconBook2}
        badge="Course Catalog"
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
          {/* Section 01: Program Induk & Identitas */}
          <MarketingSectionCard
            number="01"
            title="Program Induk & Identitas Course"
            description="Tentukan layanan induk dan informasi utama kartu kursus."
          >
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Program Induk</InputLabel>
                  <Select
                    value={form.service_id}
                    label="Program Induk"
                    onChange={(event) => updateField('service_id', event.target.value)}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Divisi Program</InputLabel>
                  <Select
                    value={form.division}
                    label="Divisi Program"
                    onChange={(event) => updateField('division', event.target.value)}
                  >
                    {divisions.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              required
              label="Nama Lengkap Course"
              placeholder="Contoh: Academic Writing & Journal Preparation"
              value={form.title}
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
              placeholder="Penjelasan ringkas 1-2 kalimat untuk kartu kursus di katalog..."
              value={form.summary}
              onChange={(event) => updateField('summary', event.target.value)}
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Kategori"
                  placeholder="Contoh: General / Academic"
                  value={form.category}
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

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Tingkatan (Level)"
                  placeholder="Contoh: Beginner - Intermediate"
                  value={form.level}
                  onChange={(event) => updateField('level', event.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Durasi Pelaksanaan"
                  placeholder="Contoh: 12 Pertemuan (24 Jam)"
                  value={form.duration}
                  onChange={(event) => updateField('duration', event.target.value)}
                />
              </Grid>
            </Grid>
          </MarketingSectionCard>

          {/* Section 02: Konten Detail */}
          <MarketingSectionCard
            number="02"
            title="Deskripsi & Capaian Belajar"
            description="Detail kurikulum yang akan dibaca calon peserta pada halaman spesifikasi kursus."
          >
            <RichTextEditor
              label="Deskripsi lengkap silabus dan materi kursus"
              value={form.description}
              onChange={(value) => updateField('description', value)}
            />

            <TextField
              fullWidth
              multiline
              minRows={3.5}
              label="Capaian Pembelajaran (Learning Outcomes)"
              placeholder="Contoh:&#10;1. Mampu menulis esai akademik berstandar internasional&#10;2. Menguasai parafrase dan sitasi APA style"
              value={form.learning_outcomes}
              onChange={(event) => updateField('learning_outcomes', event.target.value)}
              helperText="Tuliskan poin hasil belajar kursus (pisahkan baris baru untuk setiap poin)."
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Target Peserta (Audience)"
                  placeholder="Contoh: Mahasiswa S1/S2, akademisi, dan profesional yang ingin meningkatkan kemampuan menulis ilmiah."
                  value={form.target_audience}
                  onChange={(event) => updateField('target_audience', event.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Informasi Pengajar (Instructors)"
                  placeholder="Contoh: Dosen tetap Departemen Linguistik FIB UI & praktisi penerjemah tersertifikasi."
                  value={form.instructor_info}
                  onChange={(event) => updateField('instructor_info', event.target.value)}
                />
              </Grid>
            </Grid>
          </MarketingSectionCard>

          {/* Section 03: Pendaftaran & Pembayaran */}
          <MarketingSectionCard
            number="03"
            title="Pendaftaran & Tahapan Pembayaran"
            description="Panduan alur registrasi dan tahapan pembayaran bagi calon peserta."
          >
            <TextField
              fullWidth
              label="Tautan URL Pendaftaran Khusus"
              placeholder="https://... atau biarkan kosong untuk menggunakan formulir standar"
              value={form.registration_url}
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
                    Opsional. Jelaskan langkah transfer atau verifikasi rekening bank LBI FIB UI.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconPlus size={16} />}
                  onClick={addStep}
                  style={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Tambah Tahapan
                </Button>
              </Stack>

              {form.payment_steps.length === 0 ? (
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
                  {form.payment_steps.map((step, index) => (
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
                          placeholder="Misal: Transfer Biaya Kursus via Virtual Account"
                          value={step.title}
                          onChange={(e) => updateStep(index, 'title', e.target.value)}
                        />

                        <TextField
                          fullWidth
                          size="small"
                          label="Keterangan Langkah"
                          placeholder="Misal: Lakukan pembayaran sebelum batas akhir 3 hari..."
                          value={step.description}
                          onChange={(e) => updateStep(index, 'description', e.target.value)}
                        />

                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeStep(index)}
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
            title="Gambar Visual & Publikasi"
            description="Pilih gambar kartu kursus dan atur apakah langsung tayang di katalog."
          >
            <MarketingImageUpload
              label="Gambar Kartu Kursus (Course Cover)"
              helperText="Rasio 16:9 disarankan (minimal 800 x 450 px). Maksimal 5MB."
              imageUrl={form.image_url}
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
                  value={form.sort_order}
                  onChange={(event) => updateField('sort_order', Math.max(0, parseInt(event.target.value) || 0))}
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
                  checked={form.is_active}
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
              saveText="Simpan Course Baru"
              saving={saving}
              disabled={!services.length}
            />
          </Card>
        </Stack>
      </form>
    </Box>
  );
}
