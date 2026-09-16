type LogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

/**
 * Storage Doc mark: a rounded document with a folded corner and a shield
 * checkmark, signaling "your files, kept safe." Renders at any size from
 * favicon to hero.
 */
export function Logo({ size = 28, withWordmark = false, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--color-brand)" />
        <path
          d="M10 8.5h8.5L23 13v10.5a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1Z"
          fill="var(--color-brand-contrast)"
          fillOpacity="0.95"
        />
        <path d="M18.5 8.5 23 13h-3.5a1 1 0 0 1-1-1V8.5Z" fill="var(--color-brand-contrast)" fillOpacity="0.6" />
        <path
          d="M12.6 17.1l2.1 2.1 4.2-4.6"
          stroke="var(--color-brand)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && <span className="text-lg font-semibold tracking-tight">Storage Doc</span>}
    </span>
  );
}
