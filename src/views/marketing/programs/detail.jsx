import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography
} from '../components/MarketingUi';
import {
  IconArrowLeft,
  IconBook2,
  IconEdit,
  IconExternalLink,
  IconLanguage,
  IconVideo,
  IconWorld
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import { resolveImageUrl } from '../../../api/apiClient';
import MarketingHeader from '../components/MarketingHeader';

const programDetails = {
  'program-bipa-129': {
    key: 'bipa',
    label: 'BIPA',
    divisionKey: 'bipa',
    description: 'Bahasa Indonesia untuk Penutur Asing',
    color: '#0f766e',
    light: '#ccfbf1',
    icon: IconWorld
  },
  'program-pelayanan-bahasa-127': {
    key: 'ppb',
    label: 'PPB',
    divisionKey: 'ppb_foreign',
    description: 'Program Pelayanan Bahasa (Kursus & Tes)',
    color: '#1d4ed8',
    light: '#dbeafe',
    icon: IconLanguage
  },
  'program-penerjemahan-dan-penjurubahasaan-1283': {
    key: 'ppp',
    label: 'PPP',
    divisionKey: 'ppp',
    description: 'Program Pelayanan Penerjemahan & Penjurubahasaan',
    color: '#7c3aed',
    light: '#ede9fe',
    icon: IconBook2
  }
};

function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : '';
}

export default function MarketingProgramDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    marketingApi
      .getService(serviceId)
      .then(setService)
      .catch((err) => setError(err.message || 'Gagal mengambil detail program.'))
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) {
    return (
      <Box style={{ display: 'grid', placeItems: 'center', minHeight: 450 }}>
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Memuat detail program...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !service) {
    return (
      <Box style={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" style={{ mb: 2.5 }}>
          {error || 'Program tidak ditemukan.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={17} />}
          onClick={() => navigate('/marketing/programs')}
        >
          Kembali ke Daftar Program
        </Button>
      </Box>
    );
  }

  const meta = programDetails[service.slug] || {
    key: 'program',
    label: 'Program',
    divisionKey: 'all',
    description: 'Program LBI FIB UI',
    color: '#2757A4',
    light: '#e2ecef',
    icon: IconBook2
  };
  const ProgramIcon = meta.icon;
  const youtubeEmbed = getYouTubeEmbedUrl(service.video_url);

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <MarketingHeader
        title={service.title || 'Detail Program'}
        subtitle={meta.description}
        icon={ProgramIcon}
        badge={`Program ${meta.label}`}
        backUrl="/marketing/programs"
        backText="Kembali ke Daftar Program"
        actions={
          <Stack direction="row" spacing={1.25}>
            <Button
              variant="contained"
              startIcon={<IconEdit size={17} />}
              onClick={() => navigate(`/marketing/programs/${service.id}/edit`)}
              style={{
                bgcolor: meta.color,
                fontWeight: 700,
                borderRadius: 2,
                px: 2.5,
                textTransform: 'none',
                '&:hover': { bgcolor: meta.color, filter: 'brightness(0.92)' }
              }}
            >
              Edit Program
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Left Column: Visual, Description & Rich Content */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Header Showcase Card */}
            <Card variant="outlined" style={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box
                style={{
                  height: { xs: 200, sm: 280 },
                  bgcolor: meta.light,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {service.image_url ? (
                  <Box
                    component="img"
                    src={resolveImageUrl(service.image_url)}
                    alt={service.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    style={{
                      height: '100%',
                      display: 'grid',
                      placeItems: 'center',
                      color: meta.color
                    }}
                  >
                    <ProgramIcon size={58} />
                  </Box>
                )}
                <Box
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(180deg, transparent 40%, ${meta.color}d0 100%)`
                  }}
                />
                <Chip
                  icon={<ProgramIcon size={15} />}
                  label={`Divisi ${meta.label}`}
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    color: meta.color,
                    fontWeight: 800,
                    '& .MuiChip-icon': { color: meta.color }
                  }}
                />
                <Typography
                  variant="h3"
                  style={{
                    position: 'absolute',
                    left: 20,
                    right: 20,
                    bottom: 16,
                    color: '#fff',
                    fontWeight: 800,
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {service.title}
                </Typography>
              </Box>

              <CardContent style={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Typography variant="overline" style={{ fontWeight: 800, color: meta.color, letterSpacing: 1.2 }}>
                  Ringkasan Eksekutif
                </Typography>
                <Typography variant="body1" style={{ mt: 0.5, lineHeight: 1.7, color: 'text.secondary' }}>
                  {service.summary || 'Belum ada ringkasan yang ditulis untuk program ini.'}
                </Typography>
              </CardContent>
            </Card>

            {/* Video Preview Card if URL exists */}
            {service.video_url && (
              <Card variant="outlined" style={{ borderRadius: 3, p: { xs: 2.5, sm: 3 } }}>
                <Stack direction="row" spacing={1} alignItems="center" style={{ mb: 2 }}>
                  <IconVideo size={20} color={meta.color} />
                  <Typography variant="h5" style={{ fontWeight: 800 }}>
                    Video Pengenalan Program
                  </Typography>
                </Stack>

                {youtubeEmbed ? (
                  <Box
                    style={{
                      position: 'relative',
                      borderRadius: 2,
                      overflow: 'hidden',
                      pt: '56.25%',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Box
                      component="iframe"
                      src={youtubeEmbed}
                      title="Video Pengenalan Program"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    style={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Typography variant="body2" style={{ fontWeight: 600 }}>
                      Tautan Video: {service.video_url}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      component="a"
                      href={service.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      endIcon={<IconExternalLink size={15} />}
                      style={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Buka Video
                    </Button>
                  </Box>
                )}

                {service.video_description && (
                  <Box
                    style={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}
                    dangerouslySetInnerHTML={{ __html: service.video_description }}
                  />
                )}
              </Card>
            )}

            {/* Full Body Content */}
            <Card variant="outlined" style={{ borderRadius: 3, p: { xs: 2.5, sm: 4 } }}>
              <Typography variant="h4" style={{ fontWeight: 800, mb: 2 }}>
                Konten Lengkap Website
              </Typography>
              <Divider style={{ mb: 2.5 }} />
              <Box
                style={{
                  typography: 'body1',
                  lineHeight: 1.85,
                  fontSize: '1rem',
                  color: 'text.primary',
                  '& h2, & h3, & h4': {
                    color: meta.color,
                    fontWeight: 800,
                    mt: 3,
                    mb: 1
                  },
                  '& ul, & ol': { pl: 3 },
                  '& p': { mb: 2 },
                  '& blockquote': {
                    borderLeft: `4px solid ${meta.color}`,
                    pl: 2,
                    my: 2,
                    fontStyle: 'italic',
                    color: 'text.secondary'
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: service.body || '<p><em>Belum ada deskripsi lengkap program yang disimpan.</em></p>'
                }}
              />
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Metadata & Quick Access */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.5}>
            {/* Status & Identitas Card */}
            <Card variant="outlined" style={{ borderRadius: 3, p: 3 }}>
              <Typography variant="overline" style={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
                Status & Publikasi
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center" style={{ mt: 1, mb: 2 }}>
                <Box
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: service.is_active ? 'success.light' : 'grey.200',
                    color: service.is_active ? 'success.dark' : 'text.disabled'
                  }}
                >
                  <IconWorld size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" style={{ fontWeight: 800 }}>
                    {service.is_active ? 'Aktif di Landing Page' : 'Draf (Disembunyikan)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {service.is_active ? 'Dapat diakses oleh publik' : 'Tersembunyi dari menu publik'}
                  </Typography>
                </Box>
              </Stack>

              <Divider style={{ my: 1.5 }} />

              <Stack spacing={1.5}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Divisi:
                  </Typography>
                  <Chip
                    size="small"
                    label={meta.label}
                    style={{ bgcolor: meta.light, color: meta.color, fontWeight: 800 }}
                  />
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Slug Sistem:
                  </Typography>
                  <Typography variant="caption" style={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {service.slug}
                  </Typography>
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    ID Program:
                  </Typography>
                  <Typography variant="body2" style={{ fontWeight: 700 }}>
                    #{service.id}
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Course Catalogs Link Card */}
            <Card
              variant="outlined"
              style={{
                borderRadius: 3,
                p: 3,
                background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="overline" style={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 1 }}>
                Katalog Kursus
              </Typography>
              <Typography variant="h5" style={{ fontWeight: 800, mt: 0.5 }}>
                Course Terkait Program
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ mt: 0.5, mb: 2 }}>
                Kelola daftar kursus, tarif pendaftaran, dan jadwal untuk divisi {meta.label}.
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<IconBook2 size={17} />}
                onClick={() => navigate('/marketing/catalogs')}
                style={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Buka Course Catalog
              </Button>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
