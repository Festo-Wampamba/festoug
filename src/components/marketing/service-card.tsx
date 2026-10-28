import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CodeIcon,
  DesktopIcon,
  LayersIcon,
  StackIcon,
} from "@radix-ui/react-icons";

interface ServiceCardProps {
  title: string;
  icon: string;
  description: string;
  index?: number;
}

type ServiceIcon = typeof CodeIcon;

// Map seeded icon image paths to a small, consistent Radix icon set.
// The image fallback remains for any future icon path not in this map.
const ICON_MAP: Record<string, ServiceIcon> = {
  "icon-dev": CodeIcon,
  "icon-dm": DesktopIcon,
  "icon-design": LayersIcon,
  "icon-db": StackIcon,
};

function resolveIcon(icon: string): ServiceIcon | null {
  const key = Object.keys(ICON_MAP).find((k) => icon.includes(k));
  return key ? ICON_MAP[key] : null;
}

export function ServiceCard({ title, icon, description, index = 0 }: ServiceCardProps) {
  const ServiceIcon = resolveIcon(icon);

  return (
    <div
      className={`service-card service-card-delay-${index}
        group relative grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-2xl border border-border bg-card p-5
        transition-[transform,box-shadow,border-color] duration-300 ease-out
        hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm motion-reduce:hover:translate-y-0`}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground ring-1 ring-border transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
      >
        {ServiceIcon ? (
          // ServiceIcon is a stable component reference resolved from a module-scope map
          // eslint-disable-next-line react-hooks/static-components
          <ServiceIcon className="h-5 w-5" aria-hidden />
        ) : (
          <Image src={icon} alt="" width={24} height={24} className="object-contain" aria-hidden />
        )}
      </div>

      <h4 className="min-w-0 text-base font-semibold leading-snug text-card-foreground font-head">
        {title}
      </h4>

      <p className="col-span-2 border-t border-border pt-3 text-base font-normal leading-relaxed text-muted-foreground">
        {description}
      </p>

      <Link
        href="/services"
        className="col-span-2 inline-flex min-h-11 items-center gap-2 justify-self-start rounded-sm text-sm font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
        aria-label={`Learn more about ${title}`}
      >
        Learn more
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" aria-hidden />
      </Link>
    </div>
  );
}
