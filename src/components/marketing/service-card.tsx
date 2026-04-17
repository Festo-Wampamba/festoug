import Image from "next/image";

interface ServiceCardProps {
  title: string;
  icon: string;
  description: string;
  index?: number;
}

const ACCENTS = [
  {
    iconBg:      "bg-orange-yellow-crayola/10",
    iconRing:    "ring-orange-yellow-crayola/30",
    numColor:    "text-orange-yellow-crayola/20",
    barColor:    "bg-orange-yellow-crayola",
    borderHover: "hover:border-orange-yellow-crayola/40",
    glow:        "hover:shadow-[0_8px_32px_rgba(202,165,93,0.13)]",
    leftBar:     "before:bg-orange-yellow-crayola",
    divider:     "bg-orange-yellow-crayola",
  },
  {
    iconBg:      "bg-red-400/10",
    iconRing:    "ring-red-400/30",
    numColor:    "text-red-400/20",
    barColor:    "bg-red-400",
    borderHover: "hover:border-red-400/40",
    glow:        "hover:shadow-[0_8px_32px_rgba(248,113,113,0.13)]",
    leftBar:     "before:bg-red-400",
    divider:     "bg-red-400",
  },
  {
    iconBg:      "bg-cyan-400/10",
    iconRing:    "ring-cyan-400/30",
    numColor:    "text-cyan-400/20",
    barColor:    "bg-cyan-400",
    borderHover: "hover:border-cyan-400/40",
    glow:        "hover:shadow-[0_8px_32px_rgba(34,211,238,0.13)]",
    leftBar:     "before:bg-cyan-400",
    divider:     "bg-cyan-400",
  },
  {
    iconBg:      "bg-green-400/10",
    iconRing:    "ring-green-400/30",
    numColor:    "text-green-400/20",
    barColor:    "bg-green-400",
    borderHover: "hover:border-green-400/40",
    glow:        "hover:shadow-[0_8px_32px_rgba(74,222,128,0.13)]",
    leftBar:     "before:bg-green-400",
    divider:     "bg-green-400",
  },
];

export function ServiceCard({ title, icon, description, index = 0 }: ServiceCardProps) {
  const accent = ACCENTS[index % ACCENTS.length];
  const num    = String(index + 1).padStart(2, "0");

  return (
    <div
      className={`service-card service-card-delay-${index}
        group relative flex gap-4 rounded-2xl p-5 bg-eerie-black-1
        border border-jet overflow-hidden
        transition-all duration-300 hover:-translate-y-1.5
        before:absolute before:left-0 before:top-0 before:h-full before:w-[3px]
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        ${accent.leftBar} ${accent.borderHover} ${accent.glow}`}
    >
      {/* Muted background number */}
      <span className={`absolute top-3 right-4 text-5xl font-black select-none leading-none tabular-nums ${accent.numColor}`} aria-hidden>
        {num}
      </span>

      {/* Icon */}
      <div className={`shrink-0 w-12 h-12 rounded-xl ${accent.iconBg} ring-1 ${accent.iconRing}
        flex items-center justify-center
        transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        <Image src={icon} alt={title} width={26} height={26} className="object-contain" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-white-2 text-sm font-bold uppercase tracking-wider mb-2 leading-snug">
          {title}
        </h4>

        {/* Divider */}
        <div className={`h-px w-full ${accent.divider} opacity-20 mb-2.5`} />

        <p className="text-light-gray text-sm font-light leading-relaxed">
          {description}
        </p>

        {/* Bottom sweep bar — scales in on hover via Tailwind group-hover */}
        <div className={`mt-4 h-px origin-left scale-x-0 group-hover:scale-x-100
          transition-transform duration-500 ease-out
          ${accent.barColor} opacity-50`}
        />
      </div>
    </div>
  );
}
