interface Props {
  title: string;
  value: number;
  subtitle?: string;
  color?: string;
}

export default function StatCard({ title, value, subtitle, color = "text-white" }: Props) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <h3 className="text-neutral-500 font-mono text-xs uppercase tracking-widest mb-4">{title}</h3>
      <div className="flex items-end gap-3">
        <span className={`text-5xl md:text-6xl font-black tracking-tighter ${color}`}>{value}</span>
        {subtitle && <span className="text-xs text-neutral-500 font-mono pb-2 uppercase">{subtitle}</span>}
      </div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-neutral-600/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-neutral-600/50" />
    </div>
  );
}
