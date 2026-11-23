import { useEffect, useRef, useState } from 'react';
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconBlockquote,
  IconLink,
  IconClearFormatting,
  IconPhoto
} from '@tabler/icons-react';
import { marketingApi } from '../api/marketingApi';

const actions = [
  { label: 'Judul 1', command: 'formatBlock', value: 'h1' },
  { label: 'Judul 2', command: 'formatBlock', value: 'h2' },
  { label: 'Judul 3', command: 'formatBlock', value: 'h3' },
  { label: 'Tebal', command: 'bold', icon: IconBold },
  { label: 'Miring', command: 'italic', icon: IconItalic },
  { label: 'Bullet list', command: 'insertUnorderedList', icon: IconList },
  { label: 'Numbered list', command: 'insertOrderedList', icon: IconListNumbers },
  { label: 'Quote', command: 'formatBlock', value: 'blockquote', icon: IconBlockquote },
  { label: 'Sisipkan link', command: 'createLink', icon: IconLink },
  { label: 'Hapus format', command: 'removeFormat', icon: IconClearFormatting }
];

export default function RichTextEditor({ value = '', onChange, label = 'Isi Konten', minHeight = 320 }) {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const selectedImageRef = useRef(null);
  const savedRangeRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value || '';
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) savedRangeRef.current = selection.getRangeAt(0);
  };

  const restoreSelection = () => {
    if (!savedRangeRef.current) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedRangeRef.current);
  };

  const runCommand = (command, commandValue) => {
    editorRef.current?.focus();
    if (command === 'createLink') {
      const url = window.prompt('Masukkan URL link');
      if (!url) return;
      document.execCommand(command, false, url);
    } else {
      document.execCommand(command, false, commandValue || null);
    }
    onChange?.(editorRef.current?.innerHTML || '');
  };

  const adjustFontSize = (step) => {
    editorRef.current?.focus();
    restoreSelection();
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current?.contains(selection.anchorNode)) return;
    const range = selection.getRangeAt(0);
    const target =
      range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentElement
        : range.commonAncestorContainer;
    const nextSize = Math.min(48, Math.max(10, (parseFloat(window.getComputedStyle(target).fontSize) || 16) + step));
    if (range.collapsed) {
      const block = target.closest('p, h1, h2, h3, li, blockquote') || target;
      block.style.fontSize = `${nextSize}px`;
    } else {
      const wrapper = document.createElement('span');
      wrapper.style.fontSize = `${nextSize}px`;
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
      selection.removeAllRanges();
      const nextRange = document.createRange();
      nextRange.selectNodeContents(wrapper);
      selection.addRange(nextRange);
    }
    onChange?.(editorRef.current?.innerHTML || '');
  };

  const insertImage = (url) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand('insertImage', false, url);
    const images = editorRef.current?.querySelectorAll('img');
    const insertedImage = images?.[images.length - 1];
    if (insertedImage) {
      Object.assign(insertedImage.style, { width: '100%', maxWidth: '100%', height: 'auto', display: 'block', margin: '16px 0' });
      insertedImage.alt = 'Gambar konten';
      selectedImageRef.current = insertedImage;
    }
    onChange?.(editorRef.current?.innerHTML || '');
  };

  const handleImagePick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingImage(true);
    try {
      const response = await marketingApi.uploadContentImage(file);
      if (!response?.data?.url) throw new Error(response?.message || 'Upload gambar gagal.');
      insertImage(`${import.meta.env.VITE_STORAGE_BASE_URL || 'http://127.0.0.1:8000'}${response.data.url}`);
    } catch (error) {
      window.alert(error.message || 'Gambar tidak dapat diunggah.');
    } finally {
      setUploadingImage(false);
    }
  };

  const resizeSelectedImage = () => {
    const image = selectedImageRef.current;
    if (!image) return window.alert('Klik gambar di editor terlebih dahulu.');
    const width = window.prompt('Masukkan lebar gambar, contoh: 60%, 480px, atau auto', image.style.width || '100%');
    if (!width) return;
    if (!/^(auto|\d+(\.\d+)?(px|%|rem|em|vw)?)$/.test(width.trim()))
      return window.alert('Ukuran tidak valid. Gunakan contoh 60%, 480px, atau auto.');
    image.style.width = width.trim();
    image.style.maxWidth = '100%';
    onChange?.(editorRef.current?.innerHTML || '');
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      {label && <div className="border-b border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">{label}</div>}
      <div
        role="toolbar"
        aria-label="Format konten"
        className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2"
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              title={action.label}
              aria-label={action.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runCommand(action.command, action.value)}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded px-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {Icon ? <Icon size={17} /> : action.label}
            </button>
          );
        })}
        <span className="mx-1 h-6 border-l border-slate-300" />
        <button
          type="button"
          title="Perkecil ukuran font"
          onMouseDown={(event) => {
            event.preventDefault();
            saveSelection();
          }}
          onClick={() => adjustFontSize(-2)}
          className="h-8 rounded px-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
        >
          A-
        </button>
        <button
          type="button"
          title="Perbesar ukuran font"
          onMouseDown={(event) => {
            event.preventDefault();
            saveSelection();
          }}
          onClick={() => adjustFontSize(2)}
          className="h-8 rounded px-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
        >
          A+
        </button>
        <span className="mx-1 h-6 border-l border-slate-300" />
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <button
          type="button"
          title="Sisipkan foto"
          aria-label="Sisipkan foto"
          disabled={uploadingImage}
          onMouseDown={(event) => {
            event.preventDefault();
            saveSelection();
          }}
          onClick={() => imageInputRef.current?.click()}
          className="inline-flex h-8 items-center gap-1 rounded px-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
        >
          <IconPhoto size={17} />
          {uploadingImage ? 'Mengunggah…' : 'Foto'}
        </button>
        <button
          type="button"
          onClick={resizeSelectedImage}
          className="h-8 rounded px-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          Ukuran foto
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange?.(event.currentTarget.innerHTML)}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onClick={(event) => {
          if (event.target instanceof HTMLImageElement) selectedImageRef.current = event.target;
          saveSelection();
        }}
        style={{ minHeight }}
        className="prose prose-slate max-w-none overflow-y-auto px-4 py-3 text-sm focus:outline-none"
        aria-label={label}
      />
    </div>
  );
}
