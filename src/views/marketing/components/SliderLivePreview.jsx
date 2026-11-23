import { IconArrowRight, IconPhoto } from '@tabler/icons-react';
import { resolveImageUrl } from '../../../api/apiClient';

export default function SliderLivePreview({
  title = 'Judul Slider Utama',
  subtitle = 'Subjudul atau penjelasan singkat program yang menarik minat calon peserta.',
  ctaText = 'Daftar Sekarang',
  imageUrl = '',
  imageFile = null,
  isActive = true,
  sortOrder = 1
}) {
  const previewImg = imageFile ? URL.createObjectURL(imageFile) : imageUrl ? resolveImageUrl(imageUrl) : '';

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Pratinjau Live di Landing Page</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[0.7rem] font-bold text-slate-600">
            Urutan #{sortOrder || 1}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[0.7rem] font-bold ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
            Status: {isActive ? 'Tayang' : 'Draf'}
          </span>
        </div>
      </div>
      <section className="relative flex min-h-[260px] items-center overflow-hidden rounded-2xl border border-slate-200 bg-[#0d1f42] shadow-[0_12px_36px_rgba(39,87,164,0.22)] sm:min-h-[320px] md:min-h-[360px]">
        {previewImg ? (
          <img src={previewImg} alt={title} className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(135deg,#1a3a6e_0%,#0d1f42_100%)] text-white/40">
            <IconPhoto size={54} stroke={1.5} />
            <span className="mt-2 text-xs text-white/50">Belum ada gambar slider dipilih</span>
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(27,56,100,0.92)_0%,rgba(27,56,100,0.65)_60%,rgba(27,56,100,0.3)_100%)] md:bg-[linear-gradient(to_right,rgba(27,56,100,0.92)_0%,rgba(27,56,100,0.75)_50%,rgba(27,56,100,0.2)_100%)]" />
        <div className="relative z-10 max-w-2xl p-6 text-white sm:p-8 md:p-12">
          <span className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            LBI FIB UI Hero Promo
          </span>
          <h3 className="text-2xl font-extrabold leading-tight drop-shadow-lg sm:text-3xl md:text-4xl">
            {title || 'Judul Slider Utama'}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/85 drop-shadow sm:text-base">
            {subtitle || 'Subjudul atau penjelasan singkat program yang menarik minat calon peserta.'}
          </p>
          {ctaText && (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-[#F6DB00] px-5 py-2.5 font-extrabold text-[#2757A4] shadow-lg transition hover:bg-[#ffe900]"
              >
                {ctaText} <IconArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
