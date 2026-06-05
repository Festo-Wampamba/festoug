import Image from "next/image";
import { Code2, Server, Network, HardDrive, type LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  icon: string;
  description: string;
  index?: number;
}

// Flowstep violetDark accent rotation: purple → green → violet → amber
const ACCENTS = [
  {
    iconText:    "text-orange-yellow-crayola",
    iconBg:      "bg-orange-yellow-crayola/12",
    iconRing:    "ring-orange-yellow-crayola/30",
    numColor:    "text-orange-yellow-crayola/20",
    barColor:    "bg-orange-yellow-crayola",
    borderHover: "hover:border-orange-yellow-crayola/40",
    glow:        "hover:shadow-[0_10px_40px_-8px_rgba(127,34,254,0.35)]",
    leftBar:     "before:bg-orange-yellow-crayola",
    divider:     "bg-orange-yellow-crayola",
  },
  {
    iconText:    "text-accent-2",
    iconBg:      "bg-accent-2/12",
    iconRing:    "ring-accent-2/30",
    numColor:    "text-accent-2/20",
    barColor:    "bg-accent-2",
    borderHover: "hover:border-accent-2/40",
    glow:        "hover:shadow-[0_10px_40px_-8px_rgba(16,185,129,0.32)]",
    leftBar:     "before:bg-accent-2",
    divider:     "bg-accent-2",
  },
  {
    iconText:    "text-accent-3",
    iconBg:      "bg-accent-3/12",
    iconRing:    "ring-accent-3/30",
    numColor:    "text-accent-3/20",
    barColor:    "bg-accent-3",
    borderHover: "hover:border-accent-3/40",
    glow:        "hover:shadow-[0_10px_40px_-8px_rgba(168,85,247,0.32)]",
    leftBar:     "before:bg-accent-3",
    divider:     "bg-accent-3",
  },
  {
    iconText:    "text-accent-4",
    iconBg:      "bg-accent-4/12",
    iconRing:    "ring-accent-4/30",
    numColor:    "text-accent-4/20",
    barColor:    "bg-accent-4",
    borderHover: "hover:border-accent-4/40",
    glow:        "hover:shadow-[0_10px_40px_-8px_rgba(245,158,11,0.32)]",
    leftBar:     "before:bg-accent-4",
    divider:     "bg-accent-4",
  },
];

// Map seeded icon image paths → Flowstep Lucide icons (fallback keeps the image)
const ICON_MAP: Record<string, LucideIcon> = {
  "icon-dev":    Code2,
  "icon-dm":     Server,
  "icon-design": Network,
  "icon-db":     HardDrive,
};

function resolveLucide(icon: string): LucideIcon | null {
  const key = Object.keys(ICON_MAP).find((k) => icon.includes(k));
  return key ? ICON_MAP[key] : null;
}

export function ServiceCard({ title, icon, description, index = 0 }: ServiceCardProps) {
  const accent = ACCENTS[index % ACCENTS.length];
  const num    = String(index + 1).padStart(2, "0");
  const Lucide = resolveLucide(icon);

  return (
    <div
      className={`service-card service-card-delay-${index} card-sheen
        group relative flex gap-4 rounded-2xl p-5 bg-eerie-black-1
        border border-jet overflow-hidden
        transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-1.5 motion-reduce:hover:translate-y-0
        before:absolute before:left-0 before:top-0 before:h-full before:w-[3px]
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        ${accent.leftBar} ${accent.borderHover} ${accent.glow}`}
    >
      {/* Muted background number */}
      <span className={`absolute top-3 right-3 text-4xl sm:text-5xl font-black select-none leading-none tabular-nums font-head ${accent.numColor}`} aria-hidden>
        {num}
      </span>

      {/* Icon badge — springy pop on hover */}
      <div className={`shrink-0 w-12 h-12 rounded-xl ${accent.iconBg} ${accent.iconText} ring-1 ${accent.iconRing}
        flex items-center justify-center icon-pop
        transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        group-hover:scale-110 group-hover:-rotate-6 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0`}
      >
        {Lucide ? (
          // Lucide is a stable component reference resolved from a module-scope map
          // eslint-disable-next-line react-hooks/static-components
          <Lucide className="w-[26px] h-[26px]" strokeWidth={1.9} aria-hidden />
        ) : (
          <Image src={icon} alt="" width={26} height={26} className="object-contain" aria-hidden />
        )}
      </div>

      {/* Content — pr-16 gives clearance from the absolute number */}
      <div className="flex-1 min-w-0 pt-0.5 pr-16">
        <h4 className="text-white-2 text-sm font-bold uppercase tracking-wider mb-2 leading-snug font-head">
          {title}
        </h4>

        {/* Divider */}
        <div className={`h-px w-full ${accent.divider} opacity-20 mb-2.5`} />

        <p className="text-light-gray text-sm font-light leading-relaxed">
          {description}
        </p>

        {/* Bottom sweep bar — scales in on hover */}
        <div className={`mt-4 h-px origin-left scale-x-0 group-hover:scale-x-100
          transition-transform duration-500 ease-out
          ${accent.barColor} opacity-50`}
        />
      </div>
    </div>
  );
}
