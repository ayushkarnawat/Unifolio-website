"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "gsap";

export interface SafeVault3DRef {
  setOpenProgress: (progress: number) => void;
  setCardsProgress?: (progress: number) => void;
  triggerRimStep?: (direction?: 1 | -1, stateIndex?: number) => void;
  resetRim?: () => void;
}

interface SafeVault3DProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// PROCEDURAL TEXTURE GENERATORS FOR PRECISION-MACHINED LUXURY PBR FINISH
// ---------------------------------------------------------------------------

// Helper to create smooth beveled arc shapes for physical 3D ring segments
function createArcShape(rIn: number, rOut: number, a1: number, a2: number, segments: number = 48): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(Math.cos(a1) * rOut, Math.sin(a1) * rOut);
  for (let i = 1; i <= segments; i++) {
    const a = a1 + (a2 - a1) * (i / segments);
    shape.lineTo(Math.cos(a) * rOut, Math.sin(a) * rOut);
  }
  shape.lineTo(Math.cos(a2) * rIn, Math.sin(a2) * rIn);
  for (let i = segments - 1; i >= 0; i--) {
    const a = a1 + (a2 - a1) * (i / segments);
    shape.lineTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
  }
  shape.closePath();
  return shape;
}

// High-definition circular/radial brushed dark steel texture for central door assembly (r <= 0.58)
function createRadialBrushedTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;

  // Base dark precision-machined titanium-steel (#464c56)
  ctx.fillStyle = "#464c56";
  ctx.fillRect(0, 0, size, size);

  // -------------------------------------------------------------------------
  // 1. MAIN CIRCULAR BRUSHED STEEL FACE PLATE (r between 356 and 606)
  // -------------------------------------------------------------------------
  // Concentric lathe micro-grooves
  for (let r = 356; r < 606; r += 1.3) {
    const freq = Math.sin(r * 0.45);
    const alpha = 0.05 + 0.035 * Math.sin(r * 0.22);
    ctx.strokeStyle = freq > 0 ? `rgba(215, 228, 244, ${alpha})` : `rgba(18, 24, 32, ${alpha * 1.6})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3200 fine radial anisotropic brush hair lines radiating across the face
  const numFibers = 3200;
  for (let i = 0; i < numFibers; i++) {
    const angle = (i * Math.PI * 2) / numFibers;
    const isLight = i % 2 === 0;
    const alpha = isLight ? 0.035 : 0.048;
    const startR = 246 + (i % 8) * 8;
    const endR = 604;
    ctx.strokeStyle = isLight ? `rgba(225, 235, 248, ${alpha})` : `rgba(20, 26, 34, ${alpha * 1.4})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR);
    ctx.lineTo(cx + Math.cos(angle) * endR, cy + Math.sin(angle) * endR);
    ctx.stroke();
  }

  // Anisotropic highlight sheen lobes (natural reflection along ~45° and ~225°)
  const numSteps = 96;
  for (let s = 0; s < numSteps; s++) {
    const a = (s / numSteps) * Math.PI * 2;
    const factor = Math.pow(Math.cos(a - Math.PI * 0.25), 6);
    if (factor > 0.02) {
      ctx.strokeStyle = `rgba(240, 246, 255, ${factor * 0.18})`;
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 246, cy + Math.sin(a) * 246);
      ctx.lineTo(cx + Math.cos(a) * 604, cy + Math.sin(a) * 604);
      ctx.stroke();
    }
  }

  // Deep perimeter ambient occlusion shadow groove at r = 606 (demarcation against outer rim)
  const outerPlateAo = ctx.createRadialGradient(cx, cy, 560, cx, cy, 606);
  outerPlateAo.addColorStop(0, "rgba(0, 0, 0, 0)");
  outerPlateAo.addColorStop(0.70, "rgba(14, 18, 24, 0.25)");
  outerPlateAo.addColorStop(1.0, "rgba(10, 14, 20, 0.85)");
  ctx.fillStyle = outerPlateAo;
  ctx.beginPath();
  ctx.arc(cx, cy, 606, 0, Math.PI * 2);
  ctx.fill();

  // -------------------------------------------------------------------------
  // 8 PRECISION-MACHINED BOLTS ON MAIN DOOR PLATE (r = 470, angles 22.5° + k * 45°)
  // -------------------------------------------------------------------------
  const plateBoltRadius = 470;
  for (let b = 0; b < 8; b++) {
    const angle = ((22.5 + b * 45) * Math.PI) / 180;
    const bx = cx + Math.cos(angle) * plateBoltRadius;
    const by = cy + Math.sin(angle) * plateBoltRadius;

    // Recessed socket shadow
    const socketShadow = ctx.createRadialGradient(bx, by, 16, bx, by, 32);
    socketShadow.addColorStop(0, "rgba(10, 14, 20, 0.80)");
    socketShadow.addColorStop(0.65, "rgba(12, 16, 22, 0.40)");
    socketShadow.addColorStop(1.0, "rgba(14, 18, 24, 0)");
    ctx.fillStyle = socketShadow;
    ctx.beginPath();
    ctx.arc(bx, by, 32, 0, Math.PI * 2);
    ctx.fill();

    // Turned steel outer collar ring (radius 20px)
    const collarGrad = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, 20);
    collarGrad.addColorStop(0, "#cbd6e2");
    collarGrad.addColorStop(0.35, "#7a8798");
    collarGrad.addColorStop(0.75, "#424b58");
    collarGrad.addColorStop(1.0, "#222a34");
    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.arc(bx, by, 20, 0, Math.PI * 2);
    ctx.fill();

    // Socket demarcation cut
    ctx.strokeStyle = "rgba(12, 16, 22, 0.90)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(bx, by, 20, 0, Math.PI * 2);
    ctx.stroke();

    // Polished steel dome cap (radius 13px)
    const domeGrad = ctx.createRadialGradient(bx - 4, by - 4, 1.5, bx, by, 13);
    domeGrad.addColorStop(0, "#ffffff");
    domeGrad.addColorStop(0.28, "#dce5f0");
    domeGrad.addColorStop(0.70, "#7e8b9c");
    domeGrad.addColorStop(1.0, "#363e4a");
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(bx, by, 13, 0, Math.PI * 2);
    ctx.fill();

    // Center lathe pip
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(bx - 1.2, by - 1.2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // -------------------------------------------------------------------------
  // 2. CONCENTRIC RAISED RING ASSEMBLY (r between 246 and 356)
  // -------------------------------------------------------------------------
  // Outer demarcation groove at r = 356
  ctx.strokeStyle = "rgba(12, 16, 22, 0.95)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(cx, cy, 356, 0, Math.PI * 2);
  ctx.stroke();

  // Outer polished chamfer bevel (r = 346 to 356)
  const chamferOuterGrad = ctx.createRadialGradient(cx, cy, 346, cx, cy, 356);
  chamferOuterGrad.addColorStop(0, "rgba(225, 236, 248, 0.55)");
  chamferOuterGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.75)");
  chamferOuterGrad.addColorStop(1.0, "rgba(60, 72, 86, 0.60)");
  ctx.fillStyle = chamferOuterGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 356, 0, Math.PI * 2);
  ctx.arc(cx, cy, 346, 0, Math.PI * 2, true);
  ctx.fill();

  // Raised dark steel intermediate ring (r = 258 to 346)
  const raisedRingGrad = ctx.createRadialGradient(cx, cy, 258, cx, cy, 346);
  raisedRingGrad.addColorStop(0, "#4a525e");
  raisedRingGrad.addColorStop(0.35, "#5a6372");
  raisedRingGrad.addColorStop(0.70, "#525a68");
  raisedRingGrad.addColorStop(1.0, "#3e4652");
  ctx.fillStyle = raisedRingGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 346, 0, Math.PI * 2);
  ctx.arc(cx, cy, 258, 0, Math.PI * 2, true);
  ctx.fill();

  // Concentric lathe micro-grooves on raised ring
  for (let r = 260; r < 345; r += 1.4) {
    const alpha = 0.04 + 0.025 * Math.sin(r * 0.4);
    ctx.strokeStyle = Math.sin(r * 0.3) > 0 ? `rgba(220, 232, 248, ${alpha})` : `rgba(20, 26, 34, ${alpha * 1.5})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Inner polished chamfer bevel (r = 248 to 258)
  const chamferInnerGrad = ctx.createRadialGradient(cx, cy, 248, cx, cy, 258);
  chamferInnerGrad.addColorStop(0, "rgba(50, 60, 72, 0.65)");
  chamferInnerGrad.addColorStop(0.5, "rgba(240, 248, 255, 0.70)");
  chamferInnerGrad.addColorStop(1.0, "rgba(75, 88, 104, 0.50)");
  ctx.fillStyle = chamferInnerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 258, 0, Math.PI * 2);
  ctx.arc(cx, cy, 248, 0, Math.PI * 2, true);
  ctx.fill();

  // Demarcation cut framing the recessed logo pocket
  ctx.strokeStyle = "rgba(10, 14, 20, 0.98)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(cx, cy, 246, 0, Math.PI * 2);
  ctx.stroke();

  // -------------------------------------------------------------------------
  // 3. PHYSICALLY RECESSED TRENCH FOR UNIFOLIO EMBEDDED LOGO (r = 136 to 244)
  // -------------------------------------------------------------------------
  // Milled pocket shadow (creates deep physical cavity)
  const pocketShadow = ctx.createRadialGradient(cx, cy, 140, cx, cy, 244);
  pocketShadow.addColorStop(0, "#1c212a");
  pocketShadow.addColorStop(0.15, "#181d24");
  pocketShadow.addColorStop(0.85, "#151920");
  pocketShadow.addColorStop(1.0, "#10141a");
  ctx.fillStyle = pocketShadow;
  ctx.beginPath();
  ctx.arc(cx, cy, 244, 0, Math.PI * 2);
  ctx.arc(cx, cy, 136, 0, Math.PI * 2, true);
  ctx.fill();

  // -------------------------------------------------------------------------
  // UNIFOLIO EMBEDDED RING LOGO INLAY (r_in = 142, r_out = 236)
  // Matching the reference image:
  // - Top gap at 12 o'clock (-Math.PI/2)
  // - Right gap at 3 o'clock (0)
  // - Top-right quadrant (12 to 3 o'clock): Iconic Unifolio Emerald Green (#22C55E)
  // - Remaining 3/4 circle: Precision-machined dark brushed steel
  // -------------------------------------------------------------------------
  const rLogoIn = 142;
  const rLogoOut = 236;
  const rLogoMid = (rLogoIn + rLogoOut) / 2;
  const gapRad = 0.024; // Precision gap angle (~8px gap)

  // A. Vibrant Emerald Green Segment (from -Math.PI / 2 + gapRad to -gapRad)
  const aGreenStart = -Math.PI * 0.5 + gapRad;
  const aGreenEnd = -gapRad;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rLogoOut, aGreenStart, aGreenEnd);
  ctx.arc(cx, cy, rLogoIn, aGreenEnd, aGreenStart, true);
  ctx.closePath();
  ctx.clip();

  // Green base gradient with rich luxury depth
  const greenGrad = ctx.createRadialGradient(cx, cy, rLogoIn, cx, cy, rLogoOut);
  greenGrad.addColorStop(0, "#169e46");
  greenGrad.addColorStop(0.35, "#22c55e");
  greenGrad.addColorStop(0.70, "#26d466");
  greenGrad.addColorStop(1.0, "#18a84b");
  ctx.fillStyle = greenGrad;
  ctx.fill();

  // Soft specular gleam on green inlay
  const greenSheen = ctx.createLinearGradient(
    cx + Math.cos(aGreenStart) * rLogoMid, cy + Math.sin(aGreenStart) * rLogoMid,
    cx + Math.cos(aGreenEnd) * rLogoMid, cy + Math.sin(aGreenEnd) * rLogoMid
  );
  greenSheen.addColorStop(0, "rgba(255, 255, 255, 0.35)");
  greenSheen.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
  greenSheen.addColorStop(1.0, "rgba(255, 255, 255, 0.40)");
  ctx.fillStyle = greenSheen;
  ctx.fill();
  ctx.restore();

  // Beveled outer & inner edges of green segment
  ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, rLogoOut - 1, aGreenStart, aGreenEnd);
  ctx.stroke();

  ctx.strokeStyle = "rgba(20, 65, 35, 0.85)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, rLogoIn + 1, aGreenStart, aGreenEnd);
  ctx.stroke();

  // B. Machined Dark Brushed Steel Segment (from gapRad to Math.PI * 1.5 - gapRad)
  const aSteelStart = gapRad;
  const aSteelEnd = Math.PI * 1.5 - gapRad;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, rLogoOut, aSteelStart, aSteelEnd);
  ctx.arc(cx, cy, rLogoIn, aSteelEnd, aSteelStart, true);
  ctx.closePath();
  ctx.clip();

  // Machined steel gradient
  const steelRingGrad = ctx.createRadialGradient(cx, cy, rLogoIn, cx, cy, rLogoOut);
  steelRingGrad.addColorStop(0, "#4a5360");
  steelRingGrad.addColorStop(0.30, "#626d7c");
  steelRingGrad.addColorStop(0.65, "#56606f");
  steelRingGrad.addColorStop(1.0, "#3c4450");
  ctx.fillStyle = steelRingGrad;
  ctx.fill();

  // Concentric lathe lines on steel segment
  for (let r = rLogoIn; r <= rLogoOut; r += 1.4) {
    const alpha = 0.04 + 0.03 * Math.sin(r * 0.4);
    ctx.strokeStyle = Math.sin(r * 0.25) > 0 ? `rgba(225, 236, 248, ${alpha})` : `rgba(18, 24, 32, ${alpha * 1.5})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, r, aSteelStart, aSteelEnd);
    ctx.stroke();
  }
  ctx.restore();

  // Polished chamfer edges on steel ring segment
  ctx.strokeStyle = "rgba(235, 244, 255, 0.70)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, rLogoOut - 1, aSteelStart, aSteelEnd);
  ctx.stroke();

  ctx.strokeStyle = "rgba(25, 32, 40, 0.90)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, rLogoIn + 1, aSteelStart, aSteelEnd);
  ctx.stroke();

  // Beveled end caps at the two gaps (12 o'clock and 3 o'clock)
  const drawBeveledCap = (angle: number) => {
    const xIn = cx + Math.cos(angle) * rLogoIn;
    const yIn = cy + Math.sin(angle) * rLogoIn;
    const xOut = cx + Math.cos(angle) * rLogoOut;
    const yOut = cy + Math.sin(angle) * rLogoOut;
    ctx.strokeStyle = "rgba(10, 14, 20, 0.95)";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(xIn, yIn);
    ctx.lineTo(xOut, yOut);
    ctx.stroke();
    ctx.strokeStyle = "rgba(240, 248, 255, 0.60)";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(xIn, yIn);
    ctx.lineTo(xOut, yOut);
    ctx.stroke();
  };
  drawBeveledCap(aGreenStart);
  drawBeveledCap(aGreenEnd);
  drawBeveledCap(aSteelStart);
  drawBeveledCap(aSteelEnd);

  // -------------------------------------------------------------------------
  // 4. CENTRAL DIAL MECHANISM (r <= 136)
  // -------------------------------------------------------------------------
  // Inner demarcation cut framing the central dial
  ctx.strokeStyle = "rgba(10, 14, 20, 0.98)";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(cx, cy, 136, 0, Math.PI * 2);
  ctx.stroke();

  // Polished chrome chamfer ring framing the central disc (r = 122 to 136)
  const dialChamferGrad = ctx.createRadialGradient(cx, cy, 122, cx, cy, 136);
  dialChamferGrad.addColorStop(0, "rgba(65, 75, 88, 0.50)");
  dialChamferGrad.addColorStop(0.35, "rgba(245, 252, 255, 0.75)");
  dialChamferGrad.addColorStop(0.85, "rgba(230, 240, 252, 0.65)");
  dialChamferGrad.addColorStop(1.0, "rgba(45, 54, 66, 0.55)");
  ctx.fillStyle = dialChamferGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 136, 0, Math.PI * 2);
  ctx.arc(cx, cy, 122, 0, Math.PI * 2, true);
  ctx.fill();

  ctx.strokeStyle = "rgba(12, 16, 22, 0.90)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(cx, cy, 122, 0, Math.PI * 2);
  ctx.stroke();

  // Central circular sunburst disc (r <= 122)
  const discGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 122);
  discGrad.addColorStop(0, "#6a7584");
  discGrad.addColorStop(0.50, "#56606e");
  discGrad.addColorStop(0.88, "#4a5360");
  discGrad.addColorStop(1.0, "#38404b");
  ctx.fillStyle = discGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 122, 0, Math.PI * 2);
  ctx.fill();

  // Concentric lathe micro-grooves
  for (let r = 4; r < 122; r += 1.4) {
    const freq = Math.sin(r * 0.5);
    const alpha = 0.05 + 0.03 * Math.sin(r * 0.25);
    ctx.strokeStyle = freq > 0 ? `rgba(225, 236, 248, ${alpha})` : `rgba(18, 24, 32, ${alpha * 1.5})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 1600 fine radial hair lines emanating from center for true lathe sunburst sheen
  const numSunburst = 1600;
  for (let i = 0; i < numSunburst; i++) {
    const angle = (i * Math.PI * 2) / numSunburst;
    const isLight = i % 2 === 0;
    const alpha = isLight ? 0.04 : 0.055;
    ctx.strokeStyle = isLight ? `rgba(240, 248, 255, ${alpha})` : `rgba(16, 22, 30, ${alpha})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * 120, cy + Math.sin(angle) * 120);
    ctx.stroke();
  }

  // Center precision lathe center-pip
  ctx.fillStyle = "#222a34";
  ctx.beginPath();
  ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(cx - 0.8, cy - 0.8, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Fine metallic micro-noise across full texture
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 5;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  return texture;
}

// Precision texture for outer locking rim & mechanical roller bolt assembly (r > 0.58)
function createFaceRingTexture(): THREE.CanvasTexture {
  const size = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;

  // Base dark brushed steel background (#484e58)
  ctx.fillStyle = "#484e58";
  ctx.fillRect(0, 0, size, size);

  // -------------------------------------------------------------------------
  // 1. SATIN TITANIUM / GUNMETAL ROLLER BOLT CHANNEL (r between 606 and 912)
  // Deep dark recessed channel providing strong mechanical depth
  // -------------------------------------------------------------------------
  const channelGrad = ctx.createRadialGradient(cx, cy, 606, cx, cy, 912);
  channelGrad.addColorStop(0, "#222730");
  channelGrad.addColorStop(0.08, "#2d343f");
  channelGrad.addColorStop(0.50, "#343d4a");
  channelGrad.addColorStop(0.92, "#2d343f");
  channelGrad.addColorStop(1.0, "#1c2128");

  ctx.fillStyle = channelGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 912, 0, Math.PI * 2);
  ctx.arc(cx, cy, 606, 0, Math.PI * 2, true);
  ctx.fill();

  // Concentric brushed micro-grooves inside channel
  for (let r = 608; r < 910; r += 1.6) {
    const alpha = 0.045 + 0.03 * Math.sin(r * 0.4);
    ctx.strokeStyle = Math.sin(r * 0.25) > 0 ? `rgba(210, 222, 238, ${alpha})` : `rgba(16, 22, 30, ${alpha * 1.5})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // -------------------------------------------------------------------------
  // 56 PRECISION-TURNED CYLINDRICAL ROLLER BOLTS AROUND THE CHANNEL
  // Matching the dense precision capsule roller bearings in the reference image
  // -------------------------------------------------------------------------
  const numRollers = 56;
  const rRollerIn = 654;
  const rRollerOut = 874;
  const rollerHw = 7.5; // Half width of roller cylinder

  for (let i = 0; i < numRollers; i++) {
    const angle = (i * Math.PI * 2) / numRollers;
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    const xIn = cx + dirX * rRollerIn;
    const yIn = cy + dirY * rRollerIn;
    const xOut = cx + dirX * rRollerOut;
    const yOut = cy + dirY * rRollerOut;

    // A. Recessed socket shadow beneath each roller
    ctx.fillStyle = "rgba(10, 14, 20, 0.70)";
    ctx.beginPath();
    ctx.moveTo(xIn - perpX * (rollerHw + 3), yIn - perpY * (rollerHw + 3));
    ctx.lineTo(xOut - perpX * (rollerHw + 3), yOut - perpY * (rollerHw + 3));
    ctx.lineTo(xOut + perpX * (rollerHw + 3), yOut + perpY * (rollerHw + 3));
    ctx.lineTo(xIn + perpX * (rollerHw + 3), yIn + perpY * (rollerHw + 3));
    ctx.closePath();
    ctx.fill();

    // B. Cylindrical steel roller body with high-contrast specular gleam
    const rollerGrad = ctx.createLinearGradient(
      xIn - perpX * rollerHw, yIn - perpY * rollerHw,
      xIn + perpX * rollerHw, yIn + perpY * rollerHw
    );
    rollerGrad.addColorStop(0, "#323a45");
    rollerGrad.addColorStop(0.20, "#8290a2");
    rollerGrad.addColorStop(0.45, "#ffffff"); // Crisp specular highlight along cylinder axis
    rollerGrad.addColorStop(0.70, "#a0b0c2");
    rollerGrad.addColorStop(1.0, "#2a313b");

    ctx.fillStyle = rollerGrad;
    ctx.beginPath();
    ctx.moveTo(xIn - perpX * rollerHw, yIn - perpY * rollerHw);
    ctx.lineTo(xOut - perpX * rollerHw, yOut - perpY * rollerHw);
    ctx.lineTo(xOut + perpX * rollerHw, yOut + perpY * rollerHw);
    ctx.lineTo(xIn + perpX * rollerHw, yIn + perpY * rollerHw);
    ctx.closePath();
    ctx.fill();

    // C. Rounded capsule caps at both ends
    const capInGrad = ctx.createRadialGradient(xIn - perpX * 2, yIn - perpY * 2, 1, xIn, yIn, rollerHw);
    capInGrad.addColorStop(0, "#ffffff");
    capInGrad.addColorStop(0.4, "#a8b8cc");
    capInGrad.addColorStop(1.0, "#28303a");
    ctx.fillStyle = capInGrad;
    ctx.beginPath();
    ctx.arc(xIn, yIn, rollerHw, 0, Math.PI * 2);
    ctx.fill();

    const capOutGrad = ctx.createRadialGradient(xOut - perpX * 2, yOut - perpY * 2, 1, xOut, yOut, rollerHw);
    capOutGrad.addColorStop(0, "#ffffff");
    capOutGrad.addColorStop(0.4, "#a8b8cc");
    capOutGrad.addColorStop(1.0, "#28303a");
    ctx.fillStyle = capOutGrad;
    ctx.beginPath();
    ctx.arc(xOut, yOut, rollerHw, 0, Math.PI * 2);
    ctx.fill();

    // Divider groove cut
    ctx.strokeStyle = "rgba(12, 16, 22, 0.75)";
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(xIn - perpX * (rollerHw + 1.5), yIn - perpY * (rollerHw + 1.5));
    ctx.lineTo(xOut - perpX * (rollerHw + 1.5), yOut - perpY * (rollerHw + 1.5));
    ctx.stroke();
  }

  // -------------------------------------------------------------------------
  // 8 LARGE SPHERICAL BOLT CAPS (PINS) AT r = 672 (angles 0°, 45°, 90°, ...)
  // Matching the prominent domed bolt heads with crosshairs in the reference image
  // -------------------------------------------------------------------------
  const boltPinRadius = 672;
  for (let b = 0; b < 8; b++) {
    const angle = (b * 45 * Math.PI) / 180;
    const bx = cx + Math.cos(angle) * boltPinRadius;
    const by = cy + Math.sin(angle) * boltPinRadius;

    // Recessed socket shadow
    const socketShadow = ctx.createRadialGradient(bx, by, 22, bx, by, 46);
    socketShadow.addColorStop(0, "rgba(8, 12, 18, 0.85)");
    socketShadow.addColorStop(0.60, "rgba(10, 14, 20, 0.45)");
    socketShadow.addColorStop(1.0, "rgba(12, 16, 22, 0)");
    ctx.fillStyle = socketShadow;
    ctx.beginPath();
    ctx.arc(bx, by, 46, 0, Math.PI * 2);
    ctx.fill();

    // Turned steel outer collar housing (radius 28px)
    const collarGrad = ctx.createRadialGradient(bx - 6, by - 6, 2, bx, by, 28);
    collarGrad.addColorStop(0, "#d8e4f2");
    collarGrad.addColorStop(0.35, "#8a97a8");
    collarGrad.addColorStop(0.70, "#485362");
    collarGrad.addColorStop(1.0, "#202832");
    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.arc(bx, by, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(12, 16, 22, 0.90)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(bx, by, 28, 0, Math.PI * 2);
    ctx.stroke();

    // Polished spherical dome cap (radius 18px)
    const domeGrad = ctx.createRadialGradient(bx - 5, by - 5, 2, bx, by, 18);
    domeGrad.addColorStop(0, "#ffffff");
    domeGrad.addColorStop(0.28, "#e2ecf8");
    domeGrad.addColorStop(0.68, "#8a98aa");
    domeGrad.addColorStop(1.0, "#363f4c");
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.arc(bx, by, 18, 0, Math.PI * 2);
    ctx.fill();

    // Subtle machined crosshair index markings on the dome cap (visible in reference)
    ctx.strokeStyle = "rgba(30, 38, 48, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx - 14, by);
    ctx.lineTo(bx + 14, by);
    ctx.moveTo(bx, by - 14);
    ctx.lineTo(bx, by + 14);
    ctx.stroke();

    // Highlight edge on crosshair
    ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bx - 14, by + 0.8);
    ctx.lineTo(bx + 14, by + 0.8);
    ctx.moveTo(bx + 0.8, by - 14);
    ctx.lineTo(bx + 0.8, by + 14);
    ctx.stroke();

    // Center lathe pip
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(bx - 1.2, by - 1.2, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // -------------------------------------------------------------------------
  // 2. STEPPED OUTER POLISHED STEEL RIM (r from 912 to 1024)
  // -------------------------------------------------------------------------
  const outerRimGrad = ctx.createRadialGradient(cx, cy, 912, cx, cy, 1024);
  outerRimGrad.addColorStop(0, "#3c4450");
  outerRimGrad.addColorStop(0.04, "#c8d6e6");
  outerRimGrad.addColorStop(0.18, "#727f90");
  outerRimGrad.addColorStop(0.40, "#9cb0c6");
  outerRimGrad.addColorStop(0.65, "#dce6f2");
  outerRimGrad.addColorStop(0.92, "#8290a2");
  outerRimGrad.addColorStop(1.0, "#323a44");

  ctx.fillStyle = outerRimGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 1024, 0, Math.PI * 2);
  ctx.arc(cx, cy, 912, 0, Math.PI * 2, true);
  ctx.fill();

  // Stepped concentric bevel grooves
  for (const rStep of [928, 955, 988, 1014]) {
    ctx.strokeStyle = "rgba(15, 20, 28, 0.65)";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(cx, cy, rStep, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, rStep + 1.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 4 Radial Seam Dividers (12 o'clock, 3 o'clock, 6 o'clock, 9 o'clock)
  for (let s = 0; s < 4; s++) {
    const angle = (s * Math.PI * 0.5);
    const rIn = 912;
    const rOut = 1024;
    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);

    // Dark groove cut
    ctx.strokeStyle = "rgba(10, 14, 20, 0.95)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rIn, cy + Math.sin(angle) * rIn);
    ctx.lineTo(cx + Math.cos(angle) * rOut, cy + Math.sin(angle) * rOut);
    ctx.stroke();

    // Dual bevel edge highlights
    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rIn + perpX * 2, cy + Math.sin(angle) * rIn + perpY * 2);
    ctx.lineTo(cx + Math.cos(angle) * rOut + perpX * 2, cy + Math.sin(angle) * rOut + perpY * 2);
    ctx.stroke();
  }

  // Fine micro-noise across full texture
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 5;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  return texture;
}

// Precision lathe-turned circular brushed texture for central boss disc (distinct machined plate)
function createCenterBossTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;

  // Dark surgical stainless steel plate base (#505864)
  ctx.fillStyle = "#505864";
  ctx.fillRect(0, 0, size, size);

  // Concentric machining rings
  for (let r = 5; r < size * 0.485; r += 1.5) {
    const alpha = 0.045 + 0.03 * Math.sin(r * 0.45);
    ctx.strokeStyle = Math.sin(r * 0.22) > 0 ? `rgba(220, 235, 252, ${alpha})` : `rgba(18, 24, 32, ${alpha * 1.5})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radial fine hair lines
  const numFibers = 1600;
  for (let i = 0; i < numFibers; i++) {
    const angle = (i * Math.PI * 2) / numFibers;
    const isLight = i % 2 === 0;
    const alpha = isLight ? 0.035 : 0.048;
    ctx.strokeStyle = isLight ? `rgba(235, 245, 255, ${alpha})` : `rgba(18, 24, 32, ${alpha})`;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * (size * 0.48), cy + Math.sin(angle) * (size * 0.48));
    ctx.stroke();
  }

  // Soft perimeter bevel definition so central plate fits seamlessly
  const grad = ctx.createRadialGradient(cx, cy, size * 0.30, cx, cy, size * 0.48);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(0.85, "rgba(18, 24, 32, 0.25)");
  grad.addColorStop(1.0, "rgba(12, 16, 22, 0.60)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Fine micro-noise
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 6;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  return texture;
}



// ---------------------------------------------------------------------------
// MAIN 3D VAULT COMPONENT USING unifolio_vault.glb AND "Safe Movement"
// ---------------------------------------------------------------------------

export const SafeVault3D = forwardRef<SafeVault3DRef, SafeVault3DProps>(
  function SafeVault3D({ className = "" }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const vaultGroupRef = useRef<THREE.Group | null>(null);
    const doorHingePivotRef = useRef<THREE.Group | null>(null);
    const doorDisplaceGroupRef = useRef<THREE.Group | null>(null);
    const boltRingGroupRef = useRef<THREE.Group | null>(null);
    const closedDoorGroupRef = useRef<THREE.Group | null>(null);
    const openDoorGroupRef = useRef<THREE.Group | null>(null);
    const closedMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
    const openMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
    const chamberGroupRef = useRef<THREE.Group | null>(null);
    const cardsGroupRef = useRef<THREE.Group | null>(null);
    const cardMeshesRef = useRef<THREE.Mesh[]>([]);
    const animProgressRef = useRef<number>(0);
    const cardsProgressRef = useRef<number>(0);
    const rimSecurityAngleRef = useRef<number>(0);
    const rimTweenRef = useRef<gsap.core.Tween | null>(null);

    // SEQUENTIAL KINEMATICS MATCHING "Safe Movement":
    // Opening:
    // 1. Stage 1 (0.00 -> 0.26): Outer locking rim / bolt mechanism rotates counter-clockwise (-0.45 rad / ~26°) to UNLOCK.
    // 2. Stage 2 (0.26 -> 0.46): Unlocked door unseats outward (+Z) to clear rebate; smoothly transitions from closed GLB to open GLB.
    // 3. Stage 3 (0.46 -> 1.00): Door swings open to the LEFT around the hinge axis to -79.1° with heavy luxury mechanical settle.
    // Closing:
    // 1. Door swings back to 0° (1.00 -> 0.46).
    // 2. Door moves inward along -Z to seal flush into rebate; transitions back to closed GLB (0.46 -> 0.26).
    // 3. Outer locking rim rotates back clockwise (0.26 -> 0.00) into LOCKED position!
    const updateDoorMotion = (p: number) => {
      animProgressRef.current = p;
      const doorHingePivot = doorHingePivotRef.current;
      const doorDisplaceGroup = doorDisplaceGroupRef.current;
      const boltRingGroup = boltRingGroupRef.current;
      const closedDoorGroup = closedDoorGroupRef.current;
      const openDoorGroup = openDoorGroupRef.current;
      const chamberGroup = chamberGroupRef.current;
      if (!doorHingePivot || !doorDisplaceGroup) return;

      const clampP = Math.max(0, Math.min(1, p));
      const P_UNLOCK = 0.26; // First 26%: unlock rotation of outer rim
      const P_UNSEAT = 0.46; // Next 20%: outward translation (+Z) & seamless crossfade to open door

      if (clampP <= P_UNLOCK) {
        // Chamber background is completely concealed behind the locked door
        if (chamberGroup) chamberGroup.visible = false;
        // Stage 1: Rotate outer rim/bolt mechanism to unlock
        const u = clampP / P_UNLOCK;
        const easeU = u * u * (3 - 2 * u);

        if (boltRingGroup) {
          boltRingGroup.rotation.z = rimSecurityAngleRef.current - 0.45 * easeU; // Counter-clockwise unlock rotation in door plane
        }
        doorDisplaceGroup.position.set(0, 0, 0);
        doorHingePivot.rotation.set(0, 0, 0);

        if (closedDoorGroup) {
          closedDoorGroup.visible = true;
          closedMaterialsRef.current.forEach((m) => {
            m.opacity = 1.0;
            m.transparent = false;
            m.depthWrite = true;
            m.depthTest = true;
          });
        }
        if (openDoorGroup) {
          openDoorGroup.visible = false;
        }
      } else if (clampP <= P_UNSEAT) {
        // Door unseats outward; reveal the gold chamber background behind it
        if (chamberGroup) chamberGroup.visible = true;
        // Stage 2: Move outward (+Z) to clear chamber rebate
        const w = (clampP - P_UNLOCK) / (P_UNSEAT - P_UNLOCK);
        const easeW = w * w * (3 - 2 * w);

        if (boltRingGroup) {
          boltRingGroup.rotation.z = rimSecurityAngleRef.current - 0.45;
        }
        doorDisplaceGroup.position.set(0, 0, easeW * 0.40);
        doorHingePivot.rotation.set(0, 0, 0);

        // Crisp solid transition at midpoint of unseating with 100% opaque geometry
        if (closedDoorGroup) {
          closedDoorGroup.visible = easeW < 0.5;
          closedMaterialsRef.current.forEach((m) => {
            m.opacity = 1.0;
            m.transparent = false;
            m.depthWrite = true;
            m.depthTest = true;
          });
        }
        if (openDoorGroup) {
          openDoorGroup.visible = easeW >= 0.5;
          openMaterialsRef.current.forEach((m) => {
            m.opacity = 1.0;
            m.transparent = false;
            m.depthWrite = true;
            m.depthTest = true;
          });
        }
      } else {
        // Door is open; chamber is fully revealed
        if (chamberGroup) chamberGroup.visible = true;
        // Stage 3: Swing open to the LEFT around the hinge with heavy mechanical luxury inertia
        const t = (clampP - P_UNSEAT) / (1 - P_UNSEAT);
        const easeT = Math.sin(t * Math.PI * 0.5);

        if (boltRingGroup) {
          boltRingGroup.rotation.z = rimSecurityAngleRef.current - 0.45;
        }

        if (closedDoorGroup) {
          closedDoorGroup.visible = false;
        }
        if (openDoorGroup) {
          openDoorGroup.visible = true;
          openMaterialsRef.current.forEach((m) => {
            m.opacity = 1.0;
            m.transparent = false;
            m.depthWrite = true;
            m.depthTest = true;
          });
        }

        // Mechanical settle at the end of swing
        let settle = 0;
        if (t > 0.72) {
          const s = Math.min(1, Math.max(0, (t - 0.72) / 0.28));
          settle = 0.028 * Math.sin(s * Math.PI) * (1 - s * 0.25);
        }

        const rotY = -1.38 * easeT - settle; // ~ -79.1° target
        const rotX = 0.022 * Math.sin(t * Math.PI);
        const rotZ = 0.035 * (1 - t);

        doorHingePivot.rotation.set(rotX, rotY, rotZ);

        const forwardClearance = 0.40 + 0.10 * Math.sin(t * Math.PI);
        doorDisplaceGroup.position.set(0, 0, forwardClearance);
      }
    };

    // Relative 3D card layout:
    // START (p = 0.0): tightly stacked at the vault opening mouth matching DOM card trajectory handoff
    const CARD_START_OFFSETS = [
      { x: 4 * -0.014, y: 4 * 0.014, z: 4 * 0.038, rotY: 0, rotZ: 0 }, // Card 0 (frontmost)
      { x: 3 * -0.014, y: 3 * 0.014, z: 3 * 0.038, rotY: 0, rotZ: 0 }, // Card 1
      { x: 2 * -0.014, y: 2 * 0.014, z: 2 * 0.038, rotY: 0, rotZ: 0 }, // Card 2
      { x: 1 * -0.014, y: 1 * 0.014, z: 1 * 0.038, rotY: 0, rotZ: 0 }, // Card 3
      { x: 0 * -0.014, y: 0 * 0.014, z: 0 * 0.038, rotY: 0, rotZ: 0 }, // Card 4 (rearmost)
    ];

    // SETTLED (p = 1.0): physically separated across real 3D chamber depth inside the gold vault
    // Subtle luxury stagger: each card occupies a distinct depth tier, naturally resting on the stepped circular pedestal
    const CARD_SETTLED_OFFSETS = [
      { x: -0.024, y: -0.014, z:  0.068, rotY: -0.022, rotZ: -0.012 }, // Card 0: forward depth tier
      { x: -0.012, y:  0.004, z:  0.034, rotY: -0.010, rotZ: -0.005 }, // Card 1: behind card 0
      { x:  0.000, y:  0.020, z:  0.000, rotY:  0.000, rotZ:  0.000 }, // Card 2: center depth tier
      { x:  0.012, y:  0.034, z: -0.032, rotY:  0.010, rotZ:  0.005 }, // Card 3: deeper tier
      { x:  0.024, y:  0.046, z: -0.062, rotY:  0.020, rotZ:  0.010 }, // Card 4: deepest tier near pedestal back
    ];

    // 3D CARDS MOTION:
    // Cards do not appear inside the vault at any time (vault interior remains clean & empty)
    const updateCardsMotion = (p: number) => {
      cardsProgressRef.current = p;
      const cardsGroup = cardsGroupRef.current;
      if (cardsGroup) {
        cardsGroup.visible = false;
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        setOpenProgress: (progress: number) => {
          updateDoorMotion(progress);
        },
        setCardsProgress: (progress: number) => {
          updateCardsMotion(progress);
        },
        triggerRimStep: (direction: 1 | -1 = 1, stateIndex?: number) => {
          const boltRingGroup = boltRingGroupRef.current;
          if (!boltRingGroup) return;

          // Each security state transition smoothly rotates the outer locking rim / bolt ring.
          // Discrete increment: 22.5° (π / 8 rad = ~0.3927 rad) matches the bolt & tick pitch.
          const STEP_ANGLE = 0.3927;
          let targetAngle: number;
          if (stateIndex !== undefined) {
            targetAngle = -stateIndex * STEP_ANGLE;
          } else {
            targetAngle = rimSecurityAngleRef.current + (direction === 1 ? -STEP_ANGLE : STEP_ANGLE);
          }

          if (rimTweenRef.current) {
            rimTweenRef.current.kill();
          }

          const proxy = { angle: rimSecurityAngleRef.current };
          rimTweenRef.current = gsap.to(proxy, {
            angle: targetAngle,
            duration: 0.55,
            ease: "power2.inOut",
            onUpdate: () => {
              rimSecurityAngleRef.current = proxy.angle;
              // Apply rotation to the bolt ring while door is closed / within unlock phase
              if (animProgressRef.current <= 0.26) {
                const u = animProgressRef.current / 0.26;
                const easeU = u * u * (3 - 2 * u);
                boltRingGroup.rotation.z = proxy.angle - 0.45 * easeU;
              }
            },
          });
        },
        resetRim: () => {
          if (rimTweenRef.current) {
            rimTweenRef.current.kill();
          }
          rimSecurityAngleRef.current = 0;
          if (boltRingGroupRef.current && animProgressRef.current <= 0.26) {
            boltRingGroupRef.current.rotation.z = 0;
          }
        },
      }),
      []
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      const root = rootRef.current;
      if (!canvas || !root) return;

      // -----------------------------------------------------------------------
      // RENDER SCHEDULING
      // The vault lives permanently in the DOM but is only on screen during the
      // Security chapter. Rendering it unconditionally kept a full PBR scene
      // (two GLB door states, an HDR environment probe, eight lights, MSAA at
      // 2x DPR) drawing at 60fps behind the Hero and Product sections, starving
      // the hero background video and every GSAP transition of frame budget.
      // The scene is now built off the first-paint critical path and only draws
      // while it is actually visible.
      // -----------------------------------------------------------------------
      let disposed = false;
      let rafId = 0;
      let running = false;
      let visible: boolean | null = null;
      let syncScheduled = false;
      let floatTween: gsap.core.Tween | null = null;
      let rockTween: gsap.core.Tween | null = null;
      let renderFrame: (() => void) | null = null;
      let teardownScene: (() => void) | null = null;
      // Set once the scene exists; the async GLB callbacks use it to warm the
      // door materials they introduce after the initial pass.
      const warmShadersRef: { current: (() => void) | null } = { current: null };

      // `visibility` is an inherited property, so reading it off our own root
      // reflects every ancestor the parent timeline toggles (the vault wrapper
      // is always shown/hidden with GSAP autoAlpha, i.e. visibility + opacity).
      const isOnScreen = () => {
        const cs = window.getComputedStyle(root);
        return cs.visibility !== "hidden" && cs.display !== "none";
      };

      const loop = () => {
        rafId = requestAnimationFrame(loop);
        renderFrame?.();
      };

      const startLoop = () => {
        if (running || disposed || !renderFrame) return;
        running = true;
        rafId = requestAnimationFrame(loop);
      };

      const stopLoop = () => {
        if (!running) return;
        running = false;
        cancelAnimationFrame(rafId);
      };

      const syncVisibility = () => {
        if (disposed) return;
        const next = isOnScreen();
        if (next === visible) return;
        visible = next;
        if (next) {
          // Safety net: correctness never depends on the deferred build having
          // run yet - if the vault is revealed first, build it right now.
          ensureBuilt();
          floatTween?.resume();
          rockTween?.resume();
          // Draw immediately so the reveal frame is already current, then keep
          // the loop going for as long as the vault stays on screen.
          renderFrame?.();
          startLoop();
        } else {
          floatTween?.pause();
          rockTween?.pause();
          stopLoop();
        }
      };

      // Coalesce to at most one style read per frame, and only when an ancestor
      // style/class actually changed - no per-frame DOM reads in steady state.
      const scheduleSync = () => {
        if (syncScheduled || disposed) return;
        syncScheduled = true;
        requestAnimationFrame(() => {
          syncScheduled = false;
          syncVisibility();
        });
      };

      const visibilityObserver = new MutationObserver(scheduleSync);
      for (let node: HTMLElement | null = root; node; node = node.parentElement) {
        visibilityObserver.observe(node, { attributeFilter: ["style", "class"] });
        if (node === document.body) break;
      }

      let built = false;
      const buildScene = () => {
        if (disposed || built) return;
        built = true;

      const width = canvas.clientWidth || 540;
      const height = canvas.clientHeight || 540;

      // WebGL Renderer with ACES Filmic tone mapping
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02; // Balanced exposure: preserves dark brushed steel contrast without white washout
      rendererRef.current = renderer;

      // 3D Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Studio HDR Environment Map (drives realistic metallic surface reflections)
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const roomEnv = new RoomEnvironment();
      const envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture;
      scene.environment = envMap;
      (scene as any).environmentIntensity = 1.6;

      // Perspective Camera matching "Safe Movement"
      const camera = new THREE.PerspectiveCamera(31, width / height, 0.1, 50);
      camera.position.set(-0.08, 0.04, 11.2);
      camera.lookAt(-0.05, 0, 0);

      // Studio Directional & Contrast Lighting Setup matching Reference Image
      // Rebalanced to sculpt dark brushed steel without over-exposing or washing out
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.38);
      scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xd0d8e2, 0x22272e, 0.32);
      scene.add(hemiLight);

      // Key light: Crisp specular gleams along precision-machined bevels
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.85);
      keyLight.position.set(5.0, 7.0, 6.0);
      scene.add(keyLight);

      // Fill light from left: Neutral cool steel bounce
      const fillLight = new THREE.DirectionalLight(0xd4e2f0, 0.85);
      fillLight.position.set(-6.0, 3.5, 5.0);
      scene.add(fillLight);

      // Warm champagne studio rim bounces matching reference photo
      const warmRimLight1 = new THREE.DirectionalLight(0xffdfba, 1.1);
      warmRimLight1.position.set(-6.5, -4.5, 4.0);
      scene.add(warmRimLight1);

      const warmRimLight2 = new THREE.DirectionalLight(0xffebd2, 0.80);
      warmRimLight2.position.set(5.5, 5.5, 3.5);
      scene.add(warmRimLight2);

      // Top rim light: Crisp upper perimeter definition
      const topRimLight = new THREE.DirectionalLight(0xffffff, 1.0);
      topRimLight.position.set(0, 9.0, 3.0);
      scene.add(topRimLight);

      // Front softbox: Direct camera-axis fill ensuring central logo details are crisp
      const frontSoftbox = new THREE.DirectionalLight(0xe8eff8, 0.40);
      frontSoftbox.position.set(0, 0, 9.0);
      scene.add(frontSoftbox);

      // -----------------------------------------------------------------------
      // TOP-LEVEL VAULT HIERARCHY:
      // VaultGroup (subtle floating & rocking idle)
      //   ├── ChamberGroup (clean, minimal, deep circular recessed chamber)
      //   ├── DoorHingePivot (hinge axis positioned on the left edge: X = -2.52, Z = 0.82)
      //   │     └── DoorDisplaceGroup (outward displacement +Z)
      //   │           └── DoorContainer (holds all GLB door meshes with rotation.x = -PI/2)
      //   └── CardsGroup (3D card stack that glides into the chamber)
      // -----------------------------------------------------------------------
      const vaultGroup = new THREE.Group();
      const baseRotY = -0.15;
      const baseRotX = 0.045;
      const baseRotZ = -0.01;
      vaultGroup.rotation.set(baseRotX, baseRotY, baseRotZ);
      scene.add(vaultGroup);
      vaultGroupRef.current = vaultGroup;

      // CONTINUOUS FLOATING ANIMATION VIA GSAP
      floatTween = gsap.to(vaultGroup.position, {
        y: "+=0.08",
        duration: 5.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      rockTween = gsap.to(vaultGroup.rotation, {
        x: baseRotX + 0.012,
        y: baseRotY - 0.015,
        duration: 6.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Procedural textures
      const radialBrushedTexture = createRadialBrushedTexture();
      const faceRingTexture = createFaceRingTexture();
      const centerBossTexture = createCenterBossTexture();

      // -----------------------------------------------------------------------
      // PBR MATERIALS ACCURATELY REPRODUCING THE LUXURY DARK STEEL REFERENCE
      // Dark brushed titanium-steel, precision-machined bevels, roller bearings,
      // and recessed embedded Unifolio logo
      // -----------------------------------------------------------------------
      // 1. Center Door Assembly (Central dial, concentric bevels, and main circular plate)
      const matCenterBoss = new THREE.MeshStandardMaterial({
        color: 0x727b88,
        map: radialBrushedTexture,
        bumpMap: radialBrushedTexture,
        bumpScale: 0.0014,
        metalness: 0.96,
        roughness: 0.24,
        envMapIntensity: 2.0,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
      });

      // 2. Precision Polished Chrome Bevels (Inner chamfer ring framing boss & outer rim steps)
      const matDoorPolished = new THREE.MeshStandardMaterial({
        color: 0xdde6f0,
        metalness: 0.98,
        roughness: 0.10,
        envMapIntensity: 2.4,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
      });

      // 3. Main Circular Brushed Stainless Steel Plate
      const matFaceBase = new THREE.MeshStandardMaterial({
        color: 0x6a7482,
        map: radialBrushedTexture,
        roughnessMap: radialBrushedTexture,
        bumpMap: radialBrushedTexture,
        bumpScale: 0.0014,
        metalness: 0.96,
        roughness: 0.22,
        envMapIntensity: 2.0,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
      });

      // 4. Rotating Outer Locking Rim Assembly (Satin titanium/gunmetal tick & roller channel + stepped outer rim)
      const matFaceRing = new THREE.MeshStandardMaterial({
        color: 0x6e7784,
        map: faceRingTexture,
        bumpMap: faceRingTexture,
        bumpScale: 0.0012,
        metalness: 0.96,
        roughness: 0.22,
        envMapIntensity: 2.0,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
      });

      // 5. Outer Polished Chrome Rim
      const matOuterRim = new THREE.MeshStandardMaterial({
        color: 0xd2dce6,
        metalness: 0.98,
        roughness: 0.12,
        envMapIntensity: 2.4,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
      });

      // 6. Open Door Machined Structural Steel (Door body, bolts, ribs)
      const matOpenDoor = new THREE.MeshStandardMaterial({
        color: 0x565e6a,
        metalness: 0.95,
        roughness: 0.24,
        envMapIntensity: 1.8,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
      });

      // 10. Radial Locking Bolt Shafts (Darker turned steel body)
      const matBoltBody = new THREE.MeshStandardMaterial({
        color: 0x1e232a,
        metalness: 0.94,
        roughness: 0.30,
        envMapIntensity: 1.4,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
      });

      // 11. Radial Locking Bolt Caps (Precision-turned cap with small polished chamfer highlight)
      const matBoltCap = new THREE.MeshStandardMaterial({
        color: 0x7a8492,
        metalness: 0.96,
        roughness: 0.14,
        envMapIntensity: 1.8,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
      });

      // 12. General Structural Steel (Door back, ribs, inner lip)
      const matDoorPlatinum = new THREE.MeshStandardMaterial({
        color: 0x2c323a,
        metalness: 0.93,
        roughness: 0.30,
        envMapIntensity: 1.4,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        depthTest: true,
      });

      const matGoldAccent = new THREE.MeshStandardMaterial({
        color: 0xedc965,
        metalness: 0.94,
        roughness: 0.14,
        envMapIntensity: 2.2,
      });

      // -----------------------------------------------------------------------
      // 1. OPEN VAULT CHAMBER: /public/bg.png
      // Exactly matches the gold circular chamber, stepped platforms, and pristine
      // studio lighting of /public/bg.png. Unlit MeshBasicMaterial ensures zero distortion.
      // -----------------------------------------------------------------------
      const chamberGroup = new THREE.Group();
      chamberGroup.visible = false;
      vaultGroup.add(chamberGroup);
      chamberGroupRef.current = chamberGroup;

      const textureLoader = new THREE.TextureLoader();
      const bgTexture = textureLoader.load("/bg.png");
      bgTexture.colorSpace = THREE.SRGBColorSpace;
      bgTexture.generateMipmaps = true;
      bgTexture.minFilter = THREE.LinearMipmapLinearFilter;
      bgTexture.magFilter = THREE.LinearFilter;

      // Diameter alignment:
      // Door outer rim diameter = 5.37.
      // In bg.png (1254x1254), the outer gold rim diameter is 1160px (0.925 of width).
      // Plane size = 5.37 / 0.925 = 5.80 units.
      // Center of the circle in bg.png is at x=623, y=610.5 (y offset = -0.076 units)
      const bgPlaneSize = 5.80;
      const bgGeo = new THREE.PlaneGeometry(bgPlaneSize, bgPlaneSize);
      const bgMat = new THREE.MeshBasicMaterial({
        map: bgTexture,
        transparent: true,
        depthWrite: false,
      });
      const bgMesh = new THREE.Mesh(bgGeo, bgMat);
      bgMesh.position.set(0, -0.076, -0.15);
      chamberGroup.add(bgMesh);

      // -----------------------------------------------------------------------
      // 1B. CIRCULAR PORTAL OCCLUSION RIM MASK
      // Creates a true 3D occlusion boundary at the circular doorway opening (Z = 0.04).
      // Inside r <= 2.34 is open (the chamber doorway).
      // Outside r > 2.34 writes to the depth buffer without color output.
      // This forces cards entering/exiting the vault to physically pass BEHIND
      // the front circular rim, creating a convincing depth/portal effect with zero fading.
      // -----------------------------------------------------------------------
      const portalRadius = 2.34;
      const portalHoleGeo = new THREE.RingGeometry(portalRadius, 9.0, 72);
      const portalHoleMat = new THREE.MeshBasicMaterial({
        colorWrite: false, // Invisible: does not draw any pixels to the screen
        depthWrite: true,  // Writes to depth buffer at Z = 0.04
        depthTest: true,
      });
      const portalOccluder = new THREE.Mesh(portalHoleGeo, portalHoleMat);
      portalOccluder.position.set(0, -0.076, 0.04);
      portalOccluder.renderOrder = 0;
      chamberGroup.add(portalOccluder);

      // -----------------------------------------------------------------------
      // 2. DOOR ASSEMBLY & KINEMATICS VIA GLB
      // Hinge axis positioned on the left edge: X = -2.52, Z = 0.82
      // -----------------------------------------------------------------------
      const hingeAxisX = -2.52;
      const hingeAxisY = 0;
      const hingeAxisZ = 0.82;

      const doorHingePivot = new THREE.Group();
      doorHingePivot.position.set(hingeAxisX, hingeAxisY, hingeAxisZ);
      vaultGroup.add(doorHingePivot);
      doorHingePivotRef.current = doorHingePivot;

      const doorDisplaceGroup = new THREE.Group();
      doorHingePivot.add(doorDisplaceGroup);
      doorDisplaceGroupRef.current = doorDisplaceGroup;

      const doorContainer = new THREE.Group();
      doorContainer.position.set(-hingeAxisX, -hingeAxisY, -hingeAxisZ);
      doorDisplaceGroup.add(doorContainer);
           // -----------------------------------------------------------------------
      // 2. PRELOAD & ALIGN BOTH GLB ASSETS (/model.glb & /model open.glb)
      // - /public/model.glb = CLOSED door state
      // - /public/model open.glb = OPEN door state
      // Scale: 2.7386 (radius = 2.68 to fully seal the chamber rebate)
      // -----------------------------------------------------------------------
      const SCALE = 2.7386;
      const gltfLoader = new GLTFLoader();

      const preparePlanarUVs = (geo: THREE.BufferGeometry, radius: number = 0.98) => {
        const pAttr = geo.attributes.position;
        if (!pAttr) return;
        const cnt = pAttr.count;
        const uvs = new Float32Array(cnt * 2);
        for (let i = 0; i < cnt; i++) {
          const x = pAttr.getX(i);
          const y = pAttr.getY(i);
          uvs[i * 2] = (x / (radius * 2)) + 0.5;
          uvs[i * 2 + 1] = (y / (radius * 2)) + 0.5;
        }
        geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
      };

      // A. Load Closed Door State (/model.glb)
      gltfLoader.load(
        "/model.glb?v=3",
        (gltf) => {
          if (disposed) return;
          let origMesh: THREE.Mesh | null = null;
          gltf.scene.traverse((child) => {
            if (!origMesh && child instanceof THREE.Mesh) {
              origMesh = child;
            }
          });
          if (!origMesh) return;

          const geo = (origMesh as THREE.Mesh).geometry;
          const pos = geo.attributes.position;
          const idx = geo.index;
          if (!pos || !idx) return;

          const cCenter = new THREE.Vector3(-0.0194, -0.0195, 0.0070);
          const R_SPLIT = 0.58;

          // Build clean, indexed submeshes preserving all original GLB vertices and smooth normals:
          // 1. Center Assembly (r <= 0.58): stationary disc with embedded Unifolio logo, inner bevel, and main brushed face
          // 2. Outer Locking Rim (r > 0.58): rotating satin titanium tick ring, 8 bolts, and outer chrome rim
          const buildIndexedSubmesh = (isCenter: boolean) => {
            const oldToNew = new Map<number, number>();
            const newPositions: number[] = [];
            const newIndices: number[] = [];

            for (let f = 0; f < idx.count / 3; f++) {
              const i0 = idx.getX(f * 3);
              const i1 = idx.getX(f * 3 + 1);
              const i2 = idx.getX(f * 3 + 2);

              const cx = (pos.getX(i0) + pos.getX(i1) + pos.getX(i2)) / 3 - cCenter.x;
              const cy = (pos.getY(i0) + pos.getY(i1) + pos.getY(i2)) / 3 - cCenter.y;
              const r = Math.sqrt(cx * cx + cy * cy);

              if ((isCenter && r <= R_SPLIT) || (!isCenter && r > R_SPLIT)) {
                for (const oldIdx of [i0, i1, i2]) {
                  let newIdx = oldToNew.get(oldIdx);
                  if (newIdx === undefined) {
                    newIdx = oldToNew.size;
                    oldToNew.set(oldIdx, newIdx);

                    const vx = pos.getX(oldIdx) - cCenter.x;
                    const vy = pos.getY(oldIdx) - cCenter.y;
                    let vz = pos.getZ(oldIdx) - cCenter.z;

                    // Completely eliminate the embossed "21" numerals from the central door plate
                    if (isCenter && (vx * vx + vy * vy) < 0.0576 && vz > 0.0768) {
                      vz = 0.0768;
                    }

                    newPositions.push(vx, vy, vz);
                  }
                  newIndices.push(newIdx);
                }
              }
            }

            const subGeo = new THREE.BufferGeometry();
            subGeo.setIndex(new THREE.BufferAttribute(new Uint32Array(newIndices), 1));
            subGeo.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
            preparePlanarUVs(subGeo, 0.98);
            subGeo.computeVertexNormals();
            return subGeo;
          };

          const geoCenter = buildIndexedSubmesh(true);
          const geoOuterRim = buildIndexedSubmesh(false);

          // Cloned PBR materials: fully opaque with depthWrite & depthTest enabled
          const mCenter = matCenterBoss.clone();
          mCenter.transparent = false;
          mCenter.opacity = 1.0;
          mCenter.depthWrite = true;
          mCenter.depthTest = true;

          const mOuter = matFaceRing.clone();
          mOuter.transparent = false;
          mOuter.opacity = 1.0;
          mOuter.depthWrite = true;
          mOuter.depthTest = true;

          closedMaterialsRef.current = [mCenter, mOuter];

          const meshCenter = new THREE.Mesh(geoCenter, mCenter);
          const meshOuterRim = new THREE.Mesh(geoOuterRim, mOuter);

          // Stationary Center: central boss, inner bevel, and main brushed plate
          const centerGroup = new THREE.Group();
          centerGroup.add(meshCenter);

          // -------------------------------------------------------------------
          // PHYSICALLY EMBEDDED 3D UNIFOLIO RING LOGO INTO THE CENTRAL DOOR REBATE
          // Real extruded geometry with beveled chamfers matching the reference
          // -------------------------------------------------------------------
          const embeddedLogoGroup = new THREE.Group();
          const rLogo3DIn = 0.136;
          const rLogo3DOut = 0.226;
          const dTheta3D = 0.025; // Clean gap at 12 o'clock and 3 o'clock

          const extrudeSettings = {
            depth: 0.0030,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0010,
            bevelThickness: 0.0010,
          };

          // 1. Vibrant Unifolio Emerald Green Segment (#22C55E) from 3 o'clock to 12 o'clock (0 to π/2)
          const greenShape = createArcShape(rLogo3DIn, rLogo3DOut, dTheta3D, Math.PI * 0.5 - dTheta3D, 36);
          const geoGreen = new THREE.ExtrudeGeometry(greenShape, extrudeSettings);
          geoGreen.computeVertexNormals();
          const mGreen = new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            emissive: 0x0c4d21,
            emissiveIntensity: 0.16,
            metalness: 0.35,
            roughness: 0.22,
            envMapIntensity: 2.0,
          });
          const meshGreen = new THREE.Mesh(geoGreen, mGreen);

          // 2. Machined Dark Brushed Steel Ring Segment (3/4 circle from 12 o'clock around to 3 o'clock)
          const steelShape = createArcShape(rLogo3DIn, rLogo3DOut, Math.PI * 0.5 + dTheta3D, Math.PI * 2 - dTheta3D, 72);
          const geoSteel = new THREE.ExtrudeGeometry(steelShape, extrudeSettings);
          geoSteel.computeVertexNormals();
          const mSteel = new THREE.MeshStandardMaterial({
            color: 0x5a6370,
            metalness: 0.96,
            roughness: 0.20,
            envMapIntensity: 2.2,
          });
          const meshSteel = new THREE.Mesh(geoSteel, mSteel);

          // 3. Central Lathe-Turned Sunburst Boss Disc (r <= 0.118)
          const discShape = new THREE.Shape();
          discShape.absarc(0, 0, 0.118, 0, Math.PI * 2, false);
          const discExtrudeSettings = {
            depth: 0.0032,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0010,
            bevelThickness: 0.0010,
          };
          const geoDisc = new THREE.ExtrudeGeometry(discShape, discExtrudeSettings);
          preparePlanarUVs(geoDisc, 0.118);
          geoDisc.computeVertexNormals();
          const mDisc = new THREE.MeshStandardMaterial({
            color: 0x5c6572,
            map: centerBossTexture,
            bumpMap: centerBossTexture,
            bumpScale: 0.0010,
            metalness: 0.96,
            roughness: 0.22,
            envMapIntensity: 2.2,
          });
          const meshDisc = new THREE.Mesh(geoDisc, mDisc);

          embeddedLogoGroup.position.set(0, 0, 0.0772);
          embeddedLogoGroup.add(meshGreen);
          embeddedLogoGroup.add(meshSteel);
          embeddedLogoGroup.add(meshDisc);

          centerGroup.add(embeddedLogoGroup);

          // Rotating Outer Locking Rim: bolt/tick ring and outer chrome rim
          const boltRingGroup = new THREE.Group();
          boltRingGroup.add(meshOuterRim);
          boltRingGroupRef.current = boltRingGroup;

          const closedGroup = new THREE.Group();
          closedGroup.scale.set(SCALE, SCALE, SCALE);
          closedGroup.add(centerGroup);
          closedGroup.add(boltRingGroup);

          // Ensure all door meshes are strictly opaque
          closedGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m) => {
                if (m) {
                  m.transparent = false;
                  m.opacity = 1.0;
                  m.depthWrite = true;
                  m.depthTest = true;
                  if ("transmission" in m) (m as THREE.MeshPhysicalMaterial).transmission = 0;
                  if ("alphaMap" in m) m.alphaMap = null;
                  m.needsUpdate = true;
                }
              });
            }
          });

          doorContainer.add(closedGroup);
          closedDoorGroupRef.current = closedGroup;

          // Re-apply current animation progress once loaded
          updateDoorMotion(animProgressRef.current);
          updateCardsMotion(cardsProgressRef.current);
          // Compile the door materials now rather than on the Security reveal.
          warmShadersRef.current?.();
          renderFrame?.();
        },
        undefined,
        (error) => {
          console.error("Error loading model.glb:", error);
        }
      );

      // B. Load Open Door State (/model open.glb)
      gltfLoader.load(
        "/model open.glb",
        (gltf) => {
          if (disposed) return;
          let origMesh: THREE.Mesh | null = null;
          gltf.scene.traverse((child) => {
            if (!origMesh && child instanceof THREE.Mesh) {
              origMesh = child;
            }
          });
          if (!origMesh) return;

          const geo = (origMesh as THREE.Mesh).geometry.clone();
          const pos = geo.attributes.position;
          const oCenter = new THREE.Vector3(-0.0210, -0.0196, -0.0196);

          for (let i = 0; i < pos.count; i++) {
            pos.setXYZ(
              i,
              pos.getX(i) - oCenter.x,
              pos.getY(i) - oCenter.y,
              pos.getZ(i) - oCenter.z
            );
          }
          geo.computeVertexNormals();

          // Premium machined structural steel material: fully opaque
          const mOpen = matOpenDoor.clone();
          mOpen.transparent = false;
          mOpen.opacity = 1.0;
          mOpen.depthWrite = true;
          mOpen.depthTest = true;
          openMaterialsRef.current = [mOpen];

          const openMesh = new THREE.Mesh(geo, mOpen);
          const openGroup = new THREE.Group();
          openGroup.scale.set(SCALE, SCALE, SCALE);
          // Align open model: rotation around Y by 90° perfectly aligns front face with closed door
          openGroup.rotation.y = Math.PI / 2;
          openGroup.position.z = -0.0388 * SCALE; // Sub-millimeter rim Z alignment matching closed door
          openGroup.visible = false;
          openGroup.add(openMesh);

          // Ensure all door meshes are strictly opaque
          openGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m) => {
                if (m) {
                  m.transparent = false;
                  m.opacity = 1.0;
                  m.depthWrite = true;
                  m.depthTest = true;
                  if ("transmission" in m) (m as THREE.MeshPhysicalMaterial).transmission = 0;
                  if ("alphaMap" in m) m.alphaMap = null;
                  m.needsUpdate = true;
                }
              });
            }
          });

          doorContainer.add(openGroup);
          openDoorGroupRef.current = openGroup;

          // Re-apply current animation progress once loaded
          updateDoorMotion(animProgressRef.current);
          updateCardsMotion(cardsProgressRef.current);
          // Compile the door materials now rather than on the Security reveal.
          warmShadersRef.current?.();
          renderFrame?.();
        },
        undefined,
        (error) => {
          console.error("Error loading model open.glb:", error);
        }
      );

      // -----------------------------------------------------------------------
      // 3. PHYSICAL 3D CARD STACK (Cards are never visible inside the vault)
      // -----------------------------------------------------------------------
      const cardsGroup = new THREE.Group();
      cardsGroup.visible = false;
      cardsGroupRef.current = cardsGroup;
      cardMeshesRef.current = [];

      // Initialize initial state
      updateDoorMotion(animProgressRef.current);
      updateCardsMotion(cardsProgressRef.current);

      // -----------------------------------------------------------------------
      // RENDER & RESIZE HANDLERS
      // -----------------------------------------------------------------------
      renderFrame = () => {
        renderer.render(scene, camera);
      };

      // Three.js builds a material's shader program the first time that material
      // is rendered. Because the vault no longer draws while hidden, that work
      // would otherwise land on the first frame of the Security reveal. Warming
      // it here keeps the compile at page load - exactly where it happened
      // before - so the reveal itself stays free of a hitch. compile() walks the
      // scene with traverse(), so materials on currently-hidden groups (the open
      // door, the chamber, the card stack) are covered too.
      const warmShaders = () => {
        if (disposed) return;
        // compileAsync uses KHR_parallel_shader_compile where the driver
        // supports it, keeping the link step off the main thread.
        const r = renderer as THREE.WebGLRenderer & {
          compileAsync?: (s: THREE.Object3D, c: THREE.Camera) => Promise<unknown>;
        };
        if (typeof r.compileAsync === "function") {
          r.compileAsync(scene, camera).catch(() => {});
        } else {
          renderer.compile(scene, camera);
        }
      };

      const handleResize = () => {
        if (!canvasRef.current || !rendererRef.current) return;
        const newW = canvasRef.current.clientWidth || 540;
        const newH = canvasRef.current.clientHeight || 540;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(newW, newH, false);
        renderFrame?.();
      };

      window.addEventListener("resize", handleResize);

      teardownScene = () => {
        window.removeEventListener("resize", handleResize);
        floatTween?.kill();
        rockTween?.kill();
        floatTween = null;
        rockTween = null;
        radialBrushedTexture.dispose();
        faceRingTexture.dispose();
        centerBossTexture.dispose();
        bgTexture.dispose();
        // Release every geometry/material/texture reachable from the scene:
        // the GLB door states alone hold several hundred MB of GPU buffers.
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else if (mat) mat.dispose();
        });
        scene.clear();
        pmremGenerator.dispose();
        roomEnv.dispose();
        envMap.dispose();
        // NB: deliberately no forceContextLoss() - React StrictMode remounts
        // this effect onto the same <canvas>, and a lost context is never handed
        // back by getContext(), which would leave the vault blank in dev.
        renderer.dispose();
        rendererRef.current = null;
        sceneRef.current = null;
        cardMeshesRef.current = [];
      };

      // Prime the canvas once so a reveal never shows an empty buffer, then let
      // the visibility gate decide whether a continuous loop is warranted.
      renderFrame();
      warmShaders();
      warmShadersRef.current = warmShaders;
      syncVisibility();
      };

      // Procedural texture generation (two 2048x2048 canvases with full-frame
      // pixel passes) plus parsing ~21MB of GLB is a single large chunk of main
      // thread work. It still happens at page load - deferring it any further
      // just moves the stall onto the hero video or, worse, into the middle of
      // the Product -> Security transition. Yielding one frame first means the
      // browser paints before it runs, and it lets React StrictMode's dev
      // remount cancel the first build rather than construct the scene twice.
      let kickRaf = 0;
      let kickTimer = 0;
      const cancelKick = () => {
        if (kickRaf) { cancelAnimationFrame(kickRaf); kickRaf = 0; }
        if (kickTimer) { window.clearTimeout(kickTimer); kickTimer = 0; }
      };
      const ensureBuilt = () => {
        if (built || disposed) return;
        cancelKick();
        buildScene();
      };
      kickRaf = requestAnimationFrame(() => {
        kickRaf = 0;
        kickTimer = window.setTimeout(buildScene, 0);
      });

      return () => {
        disposed = true;
        stopLoop();
        visibilityObserver.disconnect();
        cancelKick();
        renderFrame = null;
        teardownScene?.();
        teardownScene = null;
      };
    }, []);

    return (
      <div ref={rootRef} className={`relative flex items-center justify-center ${className}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_28px_60px_rgba(0,0,0,0.18)]"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  }
);
