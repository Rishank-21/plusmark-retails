import { whatsappHref } from "@/data/company";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Floating WhatsApp chat button, fixed to the bottom-right corner on every page. */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref("Hello Plusmark, I would like to know more about your products.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Plusmark on WhatsApp (opens in a new tab)"
      className="wa-btn group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25d366] p-4 text-white shadow-[0_8px_24px_rgb(0_0_0/0.18)] transition-transform duration-300 hover:scale-105 focus-visible:outline-offset-4 md:bottom-7 md:right-7"
    >
      <span aria-hidden className="wa-ping absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366] opacity-30 motion-reduce:hidden" />
      <WhatsAppIcon className="size-8" />
      <span className="wa-label hidden pr-1 text-sm font-semibold md:inline">Chat with us</span>
    </a>
  );
}
