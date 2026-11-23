import { useEffect, useRef, useState } from 'react';
import { IconCamera, IconLink, IconTrash, IconUpload } from '@tabler/icons-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { resolveImageUrl } from '../../../api/apiClient';

export default function MarketingImageUpload({
  label = 'Gambar Konten',
  helperText = 'Rekomendasi ukuran: 1200 x 675 px (rasio 16:9). Maksimal 5 MB.',
  objectFit = 'cover',
  imageUrl = '',
  imageFile = null,
  onFileChange,
  onUrlChange,
  onClear,
  previewHeight = { xs: 180, sm: 260 }
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlField, setShowUrlField] = useState(Boolean(imageUrl && !imageFile));
  const [tempUrl, setTempUrl] = useState(imageUrl || '');
  const [localPreviewSrc, setLocalPreviewSrc] = useState('');

  useEffect(() => {
    if (!imageFile) {
      setLocalPreviewSrc('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setLocalPreviewSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const previewSrc = imageFile ? localPreviewSrc : imageUrl ? resolveImageUrl(imageUrl) : '';
  const previewSizeClass = typeof previewHeight === 'number'
    ? ''
    : previewHeight?.xs === 150 && previewHeight?.sm === 200
      ? 'h-[150px] sm:h-[200px]'
      : 'h-[180px] sm:h-[260px]';
  const previewStyle = typeof previewHeight === 'number'
    ? { height: `${previewHeight}px` }
    : undefined;

  const handleFileSelect = (file) => {
    if (file) onFileChange?.(file);
  };

  const handleUrlApply = () => {
    onUrlChange?.(tempUrl.trim());
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer?.files?.[0];
    handleFileSelect(file);
  };

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowUrlField((current) => !current)}>
          <IconLink size={15} />{showUrlField ? 'Sembunyikan URL' : 'Gunakan URL Gambar'}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.[0]) handleFileSelect(event.target.files[0]);
          event.target.value = '';
        }}
      />

      {previewSrc ? (
        <div
          className={`group relative flex overflow-hidden rounded-xl border-2 border-blue-200 bg-slate-100 shadow-md ${previewSizeClass}`}
          style={previewStyle}
        >
          <img
            src={previewSrc}
            alt="Preview"
            className={`h-full w-full ${objectFit === 'contain' ? 'p-4 object-contain' : 'object-cover'}`}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-blue-900/75 p-4 opacity-0 backdrop-blur-[3px] transition-opacity group-hover:opacity-100">
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" className="bg-white font-bold text-blue-900 hover:bg-slate-100" onClick={() => fileInputRef.current?.click()}><IconUpload size={16} />Ganti Gambar</Button>
              {onClear && <Button variant="destructive" size="sm" className="font-bold" onClick={() => { setTempUrl(''); onClear(); }}><IconTrash size={16} />Hapus</Button>}
            </div>
            <p className="text-center text-xs text-white/85">{imageFile ? `File baru: ${imageFile.name}` : 'Gambar aktif'}</p>
          </div>
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur ${imageFile ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
            {imageFile ? 'File Terpilih' : 'Gambar Aktif'}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onDragOver={(event) => { event.preventDefault(); event.stopPropagation(); setIsDragging(true); }}
          onDragLeave={(event) => { event.preventDefault(); event.stopPropagation(); setIsDragging(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${previewSizeClass} ${isDragging ? 'border-blue-700 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50'}`}
          style={previewStyle}
        >
          <span className="mb-3 grid size-[52px] place-items-center rounded-xl bg-blue-100 text-blue-800"><IconCamera size={26} /></span>
          <span className="font-bold text-slate-900">Klik untuk mengunggah atau seret file gambar ke sini</span>
          <span className="mt-1 text-xs text-slate-500">Format didukung: JPG, PNG, WEBP, SVG (Maks. 5MB)</span>
          <span className="mt-4 inline-flex h-8 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700"><IconUpload size={15} />Pilih dari Komputer</span>
        </button>
      )}

      {showUrlField && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 block text-xs font-bold text-slate-600">Atau tempelkan link URL gambar (CDN / hosting eksternal):</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="https://images.unsplash.com/... atau /storage/..." value={tempUrl} onChange={(event) => setTempUrl(event.target.value)} />
            <Button size="sm" className="shrink-0 px-5" onClick={handleUrlApply} disabled={!tempUrl.trim()}>Terapkan URL</Button>
          </div>
        </div>
      )}
      {helperText && <p className="mt-2 text-xs text-slate-500">{helperText}</p>}
    </section>
  );
}
