"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { LazyMotion, domAnimation, m, useInView, useReducedMotion } from "motion/react";
import { CheckCircledIcon, CodeIcon, MagnifyingGlassIcon, PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { getServerMotionState, motionConfig, motionTokens, subscribeMotionState } from "@/lib/motion-tokens";

const STEPS = [
  { title: "Understand & scope", detail: "Goals, constraints, and a practical plan.", Icon: MagnifyingGlassIcon },
  { title: "Build & connect", detail: "Interfaces, APIs, and the systems behind them.", Icon: CodeIcon },
  { title: "Validate & hand over", detail: "Checks, deployment, and clear documentation.", Icon: CheckCircledIcon },
];

export function ServiceWorkflow() {
  const scene = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const eligible = useSyncExternalStore(subscribeMotionState, motionConfig.shouldAnimate, getServerMotionState);
  const reduced = useReducedMotion();
  const visible = useInView(scene, { amount: 0.25 });
  const running = eligible && visible && !reduced && !paused;

  return (
    <LazyMotion features={domAnimation}>
      <figure ref={scene} className="service-workflow mx-auto w-full max-w-[38rem] rounded-2xl border border-border bg-secondary/30 p-4 sm:p-6" data-running={running}>
        <figcaption className="flex items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.08em] text-primary">Delivery workflow</p>
            <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">From brief to working software</p>
          </div>
          <span className="flex size-11 shrink-0 items-center justify-center">
            <button
              type="button"
              hidden={!eligible || Boolean(reduced)}
              onClick={() => setPaused(value => !value)}
              aria-label={paused ? "Play service workflow animation" : "Pause service workflow animation"}
              aria-pressed={paused}
              className="flex size-11 items-center justify-center rounded-lg border border-border bg-card text-primary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <PauseIcon className={paused ? "hidden" : "size-4"} aria-hidden />
              <PlayIcon className={paused ? "size-4" : "hidden"} aria-hidden />
            </button>
          </span>
        </figcaption>

        <div className="relative mt-5">
          <div aria-hidden="true" className="absolute bottom-10 left-[18px] top-10 w-px overflow-hidden bg-border sm:left-[22px]">
            <m.div
              initial={false}
              animate={{ scaleY: running ? motionTokens.workflow.progress : 0 }}
              exit={{ opacity: 0 }}
              transition={running
                ? { duration: motionTokens.workflow.duration, times: motionTokens.workflow.progressTimes, ease: motionTokens.easing.linear, repeat: Infinity }
                : { duration: motionTokens.duration.instant }}
              className="service-workflow-progress h-full w-full origin-top bg-primary"
            />
          </div>
          <ol className="relative space-y-3">
            {STEPS.map(({ title, detail, Icon }, index) => (
              <li key={title} className="relative grid grid-cols-[36px_minmax(0,1fr)] items-center gap-3 rounded-xl py-3 sm:grid-cols-[44px_minmax(0,1fr)] sm:gap-4">
                <m.div
                  aria-hidden="true"
                  initial={false}
                  animate={{ opacity: running ? motionTokens.workflow.emphasis : 0 }}
                  exit={{ opacity: 0 }}
                  transition={running
                    ? { duration: motionTokens.workflow.duration, times: motionTokens.workflow.rowTimes[index], ease: motionTokens.easing.linear, repeat: Infinity }
                    : { duration: motionTokens.duration.instant }}
                  className="service-workflow-emphasis pointer-events-none absolute -inset-x-2 inset-y-0 rounded-xl border border-primary/25 bg-secondary"
                />
                <span className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-primary sm:size-11">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="relative min-w-0">
                  <p className="text-sm font-semibold text-foreground sm:text-base">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">A clear scope. Connected systems. A considered handover.</p>
      </figure>
    </LazyMotion>
  );
}
