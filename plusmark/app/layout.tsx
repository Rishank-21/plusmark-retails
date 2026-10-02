import type { Metadata, Viewport } from "next";
import { Manrope, Sora, JetBrains_Mono, Plus_Jakarta_Sans, Fraunces, DM_Sans, Outfit, Unbounded } from "next/font/google";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { CUSTOM_HOME_PATHS, designBootScript } from "@/lib/design";
import "./globals.css";
import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "@/components/footer/Footer";
import { JsonLd } from "@/components/ui/JsonLd";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { SiteChrome } from "@/components/ui/SiteChrome";
import { FirebaseAnalytics } from "@/components/analytics/FirebaseAnalytics";
import { MotionProvider } from "@/components/animations/MotionProvider";
import { siteConfig } from "@/lib/seo";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";

const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-display-face", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap", weight: ["400", "500"] });
// Faces for design variants B (Jakarta) and C (Fraunces + DM Sans). Not preloaded, so the
// default design doesn't pay for them.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", preload: false });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap", preload: false });
// Design D (Hyper 3D): wide Unbounded display face + Outfit body.
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap", preload: false });
const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Plusmark Display System — White Boards, Chalk Boards & Notice Boards | Made in India",
    template: "%s | Plusmark Display System",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Plusmark Display System",
    "white boards",
    "chalk boards",
    "notice boards",
    "magnetic boards",
    "ceramic boards",
    "school benches",
    "board stands",
    "clipboards",
    "educational products",
    "Made in India",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${body.variable} ${display.variable} ${mono.variable} ${jakarta.variable} ${fraunces.variable} ${dm.variable} ${outfit.variable} ${unbounded.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the chosen design variant (?design=b / stored choice) before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: designBootScript }} />
        {/* Without JavaScript there is no 3D: show the product photos that stand in for it. */}
        <noscript>
          <style>{`.xd-poster,[data-3d-photo]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh bg-paper text-graphite antialiased">
        {/* Runs before content paints: enables scroll-reveal styles only when JS is available. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-graphite focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <MotionProvider>
          <SiteChrome hideOn={CUSTOM_HOME_PATHS}>
            <Navbar />
          </SiteChrome>
          <main id="main">{children}</main>
          <SiteChrome>
            <Footer />
            <WhatsAppButton />
            <ThemeSwitcher />
          </SiteChrome>
          <FirebaseAnalytics />
        </MotionProvider>
      </body>
    </html>
  );
}
