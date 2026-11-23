// src/views/marketing/sliders/index.jsx
import { useState, useEffect } from 'react';
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
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '../components/MarketingUi';
import {
  IconArrowRight,
  IconCursorText,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconLayoutGrid,
  IconList,
  IconListNumbers,
  IconPhoto,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSlideshow,
  IconTrash
} from '@tabler/icons-react';

import { marketingApi } from '../../../api/marketingApi';
import { resolveImageUrl } from '../../../api/apiClient';
import MarketingActionFooter from '../components/MarketingActionFooter';
import MarketingHeader from '../components/MarketingHeader';
import MarketingImageUpload from '../components/MarketingImageUpload';
import MarketingSectionCard from '../components/MarketingSectionCard';
import MarketingStatusCard from '../components/MarketingStatusCard';
import SliderLivePreview from '../components/SliderLivePreview';

export default function MarketingSliders() {
  const navigate = useNavigate();

  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Create Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSlider, setNewSlider] = useState({
    title: '',
    subtitle: '',
    cta_text: 'Daftar Sekarang',
    cta_link: '/schedules',
    sort_order: 1,
    is_active: true,
    image_url: ''
  });
  const [newImageFile, setNewImageFile] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    setLoading(true);
    try {
      const data = await marketingApi.getSliders();
      const list = Array.isArray(data) ? data : [];
      setSliders(list);
      setNewSlider((prev) => ({ ...prev, sort_order: list.length + 1 }));
    } catch {
      setFeedback({ type: 'error', message: 'Gagal mengambil data slider dari server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setNewSlider({
      title: '',
      subtitle: '',
      cta_text: 'Daftar Sekarang',
      cta_link: '/schedules',
      sort_order: sliders.length + 1,
      is_active: true,
      image_url: ''
    });
    setNewImageFile(null);
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newSlider.title.trim()) {
      setFeedback({ type: 'error', message: 'Judul slider wajib diisi.' });
      return;
    }

    setCreating(true);
    try {
      const payload = new FormData();
      payload.append('title', newSlider.title.trim());
      payload.append('subtitle', newSlider.subtitle || '');
      payload.append('cta_text', newSlider.cta_text || '');
      payload.append('cta_link', newSlider.cta_link || '');
      payload.append('sort_order', Number(newSlider.sort_order) || 1);
      payload.append('is_active', newSlider.is_active ? 1 : 0);

      if (newImageFile) {
        payload.append('image_file', newImageFile);
      } else if (newSlider.image_url) {
        payload.append('image_url', newSlider.image_url);
      }

      await marketingApi.createSlider(payload);
      setFeedback({ type: 'success', message: 'Slider baru berhasil ditambahkan!' });
      setCreateOpen(false);
      fetchSliders();
    } catch {
      setFeedback({
        type: 'error',
        message: err.data?.message || err.message || 'Terjadi kesalahan saat menyimpan slider.'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (slider) => {
    try {
      const payload = new FormData();
      payload.append('title', slider.title);
      payload.append('is_active', slider.is_active ? 0 : 1);
      await marketingApi.updateSlider(slider.id, payload);

      setSliders((prev) =>
        prev.map((s) => (s.id === slider.id ? { ...s, is_active: !slider.is_active } : s))
      );
      setFeedback({
        type: 'success',
        message: `Status slider #${slider.id} berhasil diubah.`
      });
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memperbarui status slider.' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await marketingApi.deleteSlider(deleteTarget.id);
      setSliders((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setFeedback({ type: 'success', message: 'Slider berhasil dihapus permanen.' });
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menghapus slider.' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Filter calculations
  const filteredSliders = sliders.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.title?.toLowerCase().includes(q) ||
      s.subtitle?.toLowerCase().includes(q) ||
      s.cta_text?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? Boolean(s.is_active)
        : !s.is_active;

    return matchesSearch && matchesStatus;
  });

  const activeCount = sliders.filter((s) => s.is_active).length;
  const draftCount = sliders.length - activeCount;

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Hero Header */}
      <MarketingHeader
        title="Slider Landing Page"
        subtitle="Kelola tayangan carousel banner di muka website LBI FIB UI secara visual dan tertata rapih."
        icon={IconSlideshow}
        badge="Hero Carousel"
        stats={[
          { label: 'Total Slider', value: sliders.length },
          { label: 'Aktif Tayang', value: activeCount },
          { label: 'Draf', value: draftCount }
        ]}
        actions={
          <Button
            startIcon={<IconPlus size={18} />}
            onClick={handleOpenCreate}
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
            Tambah Slider Baru
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

      {/* Filter and View Controls Bar */}
      <Card variant="outlined" style={{ borderRadius: 3, p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} style={{ flexGrow: 1, maxWidth: { md: 650 } }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Cari judul, subjudul, atau tombol CTA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                )
              }}
            />
            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: { xs: '100%', sm: 170 } }}
            >
              <MenuItem value="all">Semua Status ({sliders.length})</MenuItem>
              <MenuItem value="active">Aktif Tayang ({activeCount})</MenuItem>
              <MenuItem value="draft">Draf ({draftCount})</MenuItem>
            </Select>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Tooltip title="Muat Ulang Data">
              <IconButton size="small" onClick={fetchSliders} disabled={loading}>
                <IconRefresh size={18} />
              </IconButton>
            </Tooltip>
            <Box style={{ borderLeft: '1px solid', borderColor: 'divider', height: 24, mx: 0.5 }} />
            <Tooltip title="Tampilan Kartu">
              <IconButton
                size="small"
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                <IconLayoutGrid size={19} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tampilan Tabel">
              <IconButton
                size="small"
                color={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
              >
                <IconList size={19} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Card>

      {/* Main Content Area */}
      {loading ? (
        <Box style={{ display: 'grid', placeItems: 'center', minHeight: 360 }}>
          <Stack spacing={1.5} alignItems="center">
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary">
              Memuat daftar slider...
            </Typography>
          </Stack>
        </Box>
      ) : filteredSliders.length === 0 ? (
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
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'primary.50',
              color: 'primary.main',
              mb: 2
            }}
          >
            <IconSlideshow size={30} />
          </Box>
          <Typography variant="h4" style={{ fontWeight: 800 }}>
            {sliders.length === 0 ? 'Belum Ada Slider Terdaftar' : 'Slider Tidak Ditemukan'}
          </Typography>
          <Typography color="text.secondary" style={{ mt: 0.75, maxWidth: 500, mx: 'auto' }}>
            {sliders.length === 0
              ? 'Mulai buat slider hero pertama Anda untuk menyambut calon peserta kursus di website LBI FIB UI.'
              : 'Tidak ada slider yang sesuai dengan kata kunci pencarian atau filter yang dipilih.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size={17} />}
            onClick={handleOpenCreate}
            style={{ mt: 2.5, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            Tambah Slider Baru
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <Grid container spacing={3}>
          {filteredSliders.map((slider) => {
            const imgSrc = slider.image_url ? resolveImageUrl(slider.image_url) : '';
            return (
              <Grid size={{ xs: 12, md: 6, xl: 4 }} key={slider.id}>
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
                  {/* Thumbnail Banner with aspect ratio */}
                  <Box
                    style={{
                      position: 'relative',
                      height: 200,
                      bgcolor: '#0f172a',
                      overflow: 'hidden'
                    }}
                  >
                    {imgSrc ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={slider.title}
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
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(255,255,255,0.4)'
                        }}
                      >
                        <IconPhoto size={42} stroke={1.5} />
                        <Typography variant="caption" style={{ mt: 0.5, color: 'rgba(255,255,255,0.5)' }}>
                          Tanpa Gambar
                        </Typography>
                      </Box>
                    )}

                    {/* Gradient Overlay */}
                    <Box
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(27, 56, 100, 0.85) 0%, rgba(27, 56, 100, 0.3) 60%, transparent 100%)'
                      }}
                    />

                    {/* Top Badges */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      style={{ position: 'absolute', top: 12, left: 12, right: 12 }}
                    >
                      <Chip
                        size="small"
                        label={`Urutan #${slider.sort_order || 1}`}
                        style={{
                          bgcolor: 'rgba(255, 255, 255, 0.92)',
                          color: '#2757A4',
                          fontWeight: 800,
                          fontSize: '0.72rem'
                        }}
                      />
                      <Chip
                        size="small"
                        label={slider.is_active ? 'Aktif Tayang' : 'Disembunyikan'}
                        color={slider.is_active ? 'success' : 'default'}
                        style={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor: slider.is_active ? undefined : 'rgba(255, 255, 255, 0.88)'
                        }}
                      />
                    </Stack>

                    {/* CTA Pill on preview */}
                    {slider.cta_text && (
                      <Box style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                        <Chip
                          size="small"
                          label={`Tombol: ${slider.cta_text}`}
                          style={{
                            bgcolor: 'rgba(255, 255, 255, 0.22)',
                            color: '#fff',
                            fontWeight: 700,
                            backdropFilter: 'blur(6px)',
                            fontSize: '0.72rem'
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Card Content */}
                  <CardContent style={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="h5"
                      style={{
                        fontWeight: 800,
                        lineHeight: 1.35,
                        minHeight: '2.7em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {slider.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      style={{
                        mt: 1,
                        lineHeight: 1.6,
                        flexGrow: 1,
                        minHeight: '3.2em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {slider.subtitle || 'Belum ada subjudul slider.'}
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      style={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title={slider.is_active ? 'Nonaktifkan slider' : 'Aktifkan slider'}>
                          <Switch
                            size="small"
                            checked={Boolean(slider.is_active)}
                            onChange={() => handleToggleActive(slider)}
                            color="success"
                          />
                        </Tooltip>
                        <Typography
                          variant="caption"
                          style={{
                            fontWeight: 700,
                            color: slider.is_active ? 'success.main' : 'text.disabled'
                          }}
                        >
                          {slider.is_active ? 'Live' : 'Draf'}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.75}>
                        <Tooltip title="Lihat Pratinjau Lengkap">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/marketing/sliders/${slider.id}`)}
                            style={{ bgcolor: '#E1EFFA', color: '#198BCC', '&:hover': { bgcolor: '#cce5f7' } }}
                          >
                            <IconEye size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Slider">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/marketing/sliders/${slider.id}/edit`)}
                            style={{ bgcolor: '#E1EFFA', color: '#2757A4', '&:hover': { bgcolor: '#cce5f7' } }}
                          >
                            <IconEdit size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Slider">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(slider)}
                            style={{ bgcolor: '#fee2e2', color: '#dc2626', '&:hover': { bgcolor: '#fecaca' } }}
                          >
                            <IconTrash size={17} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        /* Modern Table View */
        <Card variant="outlined" style={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead style={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell style={{ fontWeight: 800, width: 80 }}>Urutan</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 140 }}>Gambar</TableCell>
                  <TableCell style={{ fontWeight: 800 }}>Teks Slider</TableCell>
                  <TableCell style={{ fontWeight: 800 }}>Tombol CTA</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 130 }}>Status</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 130, textAlign: 'center' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSliders.map((slider) => (
                  <TableRow key={slider.id} hover>
                    <TableCell>
                      <Chip size="small" label={`#${slider.sort_order || 1}`} style={{ fontWeight: 800 }} />
                    </TableCell>
                    <TableCell>
                      <Box
                        component="img"
                        src={resolveImageUrl(slider.image_url, 'https://placehold.co/120x70?text=No+Image')}
                        alt={slider.title}
                        style={{
                          width: 120,
                          height: 68,
                          borderRadius: 2,
                          objectFit: 'cover',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'grey.100'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" style={{ fontWeight: 800 }}>
                        {slider.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        style={{
                          display: 'block',
                          mt: 0.5,
                          maxWidth: 420,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {slider.subtitle || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {slider.cta_text ? (
                        <Box>
                          <Chip
                            size="small"
                            label={slider.cta_text}
                            color="primary"
                            variant="outlined"
                            style={{ fontWeight: 700 }}
                          />
                          <Typography variant="caption" color="text.secondary" style={{ display: 'block', mt: 0.5 }}>
                            {slider.cta_link || '/'}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          (Tanpa tombol)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Switch
                          size="small"
                          checked={Boolean(slider.is_active)}
                          onChange={() => handleToggleActive(slider)}
                          color="success"
                        />
                        <Typography
                          variant="caption"
                          style={{
                            fontWeight: 700,
                            color: slider.is_active ? 'success.main' : 'text.disabled'
                          }}
                        >
                          {slider.is_active ? 'Tayang' : 'Draf'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Detail Slider">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => navigate(`/marketing/sliders/${slider.id}`)}
                          >
                            <IconEye size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Slider">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/marketing/sliders/${slider.id}/edit`)}
                          >
                            <IconEdit size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Slider">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(slider)}
                          >
                            <IconTrash size={17} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Modal / Dialog Create Slider Baru */}
      <Dialog
        open={createOpen}
        onClose={() => !creating && setCreateOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          style={{
            px: 3,
            py: 2.5,
            background: 'linear-gradient(135deg, #E1EFFA 0%, #f0f7fe 100%)',
            borderBottom: '1px solid',
            borderColor: '#d0e8f7',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: '#2757A4',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 3px 8px rgba(39, 87, 164, 0.25)'
            }}
          >
            <IconSlideshow size={22} />
          </Box>
          <Box>
            <Typography variant="h4" style={{ fontWeight: 800 }}>
              Tambah Slider Hero Baru
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Atur judul promosi, gambar, dan tombol call to action untuk halaman muka.
            </Typography>
          </Box>
        </DialogTitle>

        <form onSubmit={handleCreateSubmit}>
          <DialogContent style={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack spacing={3}>
              {/* Live Preview Inside Modal */}
              <Card variant="outlined" style={{ borderRadius: 2.5, p: 2 }}>
                <SliderLivePreview
                  title={newSlider.title}
                  subtitle={newSlider.subtitle}
                  ctaText={newSlider.cta_text}
                  ctaLink={newSlider.cta_link}
                  imageUrl={newSlider.image_url}
                  imageFile={newImageFile}
                  isActive={newSlider.is_active}
                  sortOrder={newSlider.sort_order}
                />
              </Card>

              {/* Form Section 01 */}
              <MarketingSectionCard
                number="01"
                title="Teks Utama Slider"
                description="Judul utama dan deskripsi yang akan menyapa pengunjung."
              >
                <TextField
                  fullWidth
                  required
                  label="Judul Utama Slider"
                  placeholder="Contoh: Kuasai Bahasa Asing Bersama Mentor Ahli"
                  value={newSlider.title}
                  onChange={(e) => setNewSlider({ ...newSlider, title: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCursorText size={18} />
                      </InputAdornment>
                    )
                  }}
                  helperText="Buat judul yang memikat dan ringkas."
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={2.5}
                  label="Subjudul / Deskripsi Pendukung"
                  placeholder="Contoh: Program terstruktur dengan pengajar berpengalaman dan sertifikat resmi universitas."
                  value={newSlider.subtitle}
                  onChange={(e) => setNewSlider({ ...newSlider, subtitle: e.target.value })}
                />
              </MarketingSectionCard>

              {/* Form Section 02 */}
              <MarketingSectionCard
                number="02"
                title="Tombol Aksi (CTA) & Urutan"
                description="Tentukan tombol navigasi dan posisi urutan tampil."
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Teks Tombol Aksi"
                      placeholder="Daftar Sekarang"
                      value={newSlider.cta_text}
                      onChange={(e) => setNewSlider({ ...newSlider, cta_text: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconArrowRight size={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Link URL Tujuan"
                      placeholder="/schedules atau https://..."
                      value={newSlider.cta_link}
                      onChange={(e) => setNewSlider({ ...newSlider, cta_link: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconExternalLink size={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Urutan Slider"
                      value={newSlider.sort_order}
                      onChange={(e) =>
                        setNewSlider({
                          ...newSlider,
                          sort_order: Math.max(1, parseInt(e.target.value) || 1)
                        })
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconListNumbers size={18} />
                          </InputAdornment>
                        ),
                        inputProps: { min: 1, max: 99 }
                      }}
                    />
                  </Grid>
                </Grid>
              </MarketingSectionCard>

              {/* Form Section 03 */}
              <MarketingSectionCard
                number="03"
                title="Gambar Visual & Publikasi"
                description="Pilih gambar hero dan tentukan status tayang."
              >
                <MarketingImageUpload
                  label="Gambar Hero Slider"
                  helperText="Rasio 16:9 disarankan (resolusi minimal 1200 x 675 px). Maksimal 5MB."
                  imageUrl={newSlider.image_url}
                  imageFile={newImageFile}
                  onFileChange={(file) => setNewImageFile(file)}
                  onUrlChange={(url) => setNewSlider({ ...newSlider, image_url: url })}
                  onClear={() => {
                    setNewImageFile(null);
                    setNewSlider({ ...newSlider, image_url: '' });
                  }}
                />

                <MarketingStatusCard
                  checked={newSlider.is_active}
                  onChange={(checked) => setNewSlider({ ...newSlider, is_active: checked })}
                  activeLabel="Tayangkan Segera"
                  inactiveLabel="Simpan Sebagai Draf"
                  activeDesc="Slider akan langsung masuk ke putaran carousel landing page."
                  inactiveDesc="Slider disimpan dan disembunyikan sementara waktu."
                />
              </MarketingSectionCard>
            </Stack>
          </DialogContent>

          <MarketingActionFooter
            onCancel={() => setCreateOpen(false)}
            saveText="Simpan & Tambahkan Slider"
            saving={creating}
          />
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle style={{ fontWeight: 800 }}>Hapus Slider Ini?</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus slider &quot;<strong>{deleteTarget?.title}</strong>&quot;? Tindakan ini
            tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions style={{ p: 2.5, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting} color="inherit">
            Batal
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={<IconTrash size={16} />}
          >
            {deleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
