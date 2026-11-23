import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconArticle,
  IconArrowRight,
  IconBook2,
  IconBuildingStore,
  IconPlus,
  IconSlideshow,
  IconSpeakerphone,
  IconSparkles
} from '@tabler/icons-react';
import { Alert } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { marketingApi } from '../../../api/marketingApi';
import { resolveImageUrl } from '../../../api/apiClient';
import MarketingHeader from '../components/MarketingHeader';

export default function MarketingDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sliders, setSliders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [posts, setPosts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [error, setError] = useState(null);

  const loadAllMarketingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sliderRes, bannerRes, postRes, partnerRes] = await Promise.all([
        marketingApi.getSliders(),
        marketingApi.getBanners(),
        marketingApi.getPosts(),
        marketingApi.getPartners()
      ]);
      setSliders(Array.isArray(sliderRes) ? sliderRes : []);
      setBanners(Array.isArray(bannerRes) ? bannerRes : []);
      setPosts(Array.isArray(postRes) ? postRes : []);
      setPartners(Array.isArray(partnerRes) ? partnerRes : []);
    } catch (loadError) {
      console.error('Error loading marketing overview:', loadError);
      setError('Gagal memuat sebagian data overview marketing. Coba muat ulang halaman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMarketingData();
  }, []);

  const statCards = [
    { title: 'Hero Sliders', count: sliders.length, activeCount: sliders.filter((item) => item.is_active).length, activeLabel: 'tayang', subtitle: 'Tampil di header muka website', icon: IconSlideshow, color: '#2757A4', path: '/marketing/sliders' },
    { title: 'Banner Promo & Info', count: banners.length, activeCount: banners.filter((item) => item.is_active).length, activeLabel: 'tayang', subtitle: 'Pengumuman dan promosi kursus', icon: IconSpeakerphone, color: '#198BCC', path: '/marketing/banners' },
    { title: 'Artikel & Blog', count: posts.length, activeCount: posts.filter((item) => item.is_published).length, activeLabel: 'terbit', subtitle: 'Edukasi dan siaran resmi LBI', icon: IconArticle, color: '#00AEEA', path: '/marketing/posts' },
    { title: 'Mitra & Klien', count: partners.length, activeCount: partners.length, activeLabel: 'terdaftar', subtitle: 'Kerjasama instansi & kedutaan', icon: IconBuildingStore, color: '#d48806', path: '/marketing/partners' }
  ];
  const totalActiveContent = sliders.filter((item) => item.is_active).length
    + banners.filter((item) => item.is_active).length
    + posts.filter((item) => item.is_published).length;
  const totalRecords = sliders.length + banners.length + posts.length + partners.length;

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6 xl:p-8">
      <MarketingHeader
        title="Marketing & Konten Overview"
        subtitle="Pusat kendali materi promosi visual, banner pengumuman, blog edukasi, dan katalog program LBI FIB UI."
        icon={IconSparkles}
        badge="Marketing Hub"
        stats={[
          { label: 'Konten Tayang', value: totalActiveContent },
          { label: 'Total Rekaman', value: totalRecords }
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className="border border-white bg-white font-bold text-[#18386E] shadow-md hover:border-[#F6DB00] hover:bg-[#F6DB00]" onClick={() => navigate('/marketing/posts')}>
              <IconPlus size={18} />Tulis Artikel
            </Button>
            <Button variant="outline" className="border-white/40 bg-white/10 font-bold text-white backdrop-blur hover:bg-white/20 hover:text-white" onClick={() => navigate('/marketing/catalogs')}>
              <IconBook2 size={18} />Course Catalog
            </Button>
          </div>
        }
      />

      {error && <Alert variant="warning"><span>{error}</span><button type="button" className="ml-auto" aria-label="Tutup notifikasi" onClick={() => setError(null)}>×</button></Alert>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-lg" style={{ borderColor: `${card.color}33` }}>
              <div className="mb-3 flex items-start justify-between">
                <h2 className="text-sm font-bold text-slate-500">{card.title}</h2>
                <span className="grid size-10 place-items-center rounded-lg" style={{ color: card.color, backgroundColor: `${card.color}1A` }}><Icon size={20} /></span>
              </div>
              {loading ? <div className="h-9 w-16 animate-pulse rounded bg-slate-200" /> : <p className="text-3xl font-extrabold leading-none text-slate-950">{card.count}</p>}
              <p className="mb-4 mt-2 min-h-5 text-xs text-slate-500">{loading ? <span className="inline-block h-3 w-28 animate-pulse rounded bg-slate-200" /> : `${card.activeCount} ${card.activeLabel} · ${card.subtitle}`}</p>
              <div className="border-t border-slate-200 pt-3">
                <Button variant="ghost" size="sm" className="px-0" style={{ color: card.color }} onClick={() => navigate(card.path)}>Kelola {card.title}<IconArrowRight size={15} /></Button>
              </div>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ContentPreview
          title="Slider Landing Page"
          loading={loading}
          items={sliders.slice(0, 4)}
          onViewAll={() => navigate('/marketing/sliders')}
          onItemClick={(item) => navigate(`/marketing/sliders/${item.id}`)}
          empty={{
            icon: IconSlideshow,
            title: 'Belum ada slider',
            description: 'Slider pertama akan muncul di header utama landing page.',
            actionLabel: 'Tambah Slider'
          }}
          image={(item) => item.image_url}
          imageFallback="https://placehold.co/80x50?text=Slider"
          titleForItem={(item) => item.title}
          subtitleForItem={(item) => item.subtitle || '-'}
          isActive={(item) => item.is_active}
        />
        <ContentPreview
          title="Artikel & Berita Terbaru"
          loading={loading}
          items={posts.slice(0, 4)}
          onViewAll={() => navigate('/marketing/posts')}
          onItemClick={(item) => navigate(`/marketing/posts/${item.id}`)}
          empty={{
            icon: IconArticle,
            title: 'Belum ada artikel',
            description: 'Mulai publikasikan tips belajar dan berita resmi LBI FIB UI.',
            actionLabel: 'Tulis Artikel'
          }}
          image={(item) => item.featured_image}
          imageFallback="https://placehold.co/80x50?text=Artikel"
          titleForItem={(item) => item.title}
          subtitleForItem={(item) => `${item.category || 'Umum'} · ${item.author?.name || 'Staff Marketing'}`}
          isActive={(item) => item.is_published}
        />
      </section>
    </main>
  );
}

function ContentPreview({ title, loading, items, onViewAll, onItemClick, empty, image, imageFallback, titleForItem, subtitleForItem, isActive }) {
  const EmptyIcon = empty.icon;
  return (
    <Card className="h-full p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
        <Button variant="ghost" size="sm" onClick={onViewAll}>Lihat Semua</Button>
      </div>
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-[68px] animate-pulse rounded-lg bg-slate-100" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-blue-50 text-blue-700"><EmptyIcon size={22} /></span>
          <h3 className="font-bold text-slate-900">{empty.title}</h3>
          <p className="mx-auto mb-4 mt-1 max-w-xs text-sm text-slate-500">{empty.description}</p>
          <Button size="sm" variant="outline" onClick={onViewAll}>{empty.actionLabel}</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => onItemClick(item)} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50">
              <img src={resolveImageUrl(image(item), imageFallback)} alt={titleForItem(item) || ''} className="h-[50px] w-20 shrink-0 rounded-md object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-slate-900">{titleForItem(item)}</span>
                <span className="block truncate text-xs text-slate-500">{subtitleForItem(item)}</span>
              </span>
              <Badge variant={isActive(item) ? 'success' : 'outline'} className="shrink-0">{isActive(item) ? 'Live' : 'Draf'}</Badge>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
