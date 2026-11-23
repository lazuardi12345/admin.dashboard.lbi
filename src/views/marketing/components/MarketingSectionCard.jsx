export default function MarketingSectionCard({ number, icon: Icon, title, description, action, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-[#198BCC] hover:shadow-md ${className}`}>
      <header className="border-b border-[#d0e8f7] bg-[linear-gradient(135deg,#E1EFFA_0%,#f0f7fe_100%)] px-5 py-5 md:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {number && <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#2757A4] text-[13px] font-extrabold text-white shadow-md">{number}</span>}
            {Icon && !number && <span className="grid size-[34px] shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon size={19} /></span>}
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
              {description && <p className="mt-1 text-[0.825rem] text-slate-500">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </header>
      <div className="space-y-5 p-5 md:p-8">{children}</div>
    </section>
  );
}
