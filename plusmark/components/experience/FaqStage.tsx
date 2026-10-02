"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, MessageCircle, PhoneCall, Plus } from "lucide-react";
import { useId, useState } from "react";
import { Reveal } from "@/components/animations/Reveal";
import { contactChannels, whatsappHref } from "@/data/company";
import { faqGroups } from "@/data/faq";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * FAQ for designs D and E: topic tabs on the left, an animated single-open accordion on the
 * right, and a help card. Answers come from data/faq.ts (the same copy as the /faq page).
 */
export function FaqStage({ id }: { id: string }) {
  const [group, setGroup] = useState(faqGroups[0].id);
  const [open, setOpen] = useState<number | null>(0);
  const reduce = !!useReducedMotion();
  const uid = useId();
  const current = faqGroups.find((g) => g.id === group) ?? faqGroups[0];
  const titleId = `${id}-title`;

  const pick = (gid: string) => {
    setGroup(gid);
    setOpen(0);
  };

  return (
    <section id={id} aria-labelledby={titleId} className="relative z-10 py-24 md:py-32">
      <div className="mx-auto grid max-w-[110rem] gap-12 px-5 sm:px-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20 lg:pr-32">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <p className="xd-eyebrow">FAQ</p>
            <h2 id={titleId} className="mt-4 font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">
              Questions, <span className="xd-grad-text">answered.</span>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-steel">What schools, institutions, offices and dealers usually ask before ordering.</p>
          </Reveal>

          <Reveal delay={0.06} className="mt-8">
            <div role="tablist" aria-label="FAQ topics" aria-orientation="vertical" className="flex flex-wrap gap-1.5 lg:flex-col">
              {faqGroups.map((g, gi) => {
                const on = g.id === group;
                return (
                  <button
                    key={g.id}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${g.id}`}
                    aria-selected={on}
                    aria-controls={`${uid}-panel`}
                    onClick={() => pick(g.id)}
                    className={cn(
                      "relative flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      on ? "text-white" : "text-steel ring-1 ring-line hover:bg-white hover:text-graphite lg:ring-0",
                    )}
                  >
                    {on && (
                      <motion.span
                        layoutId={`${id}-faq-tab`}
                        className="absolute inset-0 rounded-xl bg-graphite shadow-[0_12px_28px_-16px_rgb(27_23_64/0.7)]"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      />
                    )}
                    <span className="relative flex items-center gap-3">
                      <span className={cn("font-mono text-[0.68rem]", on ? "text-white/50" : "text-alu-dark")}>{String(gi + 1).padStart(2, "0")}</span>
                      {g.title}
                    </span>
                    <span className={cn("relative font-mono text-[0.68rem] tabular-nums", on ? "text-white/60" : "text-alu-dark")}>{g.items.length}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="xd-stage xd-on-dark mt-8 hidden overflow-hidden rounded-2xl p-6 text-white lg:block">
            <p className="font-display text-lg font-semibold">Still have a question?</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">The team replies quickly on WhatsApp and phone.</p>
            <div className="mt-5 flex flex-col gap-2">
              <a
                href={whatsappHref("Hi Plusmark, I have a question about your boards.")}
                target="_blank"
                rel="noopener noreferrer"
                className="xd-btn !h-11"
              >
                <MessageCircle aria-hidden className="size-4" /> WhatsApp us
              </a>
              <a href={`tel:${contactChannels.phone}`} className="xd-btn-ghost !h-11">
                <PhoneCall aria-hidden className="size-4" /> {contactChannels.phoneLabel}
              </a>
            </div>
          </Reveal>
        </div>

        <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${current.id}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={current.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="space-y-3"
            >
              {current.items.map((item, i) => {
                const isOpen = open === i;
                const qid = `${uid}-${current.id}-q${i}`;
                return (
                  <motion.li
                    key={item.q}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.05 + i * 0.05 }}
                    className={cn(
                      "overflow-hidden rounded-2xl bg-white ring-1 transition-[box-shadow] duration-500",
                      isOpen
                        ? "shadow-[0_1px_2px_rgb(27_23_64/0.05),0_30px_60px_-40px_rgb(79_63_217/0.55)] ring-[rgb(79_63_217/0.25)]"
                        : "shadow-[0_1px_2px_rgb(27_23_64/0.04)] ring-[rgb(27_23_64/0.07)] hover:ring-[rgb(27_23_64/0.14)]",
                    )}
                  >
                    <h3>
                      <button
                        type="button"
                        id={qid}
                        aria-expanded={isOpen}
                        aria-controls={`${qid}-a`}
                        onClick={() => setOpen(isOpen ? null : i)}
                        className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent md:px-7 md:py-6"
                      >
                        <span className="flex gap-4">
                          <span className={cn("mt-1 font-mono text-[0.7rem] transition-colors", isOpen ? "text-accent" : "text-alu-dark")}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-display text-base font-semibold leading-snug text-graphite md:text-lg">{item.q}</span>
                        </span>
                        <motion.span
                          aria-hidden
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className={cn(
                            "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full ring-1 transition-colors duration-300",
                            isOpen ? "bg-graphite text-white ring-graphite" : "bg-mist text-graphite ring-line",
                          )}
                        >
                          <Plus className="size-4" />
                        </motion.span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="a"
                          id={`${qid}-a`}
                          role="region"
                          aria-labelledby={qid}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                        >
                          <p className="max-w-3xl border-t border-line/70 px-6 pb-6 pt-5 text-[0.95rem] leading-relaxed text-steel md:ml-[2.6rem] md:px-7">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </motion.ul>
          </AnimatePresence>

          <Link href="/faq" className="xd-link mt-8 text-sm font-semibold">
            All questions on the FAQ page <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
