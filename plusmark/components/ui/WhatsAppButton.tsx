import { whatsappHref } from "@/data/company";

/** Floating WhatsApp chat button, fixed to the bottom-right corner on every page. */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref("Hello Plusmark, I would like to know more about your products.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Plusmark on WhatsApp (opens in a new tab)"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25d366] p-3.5 text-white shadow-[0_8px_24px_rgb(0_0_0/0.18)] transition-transform duration-300 hover:scale-105 focus-visible:outline-offset-4 md:bottom-7 md:right-7"
    >
      <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366] opacity-30 motion-reduce:hidden" />
      <svg viewBox="0 0 32 32" aria-hidden className="size-7 fill-current">
        <path d="M16.004 3C8.84 3 3.012 8.827 3.012 15.99c0 2.29.6 4.528 1.74 6.5L3 29l6.68-1.72a12.94 12.94 0 0 0 6.32 1.64h.005c7.163 0 12.995-5.828 12.995-12.99C29 8.827 23.168 3 16.004 3Zm0 23.73h-.004a10.77 10.77 0 0 1-5.49-1.5l-.394-.234-3.965 1.02 1.058-3.866-.257-.397a10.73 10.73 0 0 1-1.65-5.763c0-5.94 4.835-10.772 10.78-10.772 2.88 0 5.585 1.123 7.62 3.16a10.7 10.7 0 0 1 3.152 7.617c-.003 5.94-4.838 10.735-10.85 10.735Zm5.91-8.05c-.323-.162-1.915-.945-2.212-1.053-.297-.108-.513-.162-.729.162-.216.324-.837 1.053-1.026 1.27-.189.215-.378.242-.702.08-.324-.161-1.368-.504-2.605-1.607-.963-.859-1.613-1.92-1.802-2.244-.189-.324-.02-.499.142-.66.146-.145.324-.378.486-.567.162-.19.216-.324.324-.54.108-.216.054-.405-.027-.567-.081-.162-.729-1.757-.999-2.405-.263-.632-.53-.546-.729-.556l-.621-.011a1.19 1.19 0 0 0-.864.405c-.297.324-1.134 1.108-1.134 2.702s1.161 3.134 1.323 3.35c.162.216 2.285 3.49 5.536 4.894.774.334 1.378.534 1.849.683.777.247 1.484.212 2.043.129.623-.093 1.915-.783 2.186-1.54.27-.756.27-1.404.189-1.539-.081-.135-.297-.216-.621-.378Z" />
      </svg>
      <span className="hidden pr-1 text-sm font-semibold md:inline">Chat with us</span>
    </a>
  );
}
