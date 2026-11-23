import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

export default function MarketingHeader({
  title,
  subtitle,
  icon: Icon,
  badge = 'Marketing & Konten',
  backUrl,
  backText = 'Kembali',
  actions,
  stats = [],
  gradient = 'linear-gradient(135deg, #18386E 0%, #204F97 45%, #198BCC 100%)',
  className = ''
}) {
  const navigate = useNavigate();

  return (
    <header
      className={`relative mb-6 overflow-hidden rounded-3xl p-6 text-white shadow-xl sm:p-8 ${className}`}
      style={{ background: gradient }}
    >
      <div className="pointer-events-none absolute -right-20 -top-32 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(0,174,234,0.2)_0%,rgba(0,174,234,0)_70%)]" />
      <div className="pointer-events-none absolute -bottom-36 left-[30%] size-80 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_70%)]" />
      {backUrl && (
        <Button
          variant="ghost"
          size="sm"
          className="relative z-10 mb-4 border border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
          onClick={() => navigate(backUrl)}
        >
          <IconArrowLeft size={16} />
          {backText}
        </Button>
      )}
      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            {Icon && (
              <span className="grid size-9 place-items-center rounded-lg border border-white/20 bg-white/15 backdrop-blur">
                <Icon size={19} />
              </span>
            )}
            {badge && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-wider backdrop-blur">
                <span className="size-1.5 rounded-full bg-[#F6DB00] shadow-[0_0_8px_rgba(246,219,0,0.8)]" />
                {badge}
              </span>
            )}
          </div>
          <h1 className="text-[1.65rem] font-extrabold leading-tight tracking-tight sm:text-[2.15rem]">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-[0.925rem]">{subtitle}</p>}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {stats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="min-w-[85px] rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-center backdrop-blur">
                  <p className="text-xl font-extrabold leading-tight">{stat.value}</p>
                  <p className="text-xs text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
          {actions}
        </div>
      </div>
    </header>
  );
}
