/**
 * Lightweight page transition: a short CSS fade on each navigation.
 * Pure CSS so content is never hidden when JavaScript is unavailable, and navigation is never delayed.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-[pagefade_0.4s_var(--ease-premium)_both]">{children}</div>;
}
