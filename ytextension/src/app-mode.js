/**
 * YouTube surface we care about. Derived only from the URL.
 */
export const AppMode = {
  NEITHER: "neither",
  SHORTS: "shorts",
  WATCH: "watch"
};

export function detectAppMode() {
  const path = location.pathname;
  if (path.startsWith("/shorts/")) return AppMode.SHORTS;
  if (path === "/watch") return AppMode.WATCH;
  return AppMode.NEITHER;
}
