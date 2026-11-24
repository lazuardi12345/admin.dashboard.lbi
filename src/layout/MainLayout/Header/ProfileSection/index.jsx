import { useState } from 'react';
import { IconHome, IconLogout, IconUser } from '@tabler/icons-react';
import { useAuth } from 'contexts/AuthContext';
import { PUBLIC_APP_URL } from 'api/apiClient';

export default function ProfileSection() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';
  const roleLabel = user?.role?.replaceAll('_', ' ').toUpperCase() || 'ADMIN';

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    window.location.replace(PUBLIC_APP_URL);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Buka menu profil"
        aria-controls="account-menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex size-10 items-center justify-center rounded-full border border-slate-200 bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        {userInitial}
      </button>
      {open && (
        <section
          id="account-menu"
          className="absolute right-0 top-12 z-[1300] w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center gap-3 p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-700 font-bold text-white">
              {userInitial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{user?.name || 'Pengguna'}</p>
              <p className="truncate text-sm text-slate-500">{user?.email || '-'}</p>
              <p className="mt-1 text-xs font-bold text-blue-700">{roleLabel}</p>
            </div>
          </div>
          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setProfileOpen(true);
              }}
              className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <IconUser size={18} />
              Profil
            </button>
            <a
              href={PUBLIC_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <IconHome size={18} />
              Halaman Utama
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <IconLogout size={18} />
              Logout
            </button>
          </div>
        </section>
      )}
      {profileOpen && (
        <div
          className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setProfileOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
            className="w-full max-w-sm rounded-xl bg-white shadow-2xl"
          >
            <header className="border-b border-slate-100 px-5 py-4">
              <h2 id="profile-title" className="text-lg font-semibold">
                Profil Akun
              </h2>
            </header>
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-blue-700 text-lg font-bold text-white">
                  {userInitial}
                </span>
                <div className="min-w-0">
                  <p className="break-words font-semibold text-slate-900">{user?.name || 'Pengguna'}</p>
                  <p className="break-all text-sm text-slate-500">{user?.email || '-'}</p>
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-slate-500">Role</p>
                <p className="mt-1 text-sm font-bold text-blue-800">{roleLabel}</p>
              </div>
            </div>
            <footer className="flex justify-end border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Tutup
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
