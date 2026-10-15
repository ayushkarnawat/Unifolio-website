/**
 * Faint "orbits" background for the Contact Us section (approved design, see
 * Docs/reference/contact-orbits-reference.html). Pure SVG + CSS, no JavaScript.
 * Six faint rings, faint ticks, a soft green glow and six tiny dots circling slowly.
 * Positioning, keyframes and the reduced-motion rule live in app/globals.css (.contact-orbits*).
 */

const RINGS = [121.6, 189.2, 256.8, 324.3, 405.4, 500];

const DOTS: { cx: number; fill: string; dur: string; delay: string; ccw: boolean }[] = [
  { cx: 621.6, fill: "#22C55E", dur: "20.9s", delay: "0s", ccw: false },
  { cx: 689.2, fill: "#111613", dur: "31.4s", delay: "-21.9s", ccw: true },
  { cx: 756.8, fill: "#22C55E", dur: "44.9s", delay: "-27.1s", ccw: false },
  { cx: 824.3, fill: "#111613", dur: "69.8s", delay: "-6.5s", ccw: true },
  { cx: 905.4, fill: "#22C55E", dur: "104.7s", delay: "-21.9s", ccw: false },
  { cx: 1000, fill: "#111613", dur: "125.7s", delay: "-61.3s", ccw: true },
];

export function ContactOrbits() {
  return (
    <div
      aria-hidden="true"
      className="contact-orbits-clip pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      <div className="contact-orbits">
        <svg viewBox="0 0 1000 1000" focusable="false">
          <defs>
            <radialGradient id="contact-orbit-glow" cx="500" cy="500" r="459.5" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#22C55E" stopOpacity="0.10" />
              <stop offset="1" stopColor="#22C55E" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="500" cy="500" r="459.5" fill="url(#contact-orbit-glow)" />
          <g fill="none" stroke="#111613" strokeOpacity="0.07" strokeWidth="1">
            {RINGS.map((r) => (
              <circle key={r} cx="500" cy="500" r={r} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <g className="contact-orbit" style={{ animationDuration: "314s" }}>
            <circle cx="500" cy="500" r="326.3" fill="none" stroke="#5A685D" strokeOpacity="0.28" strokeWidth="4" strokeDasharray="1.2 13.445" />
            <circle cx="500" cy="500" r="328.8" fill="none" stroke="#5A685D" strokeOpacity="0.28" strokeWidth="9" strokeDasharray="1.2 146.3" />
          </g>
          {DOTS.map((d) => (
            <g
              key={d.cx}
              className={d.ccw ? "contact-orbit contact-orbit-ccw" : "contact-orbit"}
              style={{ animationDuration: d.dur, animationDelay: d.delay }}
            >
              <circle cx={d.cx} cy="500" r="2.7" fill={d.fill} fillOpacity="0.75" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
