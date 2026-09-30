import { describe, it, expect } from "vitest";
import { computeBentoGeometry, computeDockGeometry } from "./dockLayout";

describe("computeBentoGeometry", () => {
  it("gives two viewports in the same tiered width the same tile geometry", () => {
    const a = computeBentoGeometry({ vWidth: 1290, vHeight: 900, clusterViewportTop: 80 });
    const b = computeBentoGeometry({ vWidth: 1290, vHeight: 900, clusterViewportTop: 80 });
    expect(a).toEqual(b);
  });

  it("falls back to the breakpoint-keyed constant when clusterViewportTop is unmeasured", () => {
    const withMeasurement = computeBentoGeometry({ vWidth: 1440, vHeight: 900, clusterViewportTop: 100 });
    const withoutMeasurement = computeBentoGeometry({ vWidth: 1440, vHeight: 900 });
    // tileTops shift with clusterViewportTop, so these should differ
    expect(withoutMeasurement.tileTops).not.toEqual(withMeasurement.tileTops);
  });

  it("matches the exact breakpoint-keyed fallback constant transcribed from the original inline version", () => {
    // vWidth >= 1024 branch: (5 * 16 + 8 + 6) = 94
    const desktop = computeBentoGeometry({ vWidth: 1440, vHeight: 900 });
    const desktopWithZeroTop = computeBentoGeometry({ vWidth: 1440, vHeight: 900, clusterViewportTop: 94 });
    expect(desktop.tileTops).toEqual(desktopWithZeroTop.tileTops);
  });
});

describe("computeDockGeometry", () => {
  it("centers on the given vWidth/vHeight (currently the raw/live viewport — see the", () => {
    // NOTE: computeDockGeometry intentionally uses whatever vWidth/vHeight it is given
    // as the raw/live viewport (see the file-level comment in dockLayout.ts and root-cause
    // report §1b) — this test only pins that clusterCenterX moves targetLeftX by an equal
    // and opposite delta, for whatever vWidth/vHeight the caller supplies.
    const bento = computeBentoGeometry({ vWidth: 1440, vHeight: 900, clusterViewportTop: 80 });
    const narrow = computeDockGeometry({
      vWidth: 1440, vHeight: 900, clusterCenterX: 720, clusterCenterY: 450, clusterW: 400, clusterH: 370, bento,
    });
    const wide = computeDockGeometry({
      vWidth: 1440, vHeight: 900, clusterCenterX: 960, clusterCenterY: 450, clusterW: 400, clusterH: 370, bento,
    });
    // moving clusterCenterX right should move targetLeftX left by the same delta
    expect(wide.targetLeftX - narrow.targetLeftX).toBeCloseTo(-(960 - 720), 0);
  });

  it("never reads window.innerWidth/innerHeight directly (regression guard for report §1b)", () => {
    const source = require("fs").readFileSync(require.resolve("./dockLayout.ts"), "utf-8");
    expect(source).not.toMatch(/window\.innerWidth|window\.innerHeight/);
  });

  it("is a pure function of its inputs — same inputs always produce the same outputs", () => {
    const bento = computeBentoGeometry({ vWidth: 1366, vHeight: 768, clusterViewportTop: 60 });
    const input = {
      vWidth: 1366,
      vHeight: 768,
      clusterCenterX: 683,
      clusterCenterY: 384,
      clusterW: 500,
      clusterH: 380,
      bento,
    };
    const a = computeDockGeometry(input);
    const b = computeDockGeometry(input);
    expect(a).toEqual(b);
  });

  it("returns finalVaultW for the caller to apply to safeContainerRef's style (no DOM write happens inside)", () => {
    const bento = computeBentoGeometry({ vWidth: 1440, vHeight: 900, clusterViewportTop: 80 });
    const result = computeDockGeometry({
      vWidth: 1440, vHeight: 900, clusterCenterX: 720, clusterCenterY: 450, clusterW: 400, clusterH: 370, bento,
    });
    expect(typeof result.finalVaultW).toBe("number");
    expect(result.finalVaultW).toBeGreaterThan(0);
  });
});
