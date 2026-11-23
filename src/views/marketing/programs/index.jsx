import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography
} from '../components/MarketingUi';
import {
  IconBook2,
  IconEdit,
  IconEye,
  IconLanguage,
  IconWorld
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import { resolveImageUrl } from '../../../api/apiClient';
import MarketingHeader from '../components/MarketingHeader';

const programDetails = {
  'program-bipa-129': {
    key: 'bipa',
    label: 'BIPA',
    description: 'Bahasa Indonesia untuk Penutur Asing',
    color: '#0f766e',
    light: '#ccfbf1',
    icon: IconWorld
  },
  'program-pelayanan-bahasa-127': {
    key: 'ppb',
    label: 'PPB',
    description: 'Kursus Bahasa Asing & Tes Diagnostik',
    color: '#1d4ed8',
    light: '#dbeafe',
    icon: IconLanguage
  },
  'program-penerjemahan-dan-penjurubahasaan-1283': {
    key: 'ppp',
    label: 'PPP',
    description: 'Layanan Penerjemahan & Penjurubahasaan',
    color: '#7c3aed',
    light: '#ede9fe',
    icon: IconBook2
  }
};

const programFilters = [
  { key: 'all', label: 'Semua Program' },
  ...Object.values(programDetails).map(({ key, label }) => ({ key, label }))
];

export default function MarketingPrograms() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [activeProgram, setActiveProgram] = useState('all');

  useEffect(() => {
    marketingApi
      .getServices()
      .then((data) => setServices(data.filter((service) => programDetails[service.slug])))
      .catch((error) => setFeedback({ type: 'error', message: error.message || 'Gagal mengambil program.' }))
      .finally(() => setLoading(false));
  }, []);

  const filteredServices =
    activeProgram === 'all'
      ? services
      : services.filter((service) => programDetails[service.slug]?.key === activeProgram);

  if (loading) {
    return (
      <Box style={{ display: 'grid', placeItems: 'center', minHeight: 450 }}>
        <Stack spacing={1.5} alignItems="center">
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Memuat layanan program...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <MarketingHeader
        title="Program Layanan Utama"
        subtitle="Kelola konten tiga layanan utama LBI FIB UI: BIPA, PPB, dan PPP."
        icon={IconLanguage}
        badge="Layanan Akademik"
        stats={[{ label: 'Total Program', value: services.length }]}
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

      {/* Program Filter Tabs */}
      <Stack direction="row" spacing={1} style={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        {programFilters.map((filter) => {
          const count =
            filter.key === 'all'
              ? services.length
              : services.filter((service) => programDetails[service.slug]?.key === filter.key).length;
          const selected = activeProgram === filter.key;
          return (
            <Chip
              key={filter.key}
              label={`${filter.label} (${count})`}
              onClick={() => setActiveProgram(filter.key)}
              clickable
              style={{
                fontWeight: 700,
                borderRadius: 2,
                px: 1,
                bgcolor: selected ? '#2757A4' : 'grey.100',
                color: selected ? '#ffffff' : 'text.primary',
                border: '1px solid',
                borderColor: selected ? '#2757A4' : 'divider',
                '&:hover': {
                  bgcolor: selected ? '#1c4280' : '#E1EFFA',
                  borderColor: '#198BCC'
                }
              }}
            />
          );
        })}
      </Stack>

      {/* Program Cards */}
      {filteredServices.length === 0 ? (
        <Card variant="outlined" style={{ p: 5, textAlign: 'center', borderRadius: 3, borderStyle: 'dashed' }}>
          <Typography variant="h5" style={{ fontWeight: 700 }}>
            Program belum tersedia
          </Typography>
          <Typography color="text.secondary" style={{ mt: 0.5 }}>
            Data program belum dapat ditampilkan saat ini.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredServices.map((service) => {
            const program = programDetails[service.slug] || {
              key: 'ppb',
              label: 'Program',
              description: 'Layanan LBI FIB UI',
              color: '#2757A4',
              light: '#f1f5f9',
              icon: IconBook2
            };
            const ProgramIcon = program.icon;

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={service.id}>
                <Card
                  variant="outlined"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1.5px solid',
                    borderColor: `${program.color}25`,
                    borderRadius: 3,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 14px 34px ${program.color}18`,
                      borderColor: program.color
                    }
                  }}
                >
                  {/* Card Media Header */}
                  <Box style={{ height: 200, bgcolor: program.light, position: 'relative', overflow: 'hidden' }}>
                    {service.image_url ? (
                      <Box
                        component="img"
                        src={resolveImageUrl(service.image_url)}
                        alt={service.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.35s ease',
                          '.MuiCard-root:hover &': {
                            transform: 'scale(1.04)'
                          }
                        }}
                      />
                    ) : (
                      <Box style={{ height: '100%', display: 'grid', placeItems: 'center', color: program.color }}>
                        <ProgramIcon size={52} />
                      </Box>
                    )}

                    <Box
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(180deg, transparent 25%, ${program.color}d5 100%)`
                      }}
                    />

                    <Chip
                      icon={<ProgramIcon size={15} />}
                      label={program.label}
                      style={{
                        position: 'absolute',
                        top: 14,
                        left: 14,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        color: program.color,
                        fontWeight: 800,
                        '& .MuiChip-icon': { color: program.color }
                      }}
                    />

                    <Chip
                      size="small"
                      label={service.is_active ? 'Aktif Tayang' : 'Disembunyikan'}
                      color={service.is_active ? 'success' : 'default'}
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        fontWeight: 700,
                        bgcolor: service.is_active ? undefined : 'rgba(255, 255, 255, 0.9)'
                      }}
                    />

                    <Typography
                      style={{
                        position: 'absolute',
                        left: 18,
                        right: 18,
                        bottom: 14,
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        textShadow: '0 1px 8px rgba(0,0,0,0.5)'
                      }}
                    >
                      {program.description}
                    </Typography>
                  </Box>

                  {/* Body Content */}
                  <CardContent style={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Typography
                      variant="overline"
                      style={{ color: program.color, fontWeight: 800, letterSpacing: 1 }}
                    >
                      {program.label} Ã‚Â· LBI FIB UI
                    </Typography>
                    <Typography
                      variant="h4"
                      style={{
                        fontWeight: 800,
                        mt: 0.25,
                        mb: 1.25,
                        lineHeight: 1.3,
                        minHeight: '2.6em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {service.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{
                        lineHeight: 1.7,
                        mb: 2,
                        flexGrow: 1,
                        minHeight: '3.4em',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {service.summary || 'Belum ada ringkasan yang ditulis untuk program ini.'}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1.25}
                      style={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
                    >
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<IconEye size={16} />}
                        onClick={() => navigate(`/marketing/programs/${service.id}`)}
                        style={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          borderColor: '#198BCC',
                          color: '#2757A4',
                          '&:hover': { bgcolor: '#E1EFFA', borderColor: '#2757A4' }
                        }}
                      >
                        Detail Konten
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<IconEdit size={16} />}
                        onClick={() => navigate(`/marketing/programs/${service.id}/edit`)}
                        style={{
                          borderRadius: 2,
                          bgcolor: program.color,
                          fontWeight: 700,
                          textTransform: 'none',
                          '&:hover': { bgcolor: program.color, filter: 'brightness(0.92)' }
                        }}
                      >
                        Edit Program
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
