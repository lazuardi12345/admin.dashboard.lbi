export default function Footer() {
  return (
    <footer className="mt-auto flex flex-col gap-1 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>&copy; {new Date().getFullYear()} LBI FIB UI. Semua hak dilindungi.</span>
      <span>Marketing &amp; Content Console</span>
    </footer>
  );
}
