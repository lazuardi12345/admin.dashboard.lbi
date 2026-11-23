import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography
} from '../components/MarketingUi';
import {
  IconArrowLeft,
  IconEdit,
  IconExternalLink,
  IconSlideshow,
  IconTrash,
  IconWorld
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import MarketingHeader from '../components/MarketingHeader';
import SliderLivePreview from '../components/SliderLivePreview';

export default function MarketingSliderDetail() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [slider, setSlider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    marketingApi
      .getSlider(contentId)
      .then(setSlider)
      .catch((requestError) => setError(requestError.message || 'Gagal mengambil detail slider.'))
      .finally(() => setLoading(false));
  }, [contentId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await marketingApi.deleteSlider(contentId);
      navigate('/marketing/sliders');
    } catch (err) {
      setError(err.message || 'Gagal menghapus slider.');
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box style={{ display: 'grid', placeItems: 'center', minHeight: 450 }}>
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Memuat detail slider...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !slider) {
    return (
      <Box style={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" style={{ mb: 2.5 }}>
          {error || 'Slider tidak ditemukan.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={17} />}
          onClick={() => navigate('/marketing/sliders')}
        >
          Kembali ke Daftar Slider
        </Button>
      </Box>
    );
  }

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <MarketingHeader
        title={slider.title || 'Detail Slider Hero'}
        subtitle="Pratinjau tampilan slider di landing page dan informasi konfigurasinya."
        icon={IconSlideshow}
        badge="Detail Slider"
        backUrl="/marketing/sliders"
        backText="Kembali ke Daftar Slider"
        actions={
          <Stack direction="row" spacing={1.25}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconEdit size={17} />}
              onClick={() => navigate(`/marketing/sliders/${slider.id}/edit`)}
              style={{ fontWeight: 700, borderRadius: 2, px: 2.5, textTransform: 'none' }}
            >
              Edit Slider
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<IconTrash size={17} />}
              onClick={() => setDeleteConfirmOpen(true)}
              style={{
                fontWeight: 700,
                borderRadius: 2,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(239, 68, 68, 0.2)' },
                textTransform: 'none'
              }}
            >
              Hapus
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Left Column: Live Realistic Preview */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card variant="outlined" style={{ borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 3 }}>
            <SliderLivePreview
              title={slider.title}
              subtitle={slider.subtitle}
              ctaText={slider.cta_text}
              ctaLink={slider.cta_link}
              imageUrl={slider.image_url}
              isActive={slider.is_active}
              sortOrder={slider.sort_order}
            />
          </Card>
        </Grid>

        {/* Right Column: Configuration & Metadata */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            {/* Status & Priority Card */}
            <Card variant="outlined" style={{ borderRadius: 3, p: 2.5 }}>
              <Typography variant="overline" style={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
                Status Tayang
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" style={{ mt: 1, mb: 2 }}>
                <Box
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: slider.is_active ? 'success.light' : 'grey.200',
                    color: slider.is_active ? 'success.dark' : 'text.disabled'
                  }}
                >
                  <IconWorld size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" style={{ fontWeight: 800 }}>
                    {slider.is_active ? 'Aktif di Landing Page' : 'Draf (Disembunyikan)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {slider.is_active ? 'Bisa dilihat semua pengunjung' : 'Hanya tampak di dashboard'}
                  </Typography>
                </Box>
              </Stack>
              <Divider style={{ my: 1.5 }} />
              <Stack spacing={1.5}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Urutan Slider:
                  </Typography>
                  <Chip
                    size="small"
                    label={`Urutan #${slider.sort_order || 1}`}
                    color="primary"
                    style={{ fontWeight: 700 }}
                  />
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    ID Slider:
                  </Typography>
                  <Typography variant="body2" style={{ fontWeight: 700 }}>
                    #{slider.id}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* CTA Details Card */}
            <Card variant="outlined" style={{ borderRadius: 3, p: 2.5 }}>
              <Typography variant="overline" style={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
                Aksi Call To Action (CTA)
              </Typography>
              <Box style={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Teks Tombol:
                </Typography>
                <Typography variant="subtitle1" style={{ fontWeight: 700, mb: 1.5 }}>
                  {slider.cta_text || '(Tanpa tombol CTA)'}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Tautan Tujuan:
                </Typography>
                <Typography
                  variant="body2"
                  style={{
                    fontWeight: 600,
                    color: slider.cta_link ? 'primary.main' : 'text.disabled',
                    wordBreak: 'break-all',
                    mb: 1.5
                  }}
                >
                  {slider.cta_link || '-'}
                </Typography>

                {slider.cta_link && (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    component="a"
                    href={slider.cta_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<IconExternalLink size={16} />}
                    style={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    Uji Tautan CTA
                  </Button>
                )}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => !deleting && setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ fontWeight: 800 }}>Hapus Slider Ini?</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus slider &quot;<strong>{slider.title}</strong>&quot;? Tindakan ini tidak dapat
            dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions style={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting} color="inherit">
            Batal
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={<IconTrash size={16} />}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus Slider'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
