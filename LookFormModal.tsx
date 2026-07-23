export default function LookCardSkeleton() {
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-5 flex flex-col gap-2.5">
        <div className="h-3 w-20 rounded-full skeleton" />
        <div className="h-5 w-40 rounded-full skeleton" />
        <div className="h-3 w-full rounded-full skeleton" />
      </div>
    </div>
  );
}
