import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  IconClock,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconLayoutGrid,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';

import { marketingApi } from '../../../api/marketingApi';
import { resolveImageUrl } from '../../../api/apiClient';
import MarketingHeader from '../components/MarketingHeader';

const divisionLabels = {
  bipa: 'BIPA',
  ppb_english: 'PPB Bahasa Inggris',
  ppb_foreign: 'PPB Non Inggris',
  testing: 'Tes Bahasa',
  ppp: 'PPP Penerjemahan'
};

const programLabels = {
  bipa: 'BIPA',
  ppb: 'PPB',
  ppp: 'PPP'
};

const programColors = {
  bipa: 'primary',
  ppb: 'info',
  ppp: 'secondary'
};

const getProgramGroup = (division) => {
  if (division === 'bipa') return 'bipa';
  if (division === 'ppp') return 'ppp';
  return 'ppb';
};

export default function MarketingCatalogs() {
  const navigate = useNavigate();

  const [catalogs, setCatalogs] = useState([]);
  const [query, setQuery] = useState('');
  const [division, setDivision] = useState('all');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Quick Detail Preview Modal
  const [detailTarget, setDetailTarget] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const programs = ['ppb', 'bipa', 'ppp'];
  const activeCount = catalogs.filter((catalog) => catalog.is_active).length;
  const hiddenCount = catalogs.length - activeCount;
  const hasFilters = Boolean(query.trim()) || division !== 'all' || status !== 'all';

  const fetchCatalogs = useCallback(() => {
    setLoading(true);
    marketingApi
      .getCourseCatalogs()
      .then(setCatalogs)
      .catch((error) => setFeedback({ type: 'error', message: error.message || 'Gagal mengambil course catalog.' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const filteredCatalogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return catalogs.filter((catalog) => {
      const matchesQuery =
        !normalizedQuery ||
        [catalog.title, catalog.summary, catalog.service?.title, catalog.category, catalog.level].some((value) =>
          value?.toLowerCase().includes(normalizedQuery)
        );
      const matchesDivision = division === 'all' || getProgramGroup(catalog.division) === division;
      const matchesStatus =
        status === 'all' ? true : status === 'active' ? catalog.is_active : !catalog.is_active;
      return matchesQuery && matchesDivision && matchesStatus;
    });
  }, [catalogs, division, query, status]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await marketingApi.deleteCourseCatalog(deleteTarget.id);
      setCatalogs((current) => current.filter((catalog) => catalog.id !== deleteTarget.id));
      setFeedback({
        type: 'success',
        message: 'Course catalog berhasil dihapus permanen.'
      });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal menghapus course catalog.' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1440, mx: 'auto' }}>
      {/* Header */}
      <MarketingHeader
        title="Course Catalog"
        subtitle="Kelola informasi setiap kursus yang tampil di landing page, dari ringkasan hingga alur pendaftaran."
        icon={IconBook2}
        badge="Katalog Kursus"
        stats={[
          { label: 'Total Course', value: catalogs.length },
          { label: 'Aktif Tayang', value: activeCount },
          { label: 'Disembunyikan', value: hiddenCount }
        ]}
        actions={
          <Button
            startIcon={<IconPlus size={18} />}
            onClick={() => navigate('/marketing/catalogs/new')}
            style={{
              fontWeight: 700,
              borderRadius: 2,
              px: 2.75,
              py: 1,
              textTransform: 'none',
              background: '#FFFFFF !important',
              color: '#18386E !important',
              border: '1px solid #FFFFFF',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              '&:hover': {
                background: '#F6DB00 !important',
                color: '#18386E !important',
                borderColor: '#F6DB00',
                boxShadow: '0 6px 18px rgba(246, 219, 0, 0.35)'
              }
            }}
          >
            Tambah Course Baru
          </Button>
        }
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

      {/* Filter Bar */}
      <Card variant="outlined" style={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="stretch">
          <TextField
            fullWidth
            size="small"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama course, ringkasan, atau program..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" style={{ minWidth: { xs: '100%', md: 200 } }}>
            <InputLabel>Program</InputLabel>
            <Select value={division} label="Program" onChange={(event) => setDivision(event.target.value)}>
              <MenuItem value="all">Semua Program</MenuItem>
              {programs.map((item) => (
                <MenuItem key={item} value={item}>
                  {programLabels[item]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" style={{ minWidth: { xs: '100%', md: 170 } }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(event) => setStatus(event.target.value)}>
              <MenuItem value="all">Semua Status</MenuItem>
              <MenuItem value="active">Aktif Tayang</MenuItem>
              <MenuItem value="inactive">Disembunyikan</MenuItem>
            </Select>
          </FormControl>
          {hasFilters && (
            <Button
              size="small"
              onClick={() => {
                setQuery('');
                setDivision('all');
                setStatus('all');
              }}
              style={{ textTransform: 'none', whiteSpace: 'nowrap' }}
            >
              Reset
            </Button>
          )}
        </Stack>
      </Card>

      {/* Section Subheader */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        style={{ mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <IconLayoutGrid size={18} />
          <Typography variant="h5" style={{ fontWeight: 800 }}>
            Daftar Course Catalog
          </Typography>
          <Chip size="small" label={`${filteredCatalogs.length} kursus`} variant="outlined" style={{ fontWeight: 700 }} />
        </Stack>
        <Button
          size="small"
          startIcon={<IconRefresh size={16} />}
          onClick={fetchCatalogs}
          disabled={loading}
          style={{ textTransform: 'none' }}
        >
          Muat Ulang
        </Button>
      </Stack>

      {/* Main Content Area */}
      {loading ? (
        <Box style={{ display: 'grid', placeItems: 'center', minHeight: 360 }}>
          <Stack spacing={1.5} alignItems="center">
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary">
              Memuat katalog course...
            </Typography>
          </Stack>
        </Box>
      ) : filteredCatalogs.length === 0 ? (
        <Card
          variant="outlined"
          style={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            borderRadius: 3,
            borderStyle: 'dashed',
            bgcolor: 'grey.50'
          }}
        >
          <Box
            style={{
              width: 56,
              height: 56,
              mx: 'auto',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 3,
              bgcolor: 'primary.50',
              color: 'primary.main',
              mb: 2
            }}
          >
            <IconBook2 size={30} />
          </Box>
          <Typography variant="h4" style={{ fontWeight: 800 }}>
            {catalogs.length === 0 ? 'Belum Ada Course Terdaftar' : 'Course Tidak Ditemukan'}
          </Typography>
          <Typography color="text.secondary" style={{ mt: 0.75, maxWidth: 500, mx: 'auto' }}>
            {catalogs.length === 0
              ? 'Mulai buat katalog kursus untuk ditampilkan di landing page website LBI FIB UI.'
              : 'Coba ubah kata kunci pencarian atau sesuaikan filter program.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size={17} />}
            onClick={() => navigate('/marketing/catalogs/new')}
            style={{ mt: 2.5, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            Tambah Course Baru
          </Button>
        </Card>
      ) : (
        /* Course Grid Cards */
        <Grid container spacing={3}>
          {filteredCatalogs.map((catalog) => {
            const programGroup = getProgramGroup(catalog.division);
            const imgSrc = catalog.image_url ? resolveImageUrl(catalog.image_url) : '';

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={catalog.id}>
                <Card
                  variant="outlined"
                  style={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(39, 87, 164, 0.08)',
                      borderColor: 'primary.light'
                    }
                  }}
                >
                  {/* Thumbnail Cover */}
                  <Box style={{ height: 185, position: 'relative', bgcolor: 'grey.100', overflow: 'hidden' }}>
                    {imgSrc ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={catalog.title}
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
                      <Box
                        style={{
                          height: '100%',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'text.disabled',
                          background: 'linear-gradient(135deg, #edf3f8, #e2ecef)'
                        }}
                      >
                        <IconBook2 size={44} />
                      </Box>
                    )}

                    <Chip
                      size="small"
                      label={catalog.is_active ? 'Aktif Tayang' : 'Disembunyikan'}
                      color={catalog.is_active ? 'success' : 'default'}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: catalog.is_active ? undefined : 'rgba(255,255,255,.94)'
                      }}
                    />

                    <Chip
                      size="small"
                      label={divisionLabels[catalog.division] || programLabels[programGroup] || 'Catalog'}
                      color={programColors[programGroup] || 'default'}
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor: 'rgba(255,255,255,.95)'
                      }}
                    />
                  </Box>

                  {/* Body Content */}
                  <CardContent style={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      #{catalog.id} Ã‚Â· {catalog.service?.title || 'Program LBI'}
                    </Typography>

                    <Typography
                      variant="h5"
                      style={{
                        mt: 0.5,
                        fontWeight: 800,
                        lineHeight: 1.35,
                        minHeight: '2.7em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {catalog.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{
                        mt: 0.75,
                        lineHeight: 1.6,
                        minHeight: '3.2em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {catalog.summary || 'Belum ada ringkasan course catalog.'}
                    </Typography>

                    {/* Chips for duration, level, category */}
                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" style={{ mt: 1.5, minHeight: 28 }}>
                      {catalog.duration && (
                        <Chip
                          size="small"
                          icon={<IconClock size={13} />}
                          label={catalog.duration}
                          variant="outlined"
                          style={{ fontSize: '0.72rem' }}
                        />
                      )}
                      {catalog.level && (
                        <Chip size="small" label={catalog.level} variant="outlined" style={{ fontSize: '0.72rem' }} />
                      )}
                      {catalog.category && (
                        <Chip size="small" label={catalog.category} variant="outlined" style={{ fontSize: '0.72rem' }} />
                      )}
                    </Stack>

                    {/* Actions Bar */}
                    <Stack
                      direction="row"
                      spacing={1}
                      style={{ mt: 2, pt: 1.75, borderTop: '1px solid', borderColor: 'divider' }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<IconEye size={16} />}
                        onClick={() => setDetailTarget(catalog)}
                        style={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          flex: 1,
                          borderColor: '#198BCC',
                          color: '#2757A4',
                          '&:hover': { bgcolor: '#E1EFFA', borderColor: '#2757A4' }
                        }}
                      >
                        Detail
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<IconEdit size={16} />}
                        onClick={() => navigate(`/marketing/catalogs/${catalog.id}/edit`)}
                        style={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          flex: 1,
                          bgcolor: '#2757A4',
                          '&:hover': { bgcolor: '#1c4280' }
                        }}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(catalog)}
                        style={{ bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 2, '&:hover': { bgcolor: '#fecaca' } }}
                      >
                        <IconTrash size={17} />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Quick Detail Modal */}
      <Dialog
        open={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {detailTarget && (
          <>
            <DialogTitle
              style={{
                px: 3,
                py: 2.5,
                background: 'linear-gradient(135deg, #E1EFFA 0%, #f0f7fe 100%)',
                borderBottom: '1px solid',
                borderColor: '#d0e8f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <IconBook2 size={22} />
                </Box>
                <Box>
                  <Typography variant="h4" style={{ fontWeight: 800 }}>
                    {detailTarget.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {detailTarget.service?.title} Ã‚Â· {divisionLabels[detailTarget.division] || detailTarget.division}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                label={detailTarget.is_active ? 'Aktif Tayang' : 'Disembunyikan'}
                color={detailTarget.is_active ? 'success' : 'default'}
                style={{ fontWeight: 700 }}
              />
            </DialogTitle>

            <DialogContent style={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Stack spacing={2.5}>
                {detailTarget.summary && (
                  <Box style={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                    <Typography variant="body1" style={{ fontStyle: 'italic' }}>
                      {detailTarget.summary}
                    </Typography>
                  </Box>
                )}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Level:
                    </Typography>
                    <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                      {detailTarget.level || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Durasi:
                    </Typography>
                    <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                      {detailTarget.duration || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Kategori:
                    </Typography>
                    <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                      {detailTarget.category || '-'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="caption" color="text.secondary">
                      Urutan:
                    </Typography>
                    <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                      #{detailTarget.sort_order || 0}
                    </Typography>
                  </Grid>
                </Grid>

                {detailTarget.description && (
                  <Box>
                    <Typography variant="subtitle2" style={{ fontWeight: 800, mb: 1 }}>
                      Silabus & Deskripsi:
                    </Typography>
                    <Box
                      style={{ typography: 'body2', color: 'text.secondary', lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: detailTarget.description }}
                    />
                  </Box>
                )}

                {detailTarget.learning_outcomes && (
                  <Box>
                    <Typography variant="subtitle2" style={{ fontWeight: 800, mb: 1 }}>
                      Capaian Belajar (Learning Outcomes):
                    </Typography>
                    <Typography variant="body2" color="text.secondary" style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
                      {detailTarget.learning_outcomes}
                    </Typography>
                  </Box>
                )}

                {detailTarget.registration_url && (
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={detailTarget.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<IconExternalLink size={15} />}
                    style={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700 }}
                  >
                    Buka Tautan Pendaftaran
                  </Button>
                )}
              </Stack>
            </DialogContent>

            <DialogActions style={{ p: 2.5, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={() => setDetailTarget(null)} color="inherit">
                Tutup
              </Button>
              <Button
                variant="contained"
                startIcon={<IconEdit size={16} />}
                onClick={() => {
                  const targetId = detailTarget.id;
                  setDetailTarget(null);
                  navigate(`/marketing/catalogs/${targetId}/edit`);
                }}
                style={{ textTransform: 'none', fontWeight: 700 }}
              >
                Edit Course Ini
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle style={{ fontWeight: 800 }}>Hapus Course Catalog Ini?</DialogTitle>
        <DialogContent>
          <Typography>
            Course <strong>{deleteTarget?.title}</strong> beserta level, jadwal, dan tarif terkait akan dihapus permanen.
            Riwayat pendaftaran peserta tetap tersimpan secara aman. Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions style={{ p: 2.5, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} color="inherit">
            Batal
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            startIcon={<IconTrash size={16} />}
            disabled={deleting}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
