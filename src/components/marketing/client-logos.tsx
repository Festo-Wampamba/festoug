"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";

const logos = [
  { src: "/images/client-campus-homes.png", alt: "CampusHomes", width: 170, height: 56 },
  { src: "/images/client-akolet-transparent.png", alt: "Akolet Properties", width: 92, height: 56, wordmark: "Akolet Properties" },
  { src: "/images/client-afridrop-transparent.png", alt: "Afridrop Solutions", width: 145, height: 56 },
  { src: "/images/client-phylax-transparent.png", alt: "Phylax", width: 164, height: 56 },
  { src: "/images/logo-1-color.png", alt: "Client 1", width: 120, height: 40 },
  { src: "/images/logo-2-color.png", alt: "Client 2", width: 120, height: 40 },
  { src: "/images/logo-4-color.png", alt: "Client 4", width: 120, height: 40 },
  { src: "/images/logo-5-color.png", alt: "Client 5", width: 120, height: 40 },
  { src: "/images/logo-6-color.png", alt: "Client 6", width: 120, height: 40 },
];
function Logo({ logo }: { logo: typeof logos[number] }) {
  return (
    <div className="client-logo flex min-w-0 flex-col items-center justify-center gap-1 px-2 py-4 sm:px-4">
      <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height}
        className={`${logo.wordmark ? "w-10 sm:w-12" : "w-full max-w-44"} h-14 object-contain select-none transition-[filter,opacity] duration-200 grayscale opacity-80 hover:grayscale-0 hover:opacity-100`}
        draggable={false} />
      {logo.wordmark && <span aria-hidden="true" className="text-center text-xs font-semibold leading-snug text-foreground">{logo.wordmark}</span>}
    </div>
  );
}

export function ClientLogos() {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div role="region" aria-label="Clients and collaborators" className="client-marquee">
      <div className="client-marquee-window overflow-hidden rounded-xl border border-border bg-card/50">
        {reducedMotion ? (
          <div className="grid grid-cols-2">{logos.map(logo => <Logo key={logo.src} logo={logo} />)}</div>
        ) : (
          <div className="client-marquee-track" style={{ animationPlayState: paused ? "paused" : "running" }}>
            {[false, true].map(copy => (
              <div key={String(copy)} className="client-marquee-set" aria-hidden={copy || undefined}>
                {logos.map(logo => <Logo key={logo.src} logo={logo} />)}
              </div>
            ))}
          </div>
        )}
      </div>
      {!reducedMotion && <div className="mt-2 flex justify-end">
        <button type="button" className="client-control" onClick={() => setPaused(value => !value)} aria-label={paused ? "Play client slideshow" : "Pause client slideshow"}>
          {paused ? <PlayIcon aria-hidden /> : <PauseIcon aria-hidden />}
        </button>
      </div>}
    </div>
  );
}
