import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconBook, IconCreditCard, IconDashboard, IconHome2, IconMenu2, IconX } from '@tabler/icons-react';
import Logo from 'ui-component/Logo';

const links = [
  { title: 'Home', href: '#', icon: IconHome2 },
  { title: 'Dashboard', to: '/login', icon: IconDashboard },
  { title: 'Documentation', href: 'https://codedthemes.gitbook.io/berry', icon: IconBook },
  { title: 'Purchase Now', href: 'https://links.codedthemes.com/hsqll', icon: IconCreditCard }
];

export default function AppBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link to="/" className="mr-auto">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-4 sm:flex">
          {links.map(({ title, href, to }) =>
            to ? (
              <Link key={title} to={to} target="_blank" className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {title}
              </Link>
            ) : (
              <a
                key={title}
                href={href}
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {title}
              </a>
            )
          )}
        </nav>
        <button
          type="button"
          aria-label={drawerOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="inline-flex size-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 sm:hidden"
        >
          {drawerOpen ? <IconX /> : <IconMenu2 />}
        </button>
      </div>
      {drawerOpen && (
        <nav className="border-t border-slate-100 px-4 py-2 sm:hidden">
          {links.map(({ title, href, to, icon: Icon }) =>
            to ? (
              <Link
                key={title}
                to={to}
                target="_blank"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-slate-100"
              >
                <Icon size={18} />
                {title}
              </Link>
            ) : (
              <a
                key={title}
                href={href}
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-700 hover:bg-slate-100"
              >
                <Icon size={18} />
                {title}
              </a>
            )
          )}
        </nav>
      )}
    </header>
  );
}
