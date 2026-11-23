// src/views/marketing/banners/index.jsx
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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
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
  IconCursorText,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconLayoutGrid,
  IconList,
  IconPhoto,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSpeakerphone,
  IconTag,
  IconTrash
} from '@tabler/icons-react';

import { marketingApi } from '../../../api/marketingApi';
import { resolveImageUrl } from '../../../api/apiClient';
import BannerLivePreview from '../components/BannerLivePreview';
import MarketingActionFooter from '../components/MarketingActionFooter';
import MarketingHeader from '../components/MarketingHeader';
import MarketingImageUpload from '../components/MarketingImageUpload';
import MarketingSectionCard from '../components/MarketingSectionCard';
import MarketingStatusCard from '../components/MarketingStatusCard';

const BANNER_CATEGORIES = [
  { value: 'promo', label: 'Promo & Diskon' },
  { value: 'announcement', label: 'Pengumuman Resmi' },
  { value: 'info', label: 'Informasi Kursus' },
  { value: 'event', label: 'Event / Webinar' }
];

const categoryLabels = {
  promo: 'Promo & Diskon',
  announcement: 'Pengumuman Resmi',
  info: 'Informasi Kursus',
  event: 'Event / Webinar'
};

const categoryBadgeColor = {
  promo: 'primary',
  announcement: 'warning',
  info: 'info',
  event: 'secondary'
};

export default function MarketingBanners() {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    category: 'promo',
    description: '',
    link_url: '/schedules',
    is_active: true,
    image_url: ''
  });
  const [newImageFile, setNewImageFile] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await marketingApi.getBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal mengambil data banner dari server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setNewBanner({
      title: '',
      category: 'promo',
      description: '',
      link_url: '/schedules',
      is_active: true,
      image_url: ''
    });
    setNewImageFile(null);
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newBanner.title.trim()) {
      setFeedback({ type: 'error', message: 'Judul banner wajib diisi.' });
      return;
    }

    setCreating(true);
    try {
      const payload = new FormData();
      payload.append('title', newBanner.title.trim());
      payload.append('category', newBanner.category || 'promo');
      payload.append('description', newBanner.description || '');
      payload.append('link_url', newBanner.link_url || '');
      payload.append('is_active', newBanner.is_active ? 1 : 0);

      if (newImageFile) {
        payload.append('image_file', newImageFile);
      } else if (newBanner.image_url) {
        payload.append('image_url', newBanner.image_url);
      }

      await marketingApi.createBanner(payload);
      setFeedback({ type: 'success', message: 'Banner baru berhasil ditambahkan!' });
      setCreateOpen(false);
      fetchBanners();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.data?.message || err.message || 'Terjadi kesalahan saat menyimpan banner.'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const payload = new FormData();
      payload.append('title', banner.title);
      payload.append('is_active', banner.is_active ? 0 : 1);
      await marketingApi.updateBanner(banner.id, payload);

      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: !banner.is_active } : b))
      );
      setFeedback({ type: 'success', message: `Status banner #${banner.id} berhasil diubah.` });
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memperbarui status banner.' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await marketingApi.deleteBanner(deleteTarget.id);
      setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setFeedback({ type: 'success', message: 'Banner berhasil dihapus permanen.' });
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menghapus banner.' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Filter calculation
  const filteredBanners = banners.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      b.link_url?.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? Boolean(b.is_active)
        : !b.is_active;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCount = banners.filter((b) => b.is_active).length;
  const draftCount = banners.length - activeCount;

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <MarketingHeader
        title="Banner Promo & Pengumuman"
        subtitle="Kelola banner promosi, pengumuman pendaftaran, dan informasi event kursus di landing page."
        icon={IconSpeakerphone}
        badge="Pengumuman & Promo"
        stats={[
          { label: 'Total Banner', value: banners.length },
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
            Tambah Banner Baru
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

      {/* Category Tabs */}
      <Stack direction="row" spacing={1} style={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label={`Semua Kategori (${banners.length})`}
          onClick={() => setCategoryFilter('all')}
          clickable
          style={{
            fontWeight: 800,
            borderRadius: 2,
            px: 1,
            bgcolor: categoryFilter === 'all' ? '#2757A4' : '#E1EFFA',
            color: categoryFilter === 'all' ? '#ffffff' : '#2757A4',
            '&:hover': {
              bgcolor: categoryFilter === 'all' ? '#1c4280' : '#d2e7f7'
            }
          }}
        />
        {BANNER_CATEGORIES.map((cat) => {
          const count = banners.filter((b) => b.category === cat.value).length;
          const isSelected = categoryFilter === cat.value;
          return (
            <Chip
              key={cat.value}
              label={`${cat.label} (${count})`}
              onClick={() => setCategoryFilter(cat.value)}
              clickable
              style={{
                fontWeight: 700,
                borderRadius: 2,
                px: 1,
                bgcolor: isSelected ? '#2757A4' : 'grey.100',
                color: isSelected ? '#ffffff' : 'text.primary',
                border: '1px solid',
                borderColor: isSelected ? '#2757A4' : 'divider',
                '&:hover': {
                  bgcolor: isSelected ? '#1c4280' : '#E1EFFA',
                  borderColor: '#198BCC'
                }
              }}
            />
          );
        })}
      </Stack>

      {/* Controls Card */}
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
              placeholder="Cari judul banner, deskripsi, atau tautan link..."
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
              <MenuItem value="all">Semua Status</MenuItem>
              <MenuItem value="active">Aktif Tayang ({activeCount})</MenuItem>
              <MenuItem value="draft">Draf ({draftCount})</MenuItem>
            </Select>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Tooltip title="Muat Ulang Data">
              <IconButton size="small" onClick={fetchBanners} disabled={loading}>
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

      {/* Content Rendering */}
      {loading ? (
        <Box style={{ display: 'grid', placeItems: 'center', minHeight: 360 }}>
          <Stack spacing={1.5} alignItems="center">
            <CircularProgress size={36} />
            <Typography variant="body2" color="text.secondary">
              Memuat daftar banner...
            </Typography>
          </Stack>
        </Box>
      ) : filteredBanners.length === 0 ? (
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
            <IconSpeakerphone size={30} />
          </Box>
          <Typography variant="h4" style={{ fontWeight: 800 }}>
            {banners.length === 0 ? 'Belum Ada Banner Terdaftar' : 'Banner Tidak Ditemukan'}
          </Typography>
          <Typography color="text.secondary" style={{ mt: 0.75, maxWidth: 500, mx: 'auto' }}>
            {banners.length === 0
              ? 'Mulai buat banner promosi diskon, pengumuman tes bahasa, atau webinar kursus.'
              : 'Tidak ada banner yang cocok dengan kriteria filter yang Anda gunakan.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size={17} />}
            onClick={handleOpenCreate}
            style={{ mt: 2.5, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            Tambah Banner Baru
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <Grid container spacing={3}>
          {filteredBanners.map((banner) => {
            const imgSrc = banner.image_url ? resolveImageUrl(banner.image_url) : '';
            return (
              <Grid size={{ xs: 12, md: 6, xl: 4 }} key={banner.id}>
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
                  {/* Banner Image Preview */}
                  <Box
                    style={{
                      position: 'relative',
                      height: 185,
                      bgcolor: 'grey.100',
                      overflow: 'hidden'
                    }}
                  >
                    {imgSrc ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={banner.title}
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
                          color: 'text.disabled'
                        }}
                      >
                        <IconPhoto size={40} stroke={1.5} />
                        <Typography variant="caption" color="text.disabled" style={{ mt: 0.5 }}>
                          Tanpa Gambar
                        </Typography>
                      </Box>
                    )}

                    {/* Category Chip */}
                    <Chip
                      size="small"
                      label={categoryLabels[banner.category] || banner.category}
                      color={categoryBadgeColor[banner.category] || 'default'}
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor: 'rgba(255, 255, 255, 0.95)'
                      }}
                    />

                    {/* Status Chip */}
                    <Chip
                      size="small"
                      label={banner.is_active ? 'Aktif Tayang' : 'Disembunyikan'}
                      color={banner.is_active ? 'success' : 'default'}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: banner.is_active ? undefined : 'rgba(255, 255, 255, 0.92)'
                      }}
                    />
                  </Box>

                  {/* Body Content */}
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
                      {banner.title}
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
                      {banner.description || 'Belum ada deskripsi banner.'}
                    </Typography>

                    {banner.link_url && (
                      <Typography
                        variant="caption"
                        style={{
                          mt: 1.5,
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontWeight: 600
                        }}
                      >
                        <IconExternalLink size={14} /> Link: {banner.link_url}
                      </Typography>
                    )}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      style={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title={banner.is_active ? 'Nonaktifkan banner' : 'Aktifkan banner'}>
                          <Switch
                            size="small"
                            checked={Boolean(banner.is_active)}
                            onChange={() => handleToggleActive(banner)}
                            color="success"
                          />
                        </Tooltip>
                        <Typography
                          variant="caption"
                          style={{
                            fontWeight: 700,
                            color: banner.is_active ? 'success.main' : 'text.disabled'
                          }}
                        >
                          {banner.is_active ? 'Live' : 'Draf'}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.75}>
                        <Tooltip title="Lihat Pratinjau Lengkap">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/marketing/banners/${banner.id}`)}
                            style={{ bgcolor: '#E1EFFA', color: '#198BCC', '&:hover': { bgcolor: '#cce5f7' } }}
                          >
                            <IconEye size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Banner">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/marketing/banners/${banner.id}/edit`)}
                            style={{ bgcolor: '#E1EFFA', color: '#2757A4', '&:hover': { bgcolor: '#cce5f7' } }}
                          >
                            <IconEdit size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Banner">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(banner)}
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
        /* Table View */
        <Card variant="outlined" style={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead style={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell style={{ fontWeight: 800, width: 140 }}>Gambar</TableCell>
                  <TableCell style={{ fontWeight: 800 }}>Judul & Deskripsi</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 160 }}>Kategori</TableCell>
                  <TableCell style={{ fontWeight: 800 }}>Tautan Link</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 130 }}>Status</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 130, textAlign: 'center' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBanners.map((banner) => (
                  <TableRow key={banner.id} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={resolveImageUrl(banner.image_url, 'https://placehold.co/120x80?text=No+Banner')}
                        alt={banner.title}
                        style={{
                          width: 120,
                          height: 72,
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
                        {banner.title}
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
                        {banner.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={categoryLabels[banner.category] || banner.category}
                        color={categoryBadgeColor[banner.category] || 'default'}
                        style={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" style={{ color: 'text.secondary' }}>
                        {banner.link_url || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Switch
                          size="small"
                          checked={Boolean(banner.is_active)}
                          onChange={() => handleToggleActive(banner)}
                          color="success"
                        />
                        <Typography
                          variant="caption"
                          style={{
                            fontWeight: 700,
                            color: banner.is_active ? 'success.main' : 'text.disabled'
                          }}
                        >
                          {banner.is_active ? 'Tayang' : 'Draf'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Detail Banner">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => navigate(`/marketing/banners/${banner.id}`)}
                          >
                            <IconEye size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Banner">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/marketing/banners/${banner.id}/edit`)}
                          >
                            <IconEdit size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Banner">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(banner)}
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

      {/* Modal Tambah Banner Baru */}
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
            <IconSpeakerphone size={22} />
          </Box>
          <Box>
            <Typography variant="h4" style={{ fontWeight: 800 }}>
              Tambah Banner Promo Baru
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Buat promosi atau pengumuman penting untuk pengunjung landing page.
            </Typography>
          </Box>
        </DialogTitle>

        <form onSubmit={handleCreateSubmit}>
          <DialogContent style={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack spacing={3}>
              {/* Live Preview Card inside Modal */}
              <Card variant="outlined" style={{ borderRadius: 2.5, p: 2 }}>
                <BannerLivePreview
                  title={newBanner.title}
                  category={newBanner.category}
                  description={newBanner.description}
                  linkUrl={newBanner.link_url}
                  imageUrl={newBanner.image_url}
                  imageFile={newImageFile}
                  isActive={newBanner.is_active}
                />
              </Card>

              {/* Section 01: Identitas & Kategori */}
              <MarketingSectionCard
                number="01"
                title="Informasi & Kategori Banner"
                description="Tentukan judul utama dan jenis banner yang ditampilkan."
              >
                <TextField
                  fullWidth
                  required
                  label="Judul Banner / Pengumuman"
                  placeholder="Contoh: Diskon Early Bird Pendaftaran Semester Gasal"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCursorText size={18} />
                      </InputAdornment>
                    )
                  }}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Kategori Banner</InputLabel>
                      <Select
                        value={newBanner.category}
                        label="Kategori Banner"
                        onChange={(e) => setNewBanner({ ...newBanner, category: e.target.value })}
                        startAdornment={
                          <InputAdornment position="start">
                            <IconTag size={18} />
                          </InputAdornment>
                        }
                      >
                        {BANNER_CATEGORIES.map((cat) => (
                          <MenuItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Tautan URL Aksi (Link)"
                      placeholder="/schedules atau https://..."
                      value={newBanner.link_url}
                      onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconExternalLink size={18} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
              </MarketingSectionCard>

              {/* Section 02: Pesan */}
              <MarketingSectionCard
                number="02"
                title="Pesan & Deskripsi Banner"
                description="Tulis informasi lengkap yang menarik perhatian calon peserta."
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={3.5}
                  label="Deskripsi Lengkap"
                  placeholder="Jelaskan detail penawaran promo, syarat & ketentuan, jadwal pelaksanaan, atau info kursus..."
                  value={newBanner.description}
                  onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                />
              </MarketingSectionCard>

              {/* Section 03: Visual & Publikasi */}
              <MarketingSectionCard
                number="03"
                title="Gambar Banner & Publikasi"
                description="Pilih grafis ilustrasi banner dan atur status tayangnya."
              >
                <MarketingImageUpload
                  label="Gambar Banner"
                  helperText="Rasio 4:3 atau banner landscape (minimal 800 x 600 px). File maksimal 5MB."
                  imageUrl={newBanner.image_url}
                  imageFile={newImageFile}
                  onFileChange={(file) => setNewImageFile(file)}
                  onUrlChange={(url) => setNewBanner({ ...newBanner, image_url: url })}
                  onClear={() => {
                    setNewImageFile(null);
                    setNewBanner({ ...newBanner, image_url: '' });
                  }}
                />

                <MarketingStatusCard
                  checked={newBanner.is_active}
                  onChange={(checked) => setNewBanner({ ...newBanner, is_active: checked })}
                  activeLabel="Tayangkan Banner Segera"
                  inactiveLabel="Simpan Sebagai Draf"
                  activeDesc="Banner akan langsung tampil di beranda landing page."
                  inactiveDesc="Banner disimpan sementara waktu dan tidak terlihat publik."
                />
              </MarketingSectionCard>
            </Stack>
          </DialogContent>

          <MarketingActionFooter
            onCancel={() => setCreateOpen(false)}
            saveText="Simpan & Tambahkan Banner"
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
        <DialogTitle style={{ fontWeight: 800 }}>Hapus Banner Ini?</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus banner &quot;<strong>{deleteTarget?.title}</strong>&quot;? Tindakan ini
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
