"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, HelpCircle, MessageCircle, PhoneCall, Plus, Search, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/animations/Reveal";
import { allFaqs, faqGroups } from "@/data/faq";
import { contactChannels, whatsappHref } from "@/data/company";
import { faqSchema } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FaqSection() {
  const [activeTab, setActiveTab] = useState<string>(faqGroups[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = !!useReducedMotion();
  const uid = useId();

  // Filter items based on active category section and search query
  const filteredItems = useMemo(() => {
    let list: Array<{ item: (typeof allFaqs)[0]; groupTitle: string; groupId: string; originalIndex: number }> = [];

    faqGroups.forEach((g) => {
      g.items.forEach((item, idx) => {
        list.push({ item, groupTitle: g.title, groupId: g.id, originalIndex: idx });
      });
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (x) =>
          x.item.q.toLowerCase().includes(q) ||
          x.item.a.toLowerCase().includes(q) ||
          x.groupTitle.toLowerCase().includes(q),
      );
    } else {
      list = list.filter((x) => x.groupId === activeTab);
    }

    return list;
  }, [activeTab, searchQuery]);

  const activeGroup = faqGroups.find((g) => g.id === activeTab) ?? faqGroups[0];

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchQuery("");
    setOpenIndex(0);
  };

  return (
    <section aria-labelledby="faq-title" className="relative overflow-hidden bg-mist/60 py-24 md:py-32">
      <JsonLd data={faqSchema(allFaqs)} />
      <div aria-hidden className="aurora opacity-70" />

      <div className="container-x relative">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.3fr] lg:gap-16 xl:gap-20">
          {/* Left Column: Heading, Category Tabs, Quick Support Card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal>
              <SectionHeading
                id="faq-title"
                eyebrow="FAQ & Help Centre"
                title={
                  <>
                    Good questions, <span className="text-gradient">clear answers.</span>
                  </>
                }
                intro="The things buyers ask most before choosing a board — series, surfaces, customisation, supply and warranty."
              />
            </Reveal>

              {/* Category Filter Tabs */}
            <Reveal delay={0.06} className="mt-8">
              <p className="mb-3 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">Select Section</p>
              <div role="tablist" aria-label="FAQ sections" className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
                {faqGroups.map((group, gi) => {
                  const isActive = activeTab === group.id && !searchQuery;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleTabChange(group.id)}
                      className={cn(
                        "group relative flex items-center justify-between gap-3 overflow-hidden rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
                        isActive
                          ? "text-white"
                          : "bg-white text-steel ring-1 ring-line hover:bg-mist hover:text-graphite",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="faq-tab-bg"
                          className="absolute inset-0 bg-graphite"
                          transition={{ type: "spring", stiffness: 400, damping: 38 }}
                        />
                      )}
                      <span className="relative flex items-center gap-2.5">
                        <span className={cn("font-mono text-[0.68rem]", isActive ? "text-white/60" : "text-alu-dark")}>
                          {String(gi + 1).padStart(2, "0")}
                        </span>
                        {group.title}
                      </span>
                      <span
                        className={cn(
                          "relative rounded-full px-2 py-0.5 font-mono text-[0.66rem]",
                          isActive ? "bg-white/20 text-white" : "bg-mist text-alu-dark",
                        )}
                      >
                        {group.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* Quick Contact & WhatsApp Box */}
            <Reveal delay={0.12} className="mt-8 hidden rounded-2xl border border-line bg-white p-6 shadow-sm lg:block">
              <p className="font-display text-base font-semibold text-graphite">Have a specific question?</p>
              <p className="mt-1 text-xs leading-relaxed text-steel">
                Get quick answers, size advice and direct quotes from our team.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={whatsappHref("Hi Plusmark team, I have a question regarding your boards.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <MessageCircle className="size-3.5" /> Chat on WhatsApp
                </a>
                {contactChannels.phone && (
                  <a
                    href={`tel:${contactChannels.phone}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-mist/50 px-4 text-xs font-semibold text-graphite transition-colors hover:bg-mist"
                  >
                    <PhoneCall className="size-3.5 text-steel" /> {contactChannels.phoneLabel}
                  </a>
                )}
              </div>
              <div className="mt-4 border-t border-line/60 pt-3">
                <Link
                  href="/buying-guide"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition-colors hover:text-graphite"
                >
                  Explore Buying Guide <ArrowRight className="size-3" />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Search + Animated FAQ Accordion */}
          <div>
            <Reveal delay={0.04}>
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-alu-dark" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setOpenIndex(0);
                  }}
                  placeholder="Search questions (e.g. HPL, warranty, GEM portal, sizes, magnetic)..."
                  className="h-12 w-full rounded-2xl border border-line bg-white pl-11 pr-10 text-sm text-graphite shadow-sm placeholder:text-alu-dark focus:border-graphite/40 focus:outline-none focus:ring-2 focus:ring-graphite/10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-alu-dark hover:bg-mist hover:text-graphite"
                    aria-label="Clear search"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </Reveal>

            {/* Results counter / Active Filter Info */}
            <div className="mb-4 flex items-center justify-between text-xs text-steel">
              <span>
                {searchQuery ? (
                  <>Found <strong className="font-semibold text-graphite">{filteredItems.length}</strong> questions matching <span className="italic text-graphite">"{searchQuery}"</span></>
                ) : (
                  <>
                    <span className="font-medium text-graphite">{activeGroup.title}</span>
                    <span className="mx-1.5 text-line">·</span>
                    <strong className="font-semibold text-graphite">{filteredItems.length}</strong> questions
                  </>
                )}
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-accent underline-offset-2 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Active section header (only shown when not searching) */}
            {!searchQuery && (
              <motion.div
                key={activeGroup.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-5 flex items-center gap-3 border-b border-line pb-4"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-graphite font-mono text-[0.68rem] font-semibold text-white">
                  {String(faqGroups.findIndex(g => g.id === activeGroup.id) + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-graphite">{activeGroup.title}</h3>
                  <p className="text-xs text-steel">{activeGroup.items.length} questions in this section</p>
                </div>
                <BookOpen className="ml-auto size-4 text-alu-dark" aria-hidden />
              </motion.div>
            )}

            {/* Accordion list */}
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center sm:p-12">
                <HelpCircle className="mx-auto size-10 text-alu-dark" />
                <h4 className="mt-3 font-display text-lg font-semibold text-graphite">No questions matched your search</h4>
                <p className="mx-auto mt-2 max-w-sm text-sm text-steel">
                  Can't find what you are looking for? Our team is available right now to assist you directly.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <a
                    href={whatsappHref(`Hi Plusmark, I have a question about: ${searchQuery}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                  >
                    <MessageCircle className="size-3.5" /> Ask on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveTab(faqGroups[0].id);
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-mist px-4 text-xs font-medium text-graphite hover:bg-white"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredItems.map(({ item, groupTitle }, i) => {
                    const isOpen = openIndex === i;
                    const qid = `${uid}-q-${i}`;

                    return (
                      <motion.div
                        key={item.q}
                        layout={!reduce}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className={cn(
                          "overflow-hidden rounded-2xl border bg-white transition-all duration-300",
                          isOpen
                            ? "border-graphite/20 shadow-[0_8px_30px_rgb(27_23_64/0.07)] ring-1 ring-graphite/10"
                            : "border-line hover:border-graphite/30 hover:shadow-[0_4px_20px_rgb(27_23_64/0.04)]",
                        )}
                      >
                        <h3>
                          <button
                            type="button"
                            id={qid}
                            aria-expanded={isOpen}
                            aria-controls={`${qid}-ans`}
                            onClick={() => toggleItem(i)}
                            className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors sm:p-6"
                          >
                            <span className="flex items-start gap-3 sm:gap-4">
                              <span
                                className={cn(
                                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[0.66rem] font-medium transition-colors",
                                  isOpen ? "bg-graphite text-white" : "bg-mist text-alu-dark",
                                )}
                              >
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="flex flex-col gap-1">
                                {searchQuery && (
                                  <span className="font-mono text-[0.62rem] uppercase tracking-wider text-accent font-semibold">
                                    {groupTitle}
                                  </span>
                                )}
                                <span className="font-display text-base font-semibold leading-snug text-graphite sm:text-lg">
                                  {item.q}
                                </span>
                              </span>
                            </span>
                            <span
                              aria-hidden
                              className={cn(
                                "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                                isOpen
                                  ? "rotate-45 border-graphite bg-graphite text-white shadow-sm"
                                  : "border-line bg-mist text-graphite hover:border-graphite/40",
                              )}
                            >
                              <Plus className="size-4" />
                            </span>
                          </button>
                        </h3>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={`${qid}-ans`}
                              role="region"
                              aria-labelledby={qid}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                            >
                              <div className="border-t border-line/60 px-5 pb-6 pt-4 sm:px-6 sm:pl-16">
                                <p className="text-[0.95rem] leading-relaxed text-steel">{item.a}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Support Box */}
            <div className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-sm lg:hidden">
              <p className="font-display text-base font-semibold text-graphite">Still have questions?</p>
              <p className="mt-1 text-xs text-steel">Reach out directly on WhatsApp or call us.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={whatsappHref("Hi Plusmark team, I have a question regarding your boards.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-xs font-semibold text-white shadow-sm"
                >
                  <MessageCircle className="size-3.5" /> WhatsApp us
                </a>
                <ButtonLink href="/buying-guide" variant="secondary" className="!h-10 !text-xs">
                  Buying Guide
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
