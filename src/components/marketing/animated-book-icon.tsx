export function AnimatedBookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <line x1="8" y1="7"    x2="16" y2="7"    className="edu-line edu-line-0" />
      <line x1="8" y1="10.5" x2="13" y2="10.5" className="edu-line edu-line-1" />
      <line x1="8" y1="14"   x2="16" y2="14"   className="edu-line edu-line-2" />
    </svg>
  );
}
