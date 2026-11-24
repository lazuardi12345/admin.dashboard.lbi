import lbiLogo from '../assets/lbi-logo.png';
import './AdminEntrySplash.css';

export default function AdminEntrySplash() {
  return (
    <main className="admin-entry-splash" role="status" aria-label="Menyiapkan dashboard admin">
      <div className="admin-entry-splash__glow admin-entry-splash__glow--one" />
      <div className="admin-entry-splash__glow admin-entry-splash__glow--two" />

      <section className="admin-entry-splash__content">
        <div className="admin-entry-splash__logo-frame">
          <span className="admin-entry-splash__orbit admin-entry-splash__orbit--outer" />
          <span className="admin-entry-splash__orbit admin-entry-splash__orbit--inner" />
          <img src={lbiLogo} alt="Lembaga Bahasa Internasional FIB UI" />
        </div>

        <p className="admin-entry-splash__eyebrow">Lembaga Bahasa Internasional FIB UI</p>
        <h1>Selamat Datang</h1>
        <p className="admin-entry-splash__message">Menyiapkan ruang kerja Anda</p>
        <div className="admin-entry-splash__progress" aria-hidden="true">
          <span />
        </div>
      </section>
    </main>
  );
}
