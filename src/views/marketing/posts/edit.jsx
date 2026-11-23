import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '../components/MarketingUi';
import {
  IconArticle,
  IconCursorText,
  IconInfoCircle,
  IconLink,
  IconTag
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import RichTextEditor from '../../../ui-component/RichTextEditor';
import MarketingActionFooter from '../components/MarketingActionFooter';
import MarketingHeader from '../components/MarketingHeader';
import MarketingImageUpload from '../components/MarketingImageUpload';
import MarketingSectionCard from '../components/MarketingSectionCard';
import MarketingStatusCard from '../components/MarketingStatusCard';

const CATEGORY_SUGGESTIONS = [
  'Tips & Panduan',
  'Program BIPA',
  'Bahasa Inggris',
  'Bahasa Asing',
  'Penerjemahan',
  'Budaya & Komunitas',
  'Pengumuman Resmi'
];

export default function MarketingPostEdit() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    marketingApi
      .getPost(postId)
      .then((data) => {
        setPost(data);
      })
      .catch((error) => setFeedback({ type: 'error', message: error.message || 'Gagal mengambil artikel.' }))
      .finally(() => setLoading(false));
  }, [postId]);

  const updateField = (field, value) => {
    setPost((current) => ({ ...current, [field]: value }));
  };

  const handleTitleChange = (val) => {
    const slugified = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setPost((current) => ({
      ...current,
      title: val,
      slug: current.slug ? current.slug : slugified
    }));
  };

  const handleFileChange = (file) => {
    setImageFile(file);
  };

  const handleClearImage = () => {
    setImageFile(null);
    updateField('featured_image', '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!post.title?.trim()) {
      setFeedback({ type: 'error', message: 'Judul artikel wajib diisi.' });
      return;
    }

    setSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', post.title.trim());
      if (post.slug) payload.append('slug', post.slug.trim());
      payload.append('category', post.category || 'Tips & Panduan');
      payload.append('summary', post.summary || '');
      payload.append('body', post.body || '');
      payload.append('is_published', post.is_published ? 1 : 0);

      if (imageFile) {
        payload.append('image_file', imageFile);
      } else if (post.featured_image) {
        payload.append('featured_image', post.featured_image);
      }

      const response = await marketingApi.updatePost(post.id, payload);
      setPost(response.data || post);
      setImageFile(null);
      setFeedback({ type: 'success', message: 'Artikel berhasil diperbarui!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.data?.message || error.message || 'Gagal menyimpan perubahan artikel.'
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
            Memuat formulir artikel...
          </Typography>
        </Stack>
      </Box>
    );
  }
  if (!post) {
    return (
      <Box style={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" icon={<IconInfoCircle size={20} />}>
          Artikel tidak ditemukan.
        </Alert>
      </Box>
    );
  }

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <MarketingHeader
        title="Edit Artikel Blog"
        subtitle="Perbarui naskah artikel, ringkasan, foto sampul, dan status publikasinya."
        icon={IconArticle}
        badge={`Artikel #${post.id}`}
        backUrl={`/marketing/posts/${post.id}`}
        backText="Kembali ke Detail Artikel"
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
          {/* Section 01: Judul & Slug */}
          <MarketingSectionCard
            number="01"
            title="Judul & Identitas Artikel"
            description="Tentukan judul artikel yang menarik serta slug URL untuk SEO."
          >
            <TextField
              fullWidth
              required
              label="Judul Artikel"
              placeholder="Contoh: Tips Sukses Belajar Bahasa Asing dalam 3 Bulan"
              value={post.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconCursorText size={18} />
                  </InputAdornment>
                )
              }}
              helperText="Judul artikel utama yang muncul di landing page dan feed blog."
            />

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Slug URL (SEO Friendly)"
                  placeholder="tips-sukses-belajar-bahasa-asing"
                  value={post.slug || ''}
                  onChange={(e) => updateField('slug', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconLink size={18} />
                      </InputAdornment>
                    )
                  }}
                  helperText="Tautan publik: /posts/[slug]"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Kategori Artikel"
                  placeholder="Tips & Panduan"
                  value={post.category || ''}
                  onChange={(e) => updateField('category', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconTag size={18} />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>

            {/* Category Quick Chips */}
            <Box>
              <Typography variant="caption" color="text.secondary" style={{ display: 'block', mb: 1, fontWeight: 600 }}>
                Pilihan Cepat Kategori:
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    clickable
                    color={post.category === cat ? 'primary' : 'default'}
                    variant={post.category === cat ? 'filled' : 'outlined'}
                    onClick={() => updateField('category', cat)}
                    style={{ fontWeight: 600, fontSize: '0.75rem' }}
                  />
                ))}
              </Stack>
            </Box>
          </MarketingSectionCard>

          {/* Section 02: Ringkasan & Foto Sampul */}
          <MarketingSectionCard
            number="02"
            title="Ringkasan Singkat & Foto Sampul"
            description="Pengantar singkat dan visual utama untuk kartu artikel di feed."
          >
            <TextField
              fullWidth
              multiline
              minRows={2.5}
              label="Ringkasan Singkat (Summary)"
              placeholder="Tuliskan 1-2 kalimat pengantar artikel untuk memikat pembaca..."
              value={post.summary || ''}
              onChange={(e) => updateField('summary', e.target.value)}
              helperText={`${(post.summary || '').length} karakter tertulis.`}
            />

            <MarketingImageUpload
              label="Foto Utama / Sampul Artikel (Featured Image)"
              helperText="Rasio 16:9 disarankan (minimal 1200 x 675 px). Maksimal 5MB."
              aspectRatio="16/9"
              imageUrl={post.featured_image}
              imageFile={imageFile}
              onFileChange={handleFileChange}
              onUrlChange={(url) => updateField('featured_image', url)}
              onClear={handleClearImage}
            />
          </MarketingSectionCard>

          {/* Section 03: Editor Lengkap */}
          <MarketingSectionCard
            number="03"
            title="Konten & Isi Lengkap Artikel"
            description="Gunakan fitur editor untuk menyusun heading, daftar nomor, bullet, dan kutipan."
          >
            <RichTextEditor
              label="Tulis naskah artikel lengkap di sini..."
              value={post.body || ''}
              onChange={(body) => updateField('body', body)}
            />
          </MarketingSectionCard>

          {/* Section 04: Publikasi */}
          <MarketingSectionCard
            number="04"
            title="Pengaturan Publikasi"
            description="Tentukan apakah artikel langsung diterbitkan atau disimpan sebagai draf."
          >
            <MarketingStatusCard
              checked={post.is_published}
              onChange={(checked) => updateField('is_published', checked)}
              activeLabel="Artikel Dipublikasikan (Published)"
              inactiveLabel="Simpan Sebagai Draf (Draft)"
              activeDesc="Artikel langsung tayang di blog dan dapat dibaca oleh umum."
              inactiveDesc="Artikel hanya disimpan di dashboard dan belum bisa diakses publik."
            />
          </MarketingSectionCard>

          {/* Action Footer */}
          <Card variant="outlined" style={{ borderRadius: 3, overflow: 'hidden' }}>
            <MarketingActionFooter
              onCancel={() => navigate(`/marketing/posts/${post.id}`)}
              saveText="Simpan Perubahan Artikel"
              saving={saving}
            />
          </Card>
        </Stack>
      </form>
    </Box>
  );
}
