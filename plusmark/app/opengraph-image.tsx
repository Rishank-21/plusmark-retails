import { ImageResponse } from "next/og";

export const alt = "Plusmark Display System — Writing & Display Systems, Made in India";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg,#ffffff 0%,#f2f2ef 60%,#e5e5e1 100%)",
          padding: 72,
          fontFamily: "sans-serif",
          color: "#1c1f23",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, background: "#1c1f23", borderRadius: 8, display: "flex", position: "relative" }}>
              <div style={{ position: "absolute", left: 24, top: 12, width: 9, height: 32, background: "#fff" }} />
              <div style={{ position: "absolute", left: 12, top: 24, width: 32, height: 9, background: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 6 }}>PLUSMARK</div>
              <div style={{ fontSize: 14, letterSpacing: 8, color: "#5d636b" }}>DISPLAY SYSTEM</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2 }}>
              Writing &amp; Display Systems
            </div>
            <div style={{ fontSize: 24, color: "#5d636b", marginTop: 20 }}>
              White · Chalk · Notice · Magnetic · Ceramic Boards
            </div>
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 18, color: "#5d636b", letterSpacing: 2 }}>
            <span>EST. 2015</span>
            <span>MADE IN INDIA</span>
            <span>GEM PORTAL APPROVED</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 380,
              height: 285,
              background: "#fafafa",
              border: "14px solid #c9cdd2",
              boxShadow: "0 40px 60px -30px rgba(28,31,35,0.4)",
              display: "flex",
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", left: -20, top: -20, width: 40, height: 40, background: "#2a2d31" }} />
            <div style={{ position: "absolute", right: -20, top: -20, width: 40, height: 40, background: "#2a2d31" }} />
            <div style={{ position: "absolute", left: -20, bottom: -20, width: 40, height: 40, background: "#2a2d31" }} />
            <div style={{ position: "absolute", right: -20, bottom: -20, width: 40, height: 40, background: "#2a2d31" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
