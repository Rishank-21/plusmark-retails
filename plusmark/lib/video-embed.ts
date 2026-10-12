/** YouTube / Vimeo links play in an iframe; anything else is treated as a video file. Safe on client and server. */
export function videoEmbed(url?: string): { type: "youtube" | "vimeo" | "file"; embedUrl?: string; thumb?: string } {
  const u = url?.trim() ?? "";
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (yt) {
    return { type: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`, thumb: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg` };
  }
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: "file" };
}

/** Adds autoplay to an embed URL. */
export const withAutoplay = (embedUrl: string) => `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`;
