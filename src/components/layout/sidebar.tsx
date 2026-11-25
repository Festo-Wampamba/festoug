"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChatBubbleIcon, ChevronDownIcon, EnvelopeClosedIcon, FileTextIcon, GlobeIcon, MobileIcon } from "@radix-ui/react-icons";

const EMAIL_HREF = "mailto:festotechug@gmail.com";
const WHATSAPP_HREF = "https://wa.me/256754230525";
const RESUME_HREF = "/festoug.pdf";

// The full profile introduces Festo on Home. Inner pages are about the work,
// so they get a slim contact bar and the content takes the full width.
export function Sidebar() {
  return usePathname() === "/" ? <ProfileCard /> : <ContactBar />;
}

function ProfileCard() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const onChange = (event: MediaQueryListEvent) => { if (event.matches) setExpanded(false); };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <aside aria-label="About Festo" className="profile-card glass min-w-0 self-start rounded-2xl border p-5 sm:p-6 xl:sticky xl:top-32">
      <div className="profile-summary flex items-center gap-3 sm:gap-4 xl:block">
        <figure className="profile-photo size-16 shrink-0 sm:size-[76px] xl:mb-6 xl:aspect-square xl:h-auto xl:w-full">
          <Image src="/images/festo03.png" alt="Festo Wampamba wearing a navy jacket" width={250} height={250} sizes="(min-width: 1536px) 300px, (min-width: 1280px) 280px, 76px" priority className="size-full rounded-xl object-cover" />
        </figure>
        <div className="profile-copy min-w-0 flex-1">
          {/* Below 1280px the header already shows the name and role, so the card leads with the summary. */}
          <p className="profile-name hidden break-words text-xl font-semibold tracking-tight text-foreground xl:block">Festo Wampamba</p>
          <p className="profile-role mt-1 hidden text-sm text-muted-foreground xl:block">Software engineer</p>
          <p className="text-sm leading-relaxed text-muted-foreground xl:mt-3">Web applications, backend systems, and the infrastructure behind them.</p>
        </div>
        <button type="button" aria-label={expanded ? "Hide contact details" : "Show contact details"} aria-expanded={expanded} aria-controls="profile-contacts" onClick={() => setExpanded(value => !value)} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70 xl:hidden"><ChevronDownIcon className={`size-5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} aria-hidden /></button>
      </div>
      <div id="profile-contacts" className={`${expanded ? "block" : "hidden"} mt-6 border-t border-border pt-5 xl:block`}>
        <ul className="space-y-3">
          <ContactItem icon={<EnvelopeClosedIcon />} title="Email" href={EMAIL_HREF} value={<>festotechug@<wbr />gmail.com</>} />
          <ContactItem icon={<MobileIcon />} title="Phone" href="tel:+256754230525" value="+256 754230525" />
          <ContactItem icon={<ChatBubbleIcon />} title="WhatsApp" href={WHATSAPP_HREF} value="Chat on WhatsApp" />
          <ContactItem icon={<FileTextIcon />} title="Resume" href={RESUME_HREF} value="Download resume" download />
          <ContactItem icon={<GlobeIcon />} title="Location" href="https://www.google.com/maps/place/Bugoloobi,+Kampala/@0.3124645,32.6133872,15z" value="Bugolobi, Kampala, Uganda" target="_blank" rel="noopener noreferrer" />
        </ul>
      </div>
    </aside>
  );
}

function ContactBar() {
  return (
    <aside aria-label="Contact Festo" data-variant="compact" className="profile-card glass flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-3 sm:gap-4 sm:px-5">
      <Image src="/images/festo03.png" alt="" width={80} height={80} sizes="40px" className="size-10 shrink-0 rounded-full object-cover" />
      <p className="min-w-0 flex-1 text-sm leading-snug text-muted-foreground">Have a project in mind? <span className="text-foreground">Get in touch.</span></p>
      <ul className="flex shrink-0 items-center gap-2">
        <BarLink href={EMAIL_HREF} label="Email" icon={<EnvelopeClosedIcon />} />
        <BarLink href={WHATSAPP_HREF} label="WhatsApp" icon={<ChatBubbleIcon />} target="_blank" rel="noopener noreferrer" />
        <BarLink href={RESUME_HREF} label="Resume" icon={<FileTextIcon />} download />
      </ul>
    </aside>
  );
}

function BarLink({ icon, label, ...link }: { icon: ReactNode; label: string; href: string; download?: boolean; target?: string; rel?: string }) {
  // Icon-only on phones; the label stays in the accessible name at every size.
  return <li><a {...link} className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-border bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70 [&_svg]:size-[18px]"><span aria-hidden>{icon}</span><span className="sr-only md:not-sr-only">{label}</span></a></li>;
}

function ContactItem({ icon, title, value, ...link }: { icon: ReactNode; title: string; value: ReactNode; href: string; download?: boolean; target?: string; rel?: string }) {
  return <li><a {...link} className="group flex min-h-12 items-start gap-3 rounded-lg py-1 text-sm transition-colors hover:text-primary"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground [&>svg]:size-[18px]" aria-hidden>{icon}</span><span className="min-w-0 pt-0.5"><span className="block text-xs font-medium uppercase tracking-[.08em] text-muted-foreground">{title}</span><span className="mt-0.5 block break-words text-base leading-relaxed text-foreground group-hover:text-primary">{value}</span></span></a></li>;
}
