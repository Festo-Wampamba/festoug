"use client";

import { useState } from "react";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";

export function EngineeringIllustration() {
  const [paused, setPaused] = useState(false);

  return (
    <figure className="engineering-scene" data-paused={paused}>
      <figcaption className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">From interface to infrastructure</span>
        <button
          type="button"
          onClick={() => setPaused(value => !value)}
          aria-label={paused ? "Play infrastructure animation" : "Pause infrastructure animation"}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-primary transition-colors hover:bg-secondary motion-reduce:hidden"
        >
          {paused ? <PlayIcon aria-hidden /> : <PauseIcon aria-hidden />}
        </button>
      </figcaption>

      <svg className="engineering-diagram" viewBox="0 0 560 410" fill="none" role="img" aria-label="An application and its code connect through an API to a database and cloud infrastructure. Moving dots illustrate requests flowing through these layers.">
        {/* Connections stay visible when motion is paused or reduced. */}
        <g stroke="var(--input)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M166 174V202Q166 212 176 212H270Q280 212 280 222" />
          <path d="M426 178V202Q426 212 416 212H290Q280 212 280 222" />
          <path d="M280 280V298Q280 308 270 308H140Q130 308 130 318V332" />
          <path d="M280 280V298Q280 308 290 308H420Q430 308 430 318V332" />
        </g>

        <g fill="var(--primary)">
          <g transform="translate(166 174)"><circle r="3.5" className="engineering-packet engineering-packet-app" /></g>
          <g transform="translate(426 178)"><circle r="3.5" className="engineering-packet engineering-packet-code" /></g>
          <g transform="translate(280 280)"><circle r="3.5" className="engineering-packet engineering-packet-data" /></g>
          <g transform="translate(280 280)"><circle r="3.5" className="engineering-packet engineering-packet-cloud" /></g>
        </g>

        {/* Application window */}
        <rect x="30" y="24" width="272" height="150" rx="14" fill="var(--card)" stroke="var(--input)" />
        <path d="M30 57H302" stroke="var(--border)" />
        <g fill="var(--primary)" opacity=".55"><circle cx="47" cy="41" r="3" /><circle cx="59" cy="41" r="3" /><circle cx="71" cy="41" r="3" /></g>
        <rect x="95" y="34" width="185" height="14" rx="4" fill="var(--secondary)" />
        <rect x="47" y="76" width="44" height="78" rx="6" fill="var(--secondary)" />
        <path d="M58 91H80M58 103H74M58 115H80" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" opacity=".65" />
        <text x="107" y="94" className="engineering-node-label engineering-detail">Web application</text>
        <rect x="107" y="108" width="78" height="46" rx="6" fill="var(--secondary)" />
        <path d="M199 113H277M199 126H257M199 139H267" stroke="var(--input)" strokeWidth="3" strokeLinecap="round" />
        <path d="m133 124-7 7 7 7m26-14 7 7-7 7m-16 3 7-21" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Implementation, rather than a simulated live terminal. */}
        <rect x="338" y="74" width="188" height="104" rx="12" fill="var(--secondary)" stroke="var(--input)" />
        <path d="M355 93H369M355 101H362" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
        <text x="355" y="124" className="engineering-code engineering-detail">request()</text>
        <text x="369" y="144" className="engineering-code engineering-detail">validate()</text>
        <text x="369" y="164" className="engineering-code engineering-detail">respond()</text>

        {/* API layer */}
        <rect x="207" y="222" width="146" height="58" rx="12" fill="var(--primary)" />
        <g stroke="var(--primary-foreground)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m233 242-7 9 7 9m20-18 7 9-7 9m-13 3 6-24" />
        </g>
        <text x="276" y="258" className="engineering-api-label">API</text>

        {/* Data and deployment layers */}
        <rect x="40" y="332" width="180" height="58" rx="12" fill="var(--card)" stroke="var(--input)" />
        <g stroke="var(--primary)" strokeWidth="1.6">
          <ellipse cx="68" cy="351" rx="10" ry="4" />
          <path d="M58 351V369C58 375 78 375 78 369V351M58 360C58 366 78 366 78 360" />
        </g>
        <text x="91" y="367" className="engineering-node-label engineering-detail">Database</text>

        <rect x="340" y="332" width="180" height="58" rx="12" fill="var(--secondary)" stroke="var(--input)" />
        <g stroke="var(--primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M363 368H383C392 368 392 355 384 355C383 343 365 343 364 355C354 354 354 368 363 368Z" />
        </g>
        <text x="402" y="367" className="engineering-node-label engineering-detail">Cloud</text>
      </svg>

      <p className="engineering-mobile-caption text-xs text-muted-foreground">Application · API · Database · Cloud</p>
    </figure>
  );
}
