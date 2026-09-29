"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[80svh] items-center studio-bg pt-[68px]">
      <div className="container-x max-w-2xl">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-5 font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02]">
          We couldn’t load this page.
        </h1>
        <p className="mt-5 text-steel">Please try again. If the problem continues, return to the homepage.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center gap-2 bg-graphite px-6 text-sm font-semibold text-white"
          >
            <RotateCcw aria-hidden className="size-4" /> Try again
          </button>
          <Link href="/" className="inline-flex h-12 items-center px-6 text-sm font-semibold ring-1 ring-line">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
