import { IconExternalLink, IconPhoto, IconSpeakerphone } from '@tabler/icons-react';
import { resolveImageUrl } from '../../../api/apiClient';

const categoryLabels = {
  promo: 'Promo & Diskon',
  announcement: 'Pengumuman Resmi',
  info: 'Informasi Kursus',
  event: 'Event / Webinar'
};

const categoryColors = {
  promo: 'bg-[#E1EFFA] text-[#2757A4]',
  announcement: 'bg-amber-100 text-amber-800',
  info: 'bg-sky-100 text-sky-800',
  event: 'bg-purple-100 text-purple-800'
};

export default function BannerLivePreview({
  title = 'Judul Promo atau Pengumuman',
  category = 'promo',
  description = 'Penjelasan detail mengenai promo, pengumuman jadwal, atau event kursus terkini.',
  linkUrl = '/schedules',
  imageUrl = '',
  imageFile = null,
  isActive = true
}) {
  const previewImg = imageFile ? URL.createObjectURL(imageFile) : imageUrl ? resolveImageUrl(imageUrl) : '';
  const catStyle = categoryColors[category] || categoryColors.promo;

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Pratinjau Live Banner di Landing Page</p>
        <span className={`rounded-full px-2.5 py-1 text-[0.7rem] font-bold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
          Status: {isActive ? 'Tayang' : 'Draf'}
        </span>
      </div>
      <article className="flex min-h-[220px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(39,87,164,0.07)] md:flex-row">
        <div className="relative min-h-[180px] overflow-hidden bg-slate-100 md:w-2/5">
          {previewImg ? (
            <img src={previewImg} alt={title} className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[180px] flex-col items-center justify-center p-6 text-slate-400">
              <IconPhoto size={42} stroke={1.5} />
              <span className="mt-2 text-xs">Gambar Banner</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-7">
          <div className="mb-3">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-extrabold ${catStyle}`}>
              <IconSpeakerphone size={14} />
              {categoryLabels[category] || category}
            </span>
          </div>
          <h3 className="text-xl font-extrabold leading-snug text-slate-900 sm:text-2xl">
            {title || 'Judul Banner Belum Diisi'}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
            {description || 'Belum ada deskripsi banner.'}
          </p>
          {linkUrl && (
            <div className="mt-5 border-t border-slate-200 pt-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-[#2757A4] px-3 py-2 text-sm font-bold text-[#2757A4] transition hover:border-[#198BCC] hover:bg-[#E1EFFA]"
              >
                Lihat Selengkapnya ({linkUrl}) <IconExternalLink size={15} />
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
