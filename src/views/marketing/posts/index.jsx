// src/views/marketing/posts/index.jsx
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
  IconArticle,
  IconClock,
  IconCursorText,
  IconEdit,
  IconEye,
  IconLayoutGrid,
  IconLink,
  IconList,
  IconPhoto,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTag,
  IconTrash,
} from '@tabler/icons-react';

import { marketingApi } from '../../../api/marketingApi';
import { resolveImageUrl } from '../../../api/apiClient';
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

export default function MarketingPosts() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    category: 'Tips & Panduan',
    summary: '',
    body: '',
    is_published: true,
    featured_image: ''
  });
  const [newImageFile, setNewImageFile] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await marketingApi.getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal mengambil data artikel dari server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setNewPost({
      title: '',
      slug: '',
      category: 'Tips & Panduan',
      summary: '',
      body: '',
      is_published: true,
      featured_image: ''
    });
    setNewImageFile(null);
    setCreateOpen(true);
  };

  const handleNewTitleChange = (val) => {
    const slugified = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setNewPost((prev) => ({
      ...prev,
      title: val,
      slug: slugified
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim()) {
      setFeedback({ type: 'error', message: 'Judul artikel wajib diisi.' });
      return;
    }

    setCreating(true);
    try {
      const payload = new FormData();
      payload.append('title', newPost.title.trim());
      if (newPost.slug) payload.append('slug', newPost.slug.trim());
      payload.append('category', newPost.category || 'Tips & Panduan');
      payload.append('summary', newPost.summary || '');
      payload.append('body', newPost.body || '');
      payload.append('is_published', newPost.is_published ? 1 : 0);

      if (newImageFile) {
        payload.append('image_file', newImageFile);
      } else if (newPost.featured_image) {
        payload.append('featured_image', newPost.featured_image);
      }

      await marketingApi.createPost(payload);
      setFeedback({ type: 'success', message: 'Artikel baru berhasil diterbitkan!' });
      setCreateOpen(false);
      fetchPosts();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.data?.message || err.message || 'Terjadi kesalahan saat menyimpan artikel.'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      const payload = new FormData();
      payload.append('title', post.title);
      payload.append('is_published', post.is_published ? 0 : 1);
      await marketingApi.updatePost(post.id, payload);

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, is_published: !post.is_published } : p))
      );
      setFeedback({ type: 'success', message: `Status publikasi artikel diperbarui!` });
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memperbarui status publikasi artikel.' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await marketingApi.deletePost(deleteTarget.id);
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setFeedback({ type: 'success', message: 'Artikel berhasil dihapus.' });
    } catch {
      setFeedback({ type: 'error', message: 'Gagal menghapus artikel.' });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Extract unique categories
  const allCategories = ['all', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  // Filters
  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.summary?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q);

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
        ? Boolean(p.is_published)
        : !p.is_published;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const publishedCount = posts.filter((p) => p.is_published).length;
  const draftCount = posts.length - publishedCount;

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <MarketingHeader
        title="Artikel & Berita Blog"
        subtitle="Tulis, kelola panduan belajar, serta publikasikan rilis resmi kegiatan kursus LBI FIB UI."
        icon={IconArticle}
        badge="Blog & Publikasi"
        stats={[
          { label: 'Total Artikel', value: posts.length },
          { label: 'Published', value: publishedCount },
          { label: 'Draft', value: draftCount }
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
            Tulis Artikel Baru
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

      {/* Category Pills */}
      {allCategories.length > 1 && (
        <Stack direction="row" spacing={1} style={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          {allCategories.map((cat) => {
            const count = cat === 'all' ? posts.length : posts.filter((p) => p.category === cat).length;
            const label = cat === 'all' ? 'Semua Kategori' : cat;
            const isSelected = selectedCategory === cat;
            return (
              <Chip
                key={cat}
                label={`${label} (${count})`}
                onClick={() => setSelectedCategory(cat)}
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
      )}

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
              placeholder="Cari judul artikel, ringkasan, atau kategori..."
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
              <MenuItem value="published">Published ({publishedCount})</MenuItem>
              <MenuItem value="draft">Draft ({draftCount})</MenuItem>
            </Select>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Tooltip title="Muat Ulang Data">
              <IconButton size="small" onClick={fetchPosts} disabled={loading}>
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
              Memuat artikel blog...
            </Typography>
          </Stack>
        </Box>
      ) : filteredPosts.length === 0 ? (
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
            <IconArticle size={30} />
          </Box>
          <Typography variant="h4" style={{ fontWeight: 800 }}>
            {posts.length === 0 ? 'Belum Ada Artikel Ditulis' : 'Artikel Tidak Ditemukan'}
          </Typography>
          <Typography color="text.secondary" style={{ mt: 0.75, maxWidth: 500, mx: 'auto' }}>
            {posts.length === 0
              ? 'Bagikan tips belajar bahasa, panduan sertifikasi, atau berita kegiatan LBI FIB UI.'
              : 'Tidak ada artikel yang cocok dengan filter pencarian saat ini.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size={17} />}
            onClick={handleOpenCreate}
            style={{ mt: 2.5, fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
          >
            Tulis Artikel Baru
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <Grid container spacing={3}>
          {filteredPosts.map((post) => {
            const imgSrc = post.featured_image ? resolveImageUrl(post.featured_image) : '';
            const words = (post.body || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
            const readTime = Math.max(1, Math.ceil(words / 200));

            return (
              <Grid size={{ xs: 12, md: 6, xl: 4 }} key={post.id}>
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
                  {/* Article Thumbnail */}
                  <Box
                    style={{
                      position: 'relative',
                      height: 190,
                      bgcolor: 'grey.100',
                      overflow: 'hidden'
                    }}
                  >
                    {imgSrc ? (
                      <Box
                        component="img"
                        src={imgSrc}
                        alt={post.title}
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
                        <IconPhoto size={42} stroke={1.5} />
                        <Typography variant="caption" color="text.disabled" style={{ mt: 0.5 }}>
                          Foto Sampul
                        </Typography>
                      </Box>
                    )}

                    <Chip
                      size="small"
                      label={post.category || 'Umum'}
                      color="primary"
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor: 'rgba(255, 255, 255, 0.95)'
                      }}
                    />

                    <Chip
                      size="small"
                      label={post.is_published ? 'Published' : 'Draft'}
                      color={post.is_published ? 'success' : 'default'}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor: post.is_published ? undefined : 'rgba(255, 255, 255, 0.9)'
                      }}
                    />
                  </Box>

                  {/* Card Content */}
                  <CardContent style={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} alignItems="center" style={{ mb: 1, color: 'text.secondary' }}>
                      <IconClock size={15} />
                      <Typography variant="caption" style={{ fontWeight: 600 }}>
                        {readTime} menit baca
                      </Typography>
                      <Box style={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                      <Typography variant="caption" noWrap style={{ maxWidth: 160 }}>
                        {post.author?.name || 'Staff Marketing'}
                      </Typography>
                    </Stack>

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
                      {post.title}
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
                      {post.summary || (post.body ? post.body.replace(/<[^>]*>/g, '').slice(0, 110) + '...' : '-')}
                    </Typography>

                    {post.slug && (
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
                        <IconLink size={14} /> /posts/{post.slug}
                      </Typography>
                    )}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      style={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
                    >
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Tooltip title={post.is_published ? 'Ubah ke draf' : 'Publikasikan sekarang'}>
                          <Switch
                            size="small"
                            checked={Boolean(post.is_published)}
                            onChange={() => handleTogglePublish(post)}
                            color="success"
                          />
                        </Tooltip>
                        <Typography
                          variant="caption"
                          style={{
                            fontWeight: 700,
                            color: post.is_published ? 'success.main' : 'text.disabled'
                          }}
                        >
                          {post.is_published ? 'Live' : 'Draf'}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.75}>
                        <Tooltip title="Baca Artikel">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/marketing/posts/${post.id}`)}
                            style={{ bgcolor: '#E1EFFA', color: '#198BCC', '&:hover': { bgcolor: '#cce5f7' } }}
                          >
                            <IconEye size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Artikel">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/marketing/posts/${post.id}/edit`)}
                            style={{ bgcolor: '#E1EFFA', color: '#2757A4', '&:hover': { bgcolor: '#cce5f7' } }}
                          >
                            <IconEdit size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Artikel">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(post)}
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
                  <TableCell style={{ fontWeight: 800, width: 120 }}>Sampul</TableCell>
                  <TableCell style={{ fontWeight: 800 }}>Judul & Ringkasan</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 160 }}>Kategori</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 140 }}>Penulis</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 130 }}>Status</TableCell>
                  <TableCell style={{ fontWeight: 800, width: 130, textAlign: 'center' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={resolveImageUrl(post.featured_image, 'https://placehold.co/100x70?text=Artikel')}
                        alt={post.title}
                        style={{
                          width: 100,
                          height: 65,
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
                        {post.title}
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
                        {post.summary || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={post.category || 'Umum'}
                        color="primary"
                        variant="outlined"
                        style={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" style={{ fontWeight: 600 }}>
                        {post.author?.name || 'Staff Marketing'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Switch
                          size="small"
                          checked={Boolean(post.is_published)}
                          onChange={() => handleTogglePublish(post)}
                          color="success"
                        />
                        <Typography
                          variant="caption"
                          style={{
                            fontWeight: 700,
                            color: post.is_published ? 'success.main' : 'text.disabled'
                          }}
                        >
                          {post.is_published ? 'Published' : 'Draft'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Baca Artikel">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => navigate(`/marketing/posts/${post.id}`)}
                          >
                            <IconEye size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Artikel">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/marketing/posts/${post.id}/edit`)}
                          >
                            <IconEdit size={17} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Artikel">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(post)}
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

      {/* Modal Tulis Artikel Baru */}
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
            <IconArticle size={22} />
          </Box>
          <Box>
            <Typography variant="h4" style={{ fontWeight: 800 }}>
              Tulis Artikel Baru
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Publikasikan tulisan edukatif, tips belajar bahasa, atau siaran pers LBI FIB UI.
            </Typography>
          </Box>
        </DialogTitle>

        <form onSubmit={handleCreateSubmit}>
          <DialogContent style={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack spacing={3}>
              {/* Section 01: Identitas */}
              <MarketingSectionCard
                number="01"
                title="Judul & Kategori Artikel"
                description="Judul yang menarik akan meningkatkan minat baca calon peserta."
              >
                <TextField
                  fullWidth
                  required
                  label="Judul Artikel"
                  placeholder="Contoh: Rahasia Menguasai Percakapan Bahasa Jepang Sehari-hari"
                  value={newPost.title}
                  onChange={(e) => handleNewTitleChange(e.target.value)}
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
                    <TextField
                      fullWidth
                      label="Slug URL (Otomatis)"
                      value={newPost.slug}
                      onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <IconLink size={18} />
                          </InputAdornment>
                        )
                      }}
                      helperText="Tautan: /posts/[slug]"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Kategori Artikel"
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
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

                <Box>
                  <Typography variant="caption" color="text.secondary" style={{ display: 'block', mb: 1, fontWeight: 600 }}>
                    Saran Kategori Cepat:
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {CATEGORY_SUGGESTIONS.map((cat) => (
                      <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        clickable
                        color={newPost.category === cat ? 'primary' : 'default'}
                        variant={newPost.category === cat ? 'filled' : 'outlined'}
                        onClick={() => setNewPost({ ...newPost, category: cat })}
                        style={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    ))}
                  </Stack>
                </Box>
              </MarketingSectionCard>

              {/* Section 02: Ringkasan & Foto Sampul */}
              <MarketingSectionCard
                number="02"
                title="Ringkasan & Foto Sampul"
                description="Pengantar singkat dan foto sampul utama untuk kartu artikel."
              >
                <TextField
                  fullWidth
                  multiline
                  minRows={2.5}
                  label="Ringkasan Singkat (Summary)"
                  placeholder="Pengantar 1-2 kalimat untuk preview di beranda..."
                  value={newPost.summary}
                  onChange={(e) => setNewPost({ ...newPost, summary: e.target.value })}
                />

                <MarketingImageUpload
                  label="Foto Sampul Artikel (Featured Image)"
                  helperText="Rasio 16:9 disarankan (minimal 1200 x 675 px). Maksimal 5MB."
                  imageUrl={newPost.featured_image}
                  imageFile={newImageFile}
                  onFileChange={(file) => setNewImageFile(file)}
                  onUrlChange={(url) => setNewPost({ ...newPost, featured_image: url })}
                  onClear={() => {
                    setNewImageFile(null);
                    setNewPost({ ...newPost, featured_image: '' });
                  }}
                />
              </MarketingSectionCard>

              {/* Section 03: Editor Lengkap */}
              <MarketingSectionCard
                number="03"
                title="Isi Naskah Lengkap"
                description="Tulis konten dengan heading, paragraf, daftar bullet, dan kutipan."
              >
                <RichTextEditor
                  label="Tulis artikel lengkap di sini..."
                  value={newPost.body}
                  onChange={(body) => setNewPost((current) => ({ ...current, body }))}
                />
              </MarketingSectionCard>

              {/* Section 04: Publikasi */}
              <MarketingSectionCard
                number="04"
                title="Pengaturan Publikasi"
                description="Tentukan apakah artikel langsung diterbitkan sekarang."
              >
                <MarketingStatusCard
                  checked={newPost.is_published}
                  onChange={(checked) => setNewPost({ ...newPost, is_published: checked })}
                  activeLabel="Publikasikan Artikel Sekarang"
                  inactiveLabel="Simpan Sebagai Draf"
                  activeDesc="Artikel akan langsung tayang di blog dan dapat diakses pembaca."
                  inactiveDesc="Artikel disimpan sebagai draf sementara waktu."
                />
              </MarketingSectionCard>
            </Stack>
          </DialogContent>

          <MarketingActionFooter
            onCancel={() => setCreateOpen(false)}
            saveText="Terbitkan Artikel"
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
        <DialogTitle style={{ fontWeight: 800 }}>Hapus Artikel Ini?</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus artikel &quot;<strong>{deleteTarget?.title}</strong>&quot;? Tindakan ini
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
