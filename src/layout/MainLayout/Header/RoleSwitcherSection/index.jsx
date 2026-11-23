import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronDown, IconEye, IconLock, IconUserCheck } from '@tabler/icons-react';
import { useAuth, AVAILABLE_ROLES } from '../../../../contexts/AuthContext';

const roleLabels = {
  marketing: 'Marketing',
  content_writer: 'Content Writer',
  administrator: 'Administrator',
  finance: 'Finance',
  admin_ppb: 'Admin PPB',
  admin_bipa: 'Admin BIPA',
  admin_ppp: 'Admin PPP',
  student: 'Student'
};

export default function RoleSwitcherSection() {
  const { role, realRole, switchRole, user, roleLocked } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const canSwitchRole = !roleLocked;
  const isPreviewMode = Boolean(realRole && role && role !== realRole);
  const activeRole = roleLabels[role] || role || 'Unknown';

  const selectRole = (roleKey) => {
    switchRole(roleKey);
    setOpen(false);
    navigate(
      roleKey === 'marketing' || roleKey === 'content_writer'
        ? '/marketing/dashboard'
        : roleKey === 'finance'
          ? '/finance/payments'
          : '/dashboard/default'
    );
  };

  return (
    <div className="relative ml-2">
      {isPreviewMode && (
        <IconEye
          aria-label={`Preview sebagai ${role}; role asli ${realRole}`}
          size={18}
          className="absolute -left-6 top-2 text-amber-600"
        />
      )}
      {roleLocked && <IconLock aria-label="Role dikunci" size={16} className="absolute -left-5 top-2 text-slate-400" />}
      <button
        type="button"
        disabled={!canSwitchRole}
        onClick={() => setOpen(!open)}
        title={roleLocked ? 'Role Anda dikunci oleh sistem' : 'Switch role (RBAC Preview)'}
        aria-expanded={open}
        className={`inline-flex h-9 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-800 shadow-sm disabled:cursor-default ${isPreviewMode ? 'border-dashed border-2' : ''}`}
      >
        <IconUserCheck size={16} />
        {isPreviewMode ? `Preview: ${activeRole}` : `Role: ${activeRole}`}
        {canSwitchRole && <IconChevronDown size={15} />}
      </button>
      {open && canSwitchRole && (
        <section className="absolute right-0 top-11 z-[1300] w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <header className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold">Pilih Role Dashboard (RBAC)</h2>
            <p className="mt-1 text-xs text-slate-500">
              User: {user?.name || 'Staff'} · Role Asli: <strong>{realRole?.toUpperCase() || '—'}</strong>
            </p>
          </header>
          <div className="max-h-80 overflow-y-auto p-1">
            {AVAILABLE_ROLES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => selectRole(option.id)}
                className={`block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-50 ${role === option.id ? 'bg-blue-50' : ''}`}
              >
                <span className="flex items-center justify-between text-sm font-medium">
                  {option.label}
                  {realRole === option.id && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">Asli</span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
