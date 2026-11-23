export default function UpgradePlanCard() {
  return (
    <section className="relative my-4 overflow-hidden rounded-xl bg-amber-100 p-4">
      <div className="pointer-events-none absolute -right-20 top-16 size-48 rounded-full border-[19px] border-amber-500/30" />
      <div className="relative space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Upgrade your plan</h2>
        <p className="text-sm text-slate-700/70">70% discount for 1 year subscriptions.</p>
        <a
          href="https://links.codedthemes.com/hsqll"
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Go Premium
        </a>
      </div>
    </section>
  );
}
