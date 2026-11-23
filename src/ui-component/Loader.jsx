export default function Loader() {
  return (
    <div className="fixed inset-x-0 top-0 z-[1301] h-1 overflow-hidden bg-blue-100" role="progressbar" aria-label="Memuat">
      <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] bg-blue-600" />
    </div>
  );
}
