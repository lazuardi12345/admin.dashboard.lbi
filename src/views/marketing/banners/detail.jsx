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
  IconSpeakerphone,
  IconTrash,
  IconWorld
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import BannerLivePreview from '../components/BannerLivePreview';
import MarketingHeader from '../components/MarketingHeader';

const categoryLabels = {
  promo: 'Promo & Diskon',
  announcement: 'Pengumuman Resmi',
  info: 'Informasi Kursus',
  event: 'Event / Webinar'
};

export default function MarketingBannerDetail() {
  const { contentId } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    marketingApi
      .getBanner(contentId)
      .then(setBanner)
      .catch((requestError) => setError(requestError.message || 'Gagal mengambil detail banner.'))
      .finally(() => setLoading(false));
  }, [contentId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await marketingApi.deleteBanner(contentId);
      navigate('/marketing/banners');
    } catch (err) {
      setError(err.message || 'Gagal menghapus banner.');
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
            Memuat detail banner...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !banner) {
    return (
      <Box style={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" style={{ mb: 2.5 }}>
          {error || 'Banner tidak ditemukan.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={17} />}
          onClick={() => navigate('/marketing/banners')}
        >
          Kembali ke Daftar Banner
        </Button>
      </Box>
    );
  }

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <MarketingHeader
        title={banner.title || 'Detail Banner'}
        subtitle="Pratinjau tampilan banner pengumuman / promosi di landing page website."
        icon={IconSpeakerphone}
        badge={`Banner #${banner.id}`}
        backUrl="/marketing/banners"
        backText="Kembali ke Daftar Banner"
        actions={
          <Stack direction="row" spacing={1.25}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconEdit size={17} />}
              onClick={() => navigate(`/marketing/banners/${banner.id}/edit`)}
              style={{ fontWeight: 700, borderRadius: 2, px: 2.5, textTransform: 'none' }}
            >
              Edit Banner
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
            <BannerLivePreview
              title={banner.title}
              category={banner.category}
              description={banner.description}
              linkUrl={banner.link_url}
              imageUrl={banner.image_url}
              isActive={banner.is_active}
            />
          </Card>
        </Grid>

        {/* Right Column: Metadata & Target Link */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            {/* Status & Category Card */}
            <Card variant="outlined" style={{ borderRadius: 3, p: 2.5 }}>
              <Typography variant="overline" style={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
                Status & Kategori
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" style={{ mt: 1, mb: 2 }}>
                <Box
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: banner.is_active ? 'success.light' : 'grey.200',
                    color: banner.is_active ? 'success.dark' : 'text.disabled'
                  }}
                >
                  <IconWorld size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" style={{ fontWeight: 800 }}>
                    {banner.is_active ? 'Aktif di Landing Page' : 'Draf (Disembunyikan)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {banner.is_active ? 'Bisa dilihat semua pengunjung' : 'Hanya tampak di dashboard'}
                  </Typography>
                </Box>
              </Stack>
              <Divider style={{ my: 1.5 }} />
              <Stack spacing={1.5}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Kategori Banner:
                  </Typography>
                  <Chip
                    size="small"
                    label={categoryLabels[banner.category] || banner.category || 'Promo'}
                    color="primary"
                    style={{ fontWeight: 700 }}
                  />
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    ID Banner:
                  </Typography>
                  <Typography variant="body2" style={{ fontWeight: 700 }}>
                    #{banner.id}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Target Link Card */}
            <Card variant="outlined" style={{ borderRadius: 3, p: 2.5 }}>
              <Typography variant="overline" style={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
                Tautan Aksi / Link Tujuan
              </Typography>
              <Box style={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  URL Tujuan:
                </Typography>
                <Typography
                  variant="body2"
                  style={{
                    fontWeight: 600,
                    color: banner.link_url ? 'primary.main' : 'text.disabled',
                    wordBreak: 'break-all',
                    mb: 2
                  }}
                >
                  {banner.link_url || 'Tidak ada tautan tujuan.'}
                </Typography>

                {banner.link_url && (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    component="a"
                    href={banner.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<IconExternalLink size={16} />}
                    style={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                  >
                    Buka Link Tujuan
                  </Button>
                )}
              </Box>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => !deleting && setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ fontWeight: 800 }}>Hapus Banner Ini?</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus banner &quot;<strong>{banner.title}</strong>&quot;? Tindakan ini tidak dapat
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
            {deleting ? 'Menghapus...' : 'Ya, Hapus Banner'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
