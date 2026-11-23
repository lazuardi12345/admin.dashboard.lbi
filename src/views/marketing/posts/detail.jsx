import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Avatar,
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
  Divider,
  Stack,
  Typography
} from '../components/MarketingUi';
import {
  IconArrowLeft,
  IconArticle,
  IconCalendar,
  IconClock,
  IconEdit,
  IconExternalLink,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { marketingApi } from '../../../api/marketingApi';
import { PUBLIC_APP_URL, resolveImageUrl } from '../../../api/apiClient';
import MarketingHeader from '../components/MarketingHeader';

export default function MarketingPostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    marketingApi
      .getPost(postId)
      .then(setPost)
      .catch((requestError) => setError(requestError.message || 'Gagal mengambil detail artikel.'))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await marketingApi.deletePost(postId);
      navigate('/marketing/posts');
    } catch (err) {
      setError(err.message || 'Gagal menghapus artikel.');
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
            Memuat artikel...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box style={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" style={{ mb: 2.5 }}>
          {error || 'Artikel tidak ditemukan.'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={17} />}
          onClick={() => navigate('/marketing/posts')}
        >
          Kembali ke Daftar Artikel
        </Button>
      </Box>
    );
  }

  // Calculate estimated reading time
  const wordCount = (post.body || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const publicUrl = post.slug ? `${PUBLIC_APP_URL}/posts/${post.slug}` : '';

  return (
    <Box style={{ p: { xs: 2, md: 3, xl: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <MarketingHeader
        title={post.title || 'Detail Artikel'}
        subtitle="Pratinjau konten artikel blog, tampilan pembaca, dan status publikasinya."
        icon={IconArticle}
        badge="Detail Artikel"
        backUrl="/marketing/posts"
        backText="Kembali ke Daftar Artikel"
        actions={
          <Stack direction="row" spacing={1.25}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<IconEdit size={17} />}
              onClick={() => navigate(`/marketing/posts/${post.id}/edit`)}
              style={{ fontWeight: 700, borderRadius: 2, px: 2.5, textTransform: 'none' }}
            >
              Edit Artikel
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

      <Card variant="outlined" style={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        {/* Cover Photo Banner */}
        {post.featured_image && (
          <Box
            style={{
              position: 'relative',
              height: { xs: 220, sm: 320, md: 400 },
              bgcolor: '#0f172a',
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src={resolveImageUrl(post.featured_image)}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(27, 56, 100, 0.75) 0%, transparent 60%)'
              }}
            />
            <Stack
              direction="row"
              spacing={1}
              style={{ position: 'absolute', bottom: 20, left: { xs: 20, md: 32 } }}
            >
              <Chip
                label={post.category || 'Umum'}
                style={{
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  color: '#2757A4',
                  fontWeight: 800
                }}
              />
              <Chip
                label={post.is_published ? 'Published' : 'Draft'}
                color={post.is_published ? 'success' : 'default'}
                style={{
                  fontWeight: 700,
                  bgcolor: post.is_published ? undefined : 'rgba(255, 255, 255, 0.9)'
                }}
              />
            </Stack>
          </Box>
        )}

        <CardContent style={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
          {/* Metadata Bar */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            style={{ mb: 3, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar style={{ width: 34, height: 34, bgcolor: 'primary.50', color: 'primary.main', fontSize: 14 }}>
                  <IconUser size={18} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" style={{ fontWeight: 700 }}>
                    {post.author?.name || 'Staff Marketing'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Penulis Konten
                  </Typography>
                </Box>
              </Stack>

              <Divider orientation="vertical" flexItem style={{ height: 24, alignSelf: 'center' }} />

              <Stack direction="row" spacing={0.75} alignItems="center" style={{ color: 'text.secondary' }}>
                <IconClock size={16} />
                <Typography variant="caption" style={{ fontWeight: 600 }}>
                  Ã‚Â± {readTime} menit baca
                </Typography>
              </Stack>

              {post.created_at && (
                <Stack direction="row" spacing={0.75} alignItems="center" style={{ color: 'text.secondary' }}>
                  <IconCalendar size={16} />
                  <Typography variant="caption" style={{ fontWeight: 600 }}>
                    {new Date(post.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                </Stack>
              )}
            </Stack>

            {publicUrl && (
              <Button
                variant="outlined"
                size="small"
                component="a"
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<IconExternalLink size={15} />}
                style={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Lihat di Web Publik
              </Button>
            )}
          </Stack>

          {/* Title */}
          <Typography
            variant="h1"
            style={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.6rem' },
              lineHeight: 1.25,
              mb: 2.5
            }}
          >
            {post.title}
          </Typography>

          {/* Summary Callout Box */}
          {post.summary && (
            <Box
              style={{
                p: 2.5,
                mb: 4,
                borderRadius: 2.5,
                bgcolor: 'primary.50',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                color: 'text.primary'
              }}
            >
              <Typography variant="subtitle1" style={{ fontStyle: 'italic', lineHeight: 1.7, fontWeight: 500 }}>
                &ldquo;{post.summary}&rdquo;
              </Typography>
            </Box>
          )}

          {/* Article Body HTML */}
          <Box
            style={{
              typography: 'body1',
              fontSize: '1.05rem',
              lineHeight: 1.85,
              color: 'text.primary',
              '& h1, & h2, & h3, & h4': {
                color: '#2757A4',
                fontWeight: 800,
                mt: 4,
                mb: 1.5,
                lineHeight: 1.3
              },
              '& h1': { fontSize: '1.85rem' },
              '& h2': { fontSize: '1.5rem' },
              '& h3': { fontSize: '1.25rem' },
              '& p': { mb: 2.5 },
              '& ul, & ol': { pl: 3.5, mb: 2.5 },
              '& li': { mb: 1 },
              '& blockquote': {
                borderLeft: '4px solid #198BCC',
                pl: 2.5,
                my: 3,
                fontStyle: 'italic',
                color: 'text.secondary',
                bgcolor: 'grey.50',
                py: 1.5,
                borderRadius: '0 8px 8px 0'
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 2,
                my: 2.5,
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
              },
              '& a': {
                color: 'primary.main',
                fontWeight: 600,
                textDecoration: 'underline'
              }
            }}
            dangerouslySetInnerHTML={{
              __html: post.body || '<p><em>Belum ada konten artikel lengkap.</em></p>'
            }}
          />

          {/* Slug Footer */}
          {post.slug && (
            <Box style={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Slug Tautan URL:
              </Typography>
              <Typography variant="body2" style={{ fontWeight: 600, color: 'primary.main', mt: 0.25 }}>
                /posts/{post.slug}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => !deleting && setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ fontWeight: 800 }}>Hapus Artikel Ini?</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin menghapus artikel &quot;<strong>{post.title}</strong>&quot;? Tindakan ini tidak dapat
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
            {deleting ? 'Menghapus...' : 'Ya, Hapus Artikel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
