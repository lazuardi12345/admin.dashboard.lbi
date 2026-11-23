import { IconBrandTelegram, IconBuildingStore, IconMailbox, IconPhoto } from '@tabler/icons-react';
import User1 from 'assets/images/users/user-round.svg';

const notifications = [
  { title: 'John Doe', message: 'It is a long established fact that a reader will be distracted', icon: null, tags: ['Unread', 'New'] },
  { title: 'Store Verification Done', message: 'We have successfully received your request.', icon: IconBuildingStore, tags: ['Unread'] },
  {
    title: 'Check Your Mail.',
    message: 'All done! Now check your inbox as you are in for a sweet treat!',
    icon: IconMailbox,
    action: true
  },
  { title: 'John Doe', message: 'Uploaded two file on 21 Jan 2020', icon: IconPhoto, file: 'demo.jpg' },
  { title: 'John Doe', message: 'It is a long established fact that a reader will be distracted', tags: ['Confirmation of Account.'] }
];

export default function NotificationList() {
  return (
    <ul className="divide-y divide-slate-100">
      {notifications.map(({ title, message, icon: Icon, tags, file, action }, index) => (
        <li key={`${title}-${index}`} className="p-4 transition hover:bg-slate-50">
          <div className="flex items-start gap-3">
            {Icon ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <Icon size={20} />
              </span>
            ) : (
              <img src={User1} alt="" className="size-10 shrink-0 rounded-full" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900">{title}</p>
                <time className="shrink-0 text-[11px] text-slate-400">2 min ago</time>
              </div>
              <p className="mt-1 text-sm text-slate-600">{message}</p>
              {file && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm">
                  <IconPhoto size={17} />
                  {file}
                </div>
              )}
              {action && (
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-2 rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800"
                >
                  <IconBrandTelegram size={16} />
                  Mail
                </button>
              )}
              {tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
