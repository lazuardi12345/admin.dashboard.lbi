import { useState } from 'react';
import { IconBell } from '@tabler/icons-react';
import NotificationList from './NotificationList';

export default function NotificationSection() {
  const [filter, setFilter] = useState('all');

  return (
    <details className="group relative">
      <summary
        aria-label="Notifikasi"
        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg text-slate-600 transition hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <IconBell size={20} stroke={1.7} />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-amber-500 ring-2 ring-white" />
      </summary>
      <section className="absolute right-0 top-12 z-[1300] w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-900">All Notification</h2>
            <button type="button" className="text-xs font-medium text-blue-700 hover:underline">
              Mark as all read
            </button>
          </div>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">01</span>
        </header>
        <div className="px-4 pt-3">
          <select
            aria-label="Filter notifications"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
          >
            <option value="all">All Notification</option>
            <option value="new">New</option>
            <option value="unread">Unread</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto">
          <NotificationList />
        </div>
        <button
          type="button"
          className="block w-full border-t border-slate-100 px-4 py-3 text-center text-sm font-medium text-blue-700 hover:bg-slate-50"
        >
          View All
        </button>
      </section>
    </details>
  );
}
