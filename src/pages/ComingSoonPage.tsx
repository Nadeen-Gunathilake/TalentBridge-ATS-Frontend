export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="mx-auto mt-16 max-w-sm text-center">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Not built yet — coming in a later step.</p>
    </div>
  );
}
