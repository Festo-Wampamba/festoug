// Shared foundations for the Motion components. Durations are in seconds.
export const motionTokens = {
  duration: { instant: 0.08, fast: 0.18, normal: 0.35, slow: 0.6, crawl: 1 },
  easing: {
    smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
    linear: [0, 0, 1, 1] as [number, number, number, number],
  },
  distance: { xs: 4, sm: 8, md: 16, lg: 24, xl: 48 },
  scale: { subtle: 0.98, press: 0.95, pop: 1.04 },
  workflow: {
    duration: 9,
    progress: [0, 0.33, 0.66, 1, 1],
    progressTimes: [0, 0.3, 0.63, 0.96, 1],
    emphasis: [0, 0, 1, 1, 0, 0],
    rowTimes: [
      [0, 0.01, 0.04, 0.26, 0.32, 1],
      [0, 0.32, 0.36, 0.6, 0.66, 1],
      [0, 0.66, 0.7, 0.94, 0.98, 1],
    ],
  },
};

export const springs = {
  snappy: { type: "spring" as const, stiffness: 300, damping: 30 },
  gentle: { type: "spring" as const, stiffness: 120, damping: 14 },
};

export const motionConfig = {
  shouldAnimate() {
    return typeof window !== "undefined"
      && !document.hidden
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      && (typeof navigator.hardwareConcurrency !== "number" || navigator.hardwareConcurrency > 4);
  },
};

export function subscribeMotionState(onChange: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    preference.removeEventListener("change", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

export const getServerMotionState = () => false;
