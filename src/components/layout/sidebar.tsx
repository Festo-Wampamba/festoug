"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { ChatBubbleIcon, ChevronDownIcon, EnvelopeClosedIcon, FileTextIcon, GlobeIcon, MobileIcon } from "@radix-ui/react-icons";

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const onChange = (event: MediaQueryListEvent) => { if (event.matches) setExpanded(false); };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <aside aria-label="About Festo" className="min-w-0 self-start rounded-2xl border border-border bg-card p-5 sm:p-6 xl:sticky xl:top-32">
      <div className="flex items-center gap-3 sm:gap-4 xl:block">
        <figure className="size-16 shrink-0 sm:size-[76px] xl:mb-6 xl:aspect-square xl:h-auto xl:w-full">
          <Image src="/images/festo03.png" alt="Festo Wampamba wearing a navy jacket" width={250} height={250} sizes="(min-width: 1536px) 300px, (min-width: 1280px) 280px, 76px" priority className="size-full rounded-xl object-cover" />
        </figure>
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-lg font-semibold tracking-tight text-foreground sm:text-xl">Festo Wampamba</h1>
          <p className="mt-1 text-sm text-muted-foreground">Software engineer</p>
          <p className="mt-3 hidden text-sm leading-relaxed text-muted-foreground xl:block">Web applications, backend systems, and the infrastructure behind them.</p>
        </div>
        <button type="button" aria-label={expanded ? "Hide contact details" : "Show contact details"} aria-expanded={expanded} aria-controls="profile-contacts" onClick={() => setExpanded(value => !value)} className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/70 xl:hidden"><ChevronDownIcon className={`size-5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} aria-hidden /></button>
      </div>
      <div id="profile-contacts" className={`${expanded ? "block" : "hidden"} mt-6 border-t border-border pt-5 xl:block`}>
        <ul className="space-y-3">
          <ContactItem icon={<EnvelopeClosedIcon />} title="Email" href="mailto:festotechug@gmail.com" value="festotechug@gmail.com" />
          <ContactItem icon={<MobileIcon />} title="Phone" href="tel:+256754230525" value="+256 754230525" />
          <ContactItem icon={<ChatBubbleIcon />} title="WhatsApp" href="https://wa.me/256754230525" value="Chat on WhatsApp" />
          <ContactItem icon={<FileTextIcon />} title="Resume" href="/festoug.pdf" value="Download resume" download />
          <ContactItem icon={<GlobeIcon />} title="Location" href="https://www.google.com/maps/place/Bugoloobi,+Kampala/@0.3124645,32.6133872,15z" value="Bugolobi, Kampala, Uganda" target="_blank" rel="noopener noreferrer" />
        </ul>
      </div>
    </aside>
  );
}

function ContactItem({ icon, title, value, ...link }: { icon: ReactNode; title: string; value: string; href: string; download?: boolean; target?: string; rel?: string }) {
  return <li><a {...link} className="group flex min-h-12 items-start gap-3 rounded-lg py-1 text-sm transition-colors hover:text-primary"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground [&>svg]:size-[18px]" aria-hidden>{icon}</span><span className="min-w-0 pt-0.5"><span className="block text-xs font-medium uppercase tracking-[.08em] text-muted-foreground">{title}</span><span className="mt-0.5 block break-words text-base leading-relaxed text-foreground group-hover:text-primary [overflow-wrap:anywhere]">{value}</span></span></a></li>;
}
