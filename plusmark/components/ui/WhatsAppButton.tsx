import { whatsappHref } from "@/data/company";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { LogoMark } from "./Logo";

/** Floating WhatsApp chat button with the Plusmark monogram, fixed to the bottom-right corner on every page. */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappHref("Hello Plusmark, I would like to know more about your products.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Plusmark on WhatsApp (opens in a new tab)"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-[#25d366] py-2 pl-2 pr-2 text-white shadow-[0_10px_28px_rgb(0_0_0/0.22)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-offset-4 md:bottom-7 md:right-7 md:pr-5"
    >
      <span aria-hidden className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366] opacity-25 motion-reduce:hidden" />
      <span className="relative shrink-0">
        <LogoMark className="size-11 ring-2 ring-white md:size-12" />
        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#25d366] ring-2 ring-white">
          <WhatsAppIcon className="size-3 text-white" />
        </span>
      </span>
      <span className="hidden text-sm font-semibold uppercase tracking-[0.06em] md:inline">WhatsApp us</span>
    </a>
  );
}
