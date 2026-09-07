"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";

export interface CardSculptureHandle {
  setProgress: (val: number) => void;
  setAmbient: (active: boolean) => void;
  setDockedInstant: () => void;
  resetToRestInstant: () => void;
  setOpacity: (val: number) => void;
}

export interface CardSculptureProps {
  getDomCardRects: () => DOMRect[];
}

const TOTAL_CARDS = 35;
const TORUS_RADIUS = 2.45;
const CARD_WIDTH = 0.84;
const CARD_HEIGHT = 1.34;
const CARD_CORNER_RADIUS = 0.08;

const CARD_TITLES = [
  "Skip the dashboards. Just ask.",
  "See Everything",
  "Understand What You Own",
  "Know Your Risk",
  "Plan Ahead",
];

// 5 primary sector centers around the ring:
// Sector 2 is bottom-center (270° / -90°)
// Sector 1 is lower-left (198°)
// Sector 0 is top-left (126°)
// Sector 4 is top-right (54°)
// Sector 3 is lower-right (342°)
const SECTOR_CENTERS = [
  -Math.PI / 2 - (4 * Math.PI) / 5, // Sector 0: 126 deg (top-left)
  -Math.PI / 2 - (2 * Math.PI) / 5, // Sector 1: 198 deg (lower-left)
  -Math.PI / 2,                     // Sector 2: 270 deg (bottom-center)
  -Math.PI / 2 + (2 * Math.PI) / 5, // Sector 3: 342 deg (lower-right)
  -Math.PI / 2 + (4 * Math.PI) / 5, // Sector 4: 54 deg (top-right)
];

const COMPANION_OFFSETS = [-3, -2, -1, 1, 2, 3];

// Create rounded rectangle 2D shape for card geometry
function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x, y + r);
  shape.lineTo(x, y + h - r);
  shape.quadraticCurveTo(x, y + h, x + r, y + h);
  shape.lineTo(x + w - r, y + h);
  shape.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
  shape.lineTo(x + w, y + r);
  shape.quadraticCurveTo(x + w, y, x + w - r, y);
  shape.lineTo(x + r, y);
  shape.quadraticCurveTo(x, y, x, y + r);
  return shape;
}

// Generate card face textures matching the 5 Product cards pixel-for-pixel
function createCardTexture(index: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d")!;

  // Dark obsidian cardstock surface
  ctx.fillStyle = "#060907";
  ctx.fillRect(0, 0, 512, 768);

  // Subtle emerald depth gradients
  const radGrad = ctx.createRadialGradient(256, 200, 10, 256, 200, 360);
  radGrad.addColorStop(0, "rgba(34, 197, 94, 0.22)");
  radGrad.addColorStop(0.65, "rgba(5, 150, 105, 0.08)");
  radGrad.addColorStop(1, "transparent");
  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 512, 768);

  const radGrad2 = ctx.createRadialGradient(256, 600, 10, 256, 600, 320);
  radGrad2.addColorStop(0, "rgba(16, 185, 129, 0.16)");
  radGrad2.addColorStop(1, "transparent");
  ctx.fillStyle = radGrad2;
  ctx.fillRect(0, 0, 512, 768);

  // Subtle luxury border rim
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 496, 752);

  // Top specular rim line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(30, 12);
  ctx.lineTo(482, 12);
  ctx.stroke();

  // Top header text: UNIFOLIO // 0X
  ctx.font = "600 20px monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  const numStr = String((index % 5) + 1).padStart(2, "0");
  ctx.fillText(`UNIFOLIO // ${numStr}`, 36, 56);

  // Exact Product card centered title
  const title = CARD_TITLES[index % CARD_TITLES.length];
  ctx.font = "bold 32px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";

  // Multi-line wrap for card title
  const words = title.split(" ");
  const lines: string[] = [];
  let currentLine = words[0];
  for (let w = 1; w < words.length; w++) {
    const testLine = currentLine + " " + words[w];
    if (ctx.measureText(testLine).width < 400) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[w];
    }
  }
  lines.push(currentLine);

  const startY = 384 - ((lines.length - 1) * 44) / 2;
  lines.forEach((line, lIdx) => {
    ctx.fillText(line, 256, startY + lIdx * 44);
  });

  // Bottom wordmark
  ctx.font = "700 20px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.fillText("UNIFOLIO", 256, 710);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

export const CardSculpture = forwardRef<CardSculptureHandle, CardSculptureProps>(
  function CardSculpture({ getDomCardRects }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    // Animation state ref
    const animStateRef = useRef({
      progress: 0,
      isAmbient: false,
      ambientRotation: 0,
    });
    const domStartScaleRef = useRef(1.8);

    useImperativeHandle(ref, () => ({
      setProgress: (val: number) => {
        animStateRef.current.progress = Math.max(0, Math.min(1, val));
      },
      setAmbient: (active: boolean) => {
        animStateRef.current.isAmbient = active;
      },
      setOpacity: (val: number) => {
        if (containerRef.current) {
          containerRef.current.style.opacity = String(val);
          if (val > 0.001) {
            containerRef.current.style.visibility = "visible";
          } else {
            containerRef.current.style.visibility = "hidden";
          }
        }
      },
      setDockedInstant: () => {
        animStateRef.current.progress = 1.0;
        animStateRef.current.isAmbient = true;
        if (containerRef.current) {
          containerRef.current.style.visibility = "visible";
          containerRef.current.style.opacity = "1";
          containerRef.current.style.transform = "";
        }
      },
      resetToRestInstant: () => {
        animStateRef.current.progress = 0;
        animStateRef.current.isAmbient = false;
        animStateRef.current.ambientRotation = 0;
        if (containerRef.current) {
          containerRef.current.style.visibility = "hidden";
          containerRef.current.style.opacity = "0";
          containerRef.current.style.transform = "";
        }
      },
    }));

    useEffect(() => {
      if (!mounted) return;
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      let width = container.clientWidth || window.innerWidth;
      let height = container.clientHeight || window.innerHeight;

      // 1. Scene, Camera, Renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(0, 0, 11.5);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;

      // 2. Lighting System (Specular metallic rim lighting)
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(6, 9, 8);
      scene.add(keyLight);

      const emeraldFillLight = new THREE.DirectionalLight(0x22c55e, 1.6);
      emeraldFillLight.position.set(-8, -4, 5);
      scene.add(emeraldFillLight);

      // Core point light in torus center highlights the inner void edges
      const centralVoidLight = new THREE.PointLight(0x34d399, 4.5, 14, 1.2);
      scene.add(centralVoidLight);

      // 3. Torus Formation Configuration
      const BASE_TILT_X = 0.68;
      const BASE_TILT_Y = -0.48;
      const BASE_TILT_Z = 0.22;

      const dummyTorus = new THREE.Object3D();

      const cardShape = createRoundedRectShape(CARD_WIDTH, CARD_HEIGHT, CARD_CORNER_RADIUS);
      const cardGeometry = new THREE.ShapeGeometry(cardShape, 12);

      // Pre-render textures for the 5 Product cards
      const textures: THREE.CanvasTexture[] = [];
      for (let i = 0; i < 5; i++) {
        textures.push(createCardTexture(i));
      }

      interface CardSlotInfo {
        mesh: THREE.Mesh;
        localTargetPos: THREE.Vector3;
        localTargetQuat: THREE.Quaternion;
        startPos: THREE.Vector3;
        startQuat: THREE.Quaternion;
        sector: number;
        offsetK: number;
        isPrimary: boolean;
        index: number;
      }

      const cardSlots: CardSlotInfo[] = [];

      function createSlot(sector: number, offsetK: number, isPrimary: boolean, idx: number): CardSlotInfo {
        const theta = SECTOR_CENTERS[sector] + offsetK * ((2 * Math.PI) / TOTAL_CARDS);
        const texture = textures[sector % textures.length];
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
          roughness: 0.28,
          metalness: 0.65,
          transparent: true,
          opacity: 1,
          depthTest: true,
          depthWrite: true,
        });

        const mesh = new THREE.Mesh(cardGeometry, material);
        scene.add(mesh);

        // Position on circular ring of radius TORUS_RADIUS
        const x_ring = TORUS_RADIUS * Math.cos(theta);
        const y_ring = TORUS_RADIUS * Math.sin(theta);
        const z_ring = 0.16 * Math.sin(theta * 2);
        const localTargetPos = new THREE.Vector3(x_ring, y_ring, z_ring);

        // Transverse/radial orientation with spiral twist
        const dummyCard = new THREE.Object3D();
        dummyCard.position.copy(localTargetPos);
        dummyCard.rotation.z = theta - Math.PI / 2;
        dummyCard.rotation.x = 0.58;
        dummyCard.rotation.y = 0.24 * Math.cos(theta);
        dummyCard.updateMatrix();
        const localTargetQuat = dummyCard.quaternion.clone();

        return {
          mesh,
          localTargetPos,
          localTargetQuat,
          startPos: new THREE.Vector3(),
          startQuat: new THREE.Quaternion(),
          sector,
          offsetK,
          isPrimary,
          index: idx,
        };
      }

      // First, create the 5 primary cards (indices 0..4)
      for (let s = 0; s < 5; s++) {
        cardSlots.push(createSlot(s, 0, true, s));
      }

      // Then, create the 30 companion cards (indices 5..34)
      for (let s = 0; s < 5; s++) {
        for (const k of COMPANION_OFFSETS) {
          cardSlots.push(createSlot(s, k, false, cardSlots.length));
        }
      }

      // 4. Screen-to-World Coordinate Conversion for DOM Handoff
      function updateStartPositions() {
        const rects = getDomCardRects();
        const viewHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const viewWidth = viewHeight * camera.aspect;

        const defaultCardX = [-3.2, -1.6, 0.0, 1.6, 3.2];
        const defaultCardY = -0.5;

        if (rects && rects[2] && rects[2].height > 0) {
          const domWorldHeight = (rects[2].height / window.innerHeight) * viewHeight;
          domStartScaleRef.current = Math.max(1.0, Math.min(3.0, domWorldHeight / CARD_HEIGHT));
        }

        for (let s = 0; s < 5; s++) {
          let worldX = defaultCardX[s];
          let worldY = defaultCardY;
          let worldZ = 0;

          if (rects && rects[s] && rects[s].width > 0) {
            const r = rects[s];
            const centerX = r.left + r.width / 2;
            const centerY = r.top + r.height / 2;
            worldX = (centerX / window.innerWidth) * viewWidth - viewWidth / 2;
            worldY = -((centerY / window.innerHeight) * viewHeight - viewHeight / 2);
          }

          const rotY = (s - 2) * -0.08;
          const rotZ = (s - 2) * 0.02;
          const startEuler = new THREE.Euler(0, rotY, rotZ);

          cardSlots[s].startPos.set(worldX, worldY, worldZ);
          cardSlots[s].startQuat.setFromEuler(startEuler);
        }

        // Set companion cards to stack behind their parent primary card initially
        for (let i = 5; i < TOTAL_CARDS; i++) {
          const slot = cardSlots[i];
          const parent = cardSlots[slot.sector];
          slot.startPos.set(
            parent.startPos.x,
            parent.startPos.y,
            parent.startPos.z - 0.03 * Math.abs(slot.offsetK)
          );
          slot.startQuat.copy(parent.startQuat);
        }
      }

      updateStartPositions();

      // Smooth ease helper
      function easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      // 5. Continuous Render & Choreography Loop
      let animationFrameId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();
        const { progress, isAmbient } = animStateRef.current;

        // =====================================================================
        // CHOREOGRAPHY PHASES (Driven by master progress 0.0 -> 1.0)
        // =====================================================================
        // Phase 1: 5 Product cards bend into ring & 30 cards emerge (0.0 -> 0.40)
        // Phase 2: Full 360° Central Revolution of the dense ring (0.40 -> 0.70)
        // Phase 3: Smooth Glide to Left Dock (0.70 -> 1.00)
        // Phase 4: Ambient Floating Revolution at dock (progress >= 1.00)
        // =====================================================================

        const isMobile = width < 768;
        const targetDockX = isMobile ? 0 : -2.75;
        const targetDockY = isMobile ? 1.4 : 0;
        const targetDockScale = isMobile ? 0.72 : 0.82;

        let revolveAngle = 0;
        let currentDockX = 0;
        let currentDockY = 0;
        let currentScale = 1.0;

        if (progress <= 0.40) {
          revolveAngle = 0;
          currentDockX = 0;
          currentDockY = 0;
          currentScale = 1.0;
        } else if (progress <= 0.70) {
          const spinP = (progress - 0.40) / 0.30;
          revolveAngle = easeInOutCubic(spinP) * Math.PI * 2.0;
          currentDockX = 0;
          currentDockY = 0;
          currentScale = 1.0;
        } else {
          revolveAngle = Math.PI * 2.0;
          const dockP = easeInOutCubic(
            THREE.MathUtils.clamp((progress - 0.70) / 0.30, 0, 1)
          );
          currentDockX = THREE.MathUtils.lerp(0, targetDockX, dockP);
          currentDockY = THREE.MathUtils.lerp(0, targetDockY, dockP);
          currentScale = THREE.MathUtils.lerp(1.0, targetDockScale, dockP);
        }

        // Subtle ambient continuous revolution once docked
        if (isAmbient) {
          animStateRef.current.ambientRotation += delta * 0.28;
          currentDockY += Math.sin(elapsed * 1.5) * 0.08;
        }

        const curTiltX = BASE_TILT_X;
        const curTiltY = BASE_TILT_Y + revolveAngle + animStateRef.current.ambientRotation;
        const curTiltZ = BASE_TILT_Z;

        dummyTorus.position.set(currentDockX, currentDockY, 0);
        dummyTorus.scale.set(currentScale, currentScale, currentScale);
        dummyTorus.rotation.set(curTiltX, curTiltY, curTiltZ);
        dummyTorus.updateMatrixWorld(true);

        centralVoidLight.position.set(currentDockX, currentDockY, 0);

        // Position cards based on animation phase
        if (progress < 0.40) {
          const t = Math.max(0, Math.min(1, progress / 0.40));
          const e = easeInOutCubic(t);

          // 1. Position the 5 primary cards along curved 3D paths into the ring
          for (let s = 0; s < 5; s++) {
            const slot = cardSlots[s];
            const targetWorldPos = slot.localTargetPos.clone().applyMatrix4(dummyTorus.matrixWorld);
            const targetWorldQuat = dummyTorus.quaternion.clone().multiply(slot.localTargetQuat);

            // Dynamic arc bending: outer cards (0 & 4) lift up and flare out
            let arcUp = 0;
            let arcOut = 0;
            if (s === 0 || s === 4) {
              arcUp = Math.sin(t * Math.PI) * 1.6;
              arcOut = Math.sin(t * Math.PI) * (s === 0 ? -0.9 : 0.9);
            }

            slot.mesh.visible = true;
            slot.mesh.position.set(
              THREE.MathUtils.lerp(slot.startPos.x, targetWorldPos.x, e) + arcOut,
              THREE.MathUtils.lerp(slot.startPos.y, targetWorldPos.y, e) + arcUp,
              THREE.MathUtils.lerp(slot.startPos.z, targetWorldPos.z, e) + Math.sin(t * Math.PI) * 0.6
            );
            slot.mesh.quaternion.slerpQuaternions(slot.startQuat, targetWorldQuat, e);
            const curPrimaryScale = THREE.MathUtils.lerp(domStartScaleRef.current, 1.0, e);
            slot.mesh.scale.set(curPrimaryScale, curPrimaryScale, curPrimaryScale);

            const mat = slot.mesh.material as THREE.MeshStandardMaterial;
            if (mat) mat.opacity = 1.0;
          }

          // 2. Organically emerge companion cards from behind their primary cards
          for (let i = 5; i < TOTAL_CARDS; i++) {
            const slot = cardSlots[i];
            const parentSlot = cardSlots[slot.sector];
            const targetWorldPos = slot.localTargetPos.clone().applyMatrix4(dummyTorus.matrixWorld);
            const targetWorldQuat = dummyTorus.quaternion.clone().multiply(slot.localTargetQuat);

            // Stagger based on distance from primary card (|offsetK| is 1, 2, or 3)
            const stagger = (Math.abs(slot.offsetK) - 1) * 0.08;

            if (t < stagger) {
              slot.mesh.visible = false;
              slot.mesh.scale.set(0.001, 0.001, 0.001);
              const mat = slot.mesh.material as THREE.MeshStandardMaterial;
              if (mat) mat.opacity = 0;
            } else {
              slot.mesh.visible = true;
              const pComp = Math.min(1, (t - stagger) / (1 - stagger));
              const eComp = easeInOutCubic(pComp);

              // Fans out smoothly from current parent position to target slot
              slot.mesh.position.lerpVectors(parentSlot.mesh.position, targetWorldPos, eComp);
              slot.mesh.quaternion.slerpQuaternions(parentSlot.mesh.quaternion, targetWorldQuat, eComp);

              const compScale = THREE.MathUtils.lerp(0.2, 1.0, Math.min(1, pComp * 1.4));
              slot.mesh.scale.set(compScale, compScale, compScale);

              const mat = slot.mesh.material as THREE.MeshStandardMaterial;
              if (mat) {
                mat.opacity = THREE.MathUtils.clamp(pComp * 2.0, 0, 1.0);
              }
            }
          }
        } else {
          // All 35 cards are fully in place on the dense 3D Torus Ring
          for (let i = 0; i < TOTAL_CARDS; i++) {
            const slot = cardSlots[i];
            const targetWorldPos = slot.localTargetPos.clone().applyMatrix4(dummyTorus.matrixWorld);
            const targetWorldQuat = dummyTorus.quaternion.clone().multiply(slot.localTargetQuat);

            slot.mesh.visible = true;
            slot.mesh.position.copy(targetWorldPos);
            slot.mesh.quaternion.copy(targetWorldQuat);
            slot.mesh.scale.set(currentScale, currentScale, currentScale);

            const mat = slot.mesh.material as THREE.MeshStandardMaterial;
            if (mat) mat.opacity = 1.0;
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !canvas) return;
        width = container.clientWidth || window.innerWidth;
        height = container.clientHeight || window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        updateStartPositions();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);

        cardGeometry.dispose();
        textures.forEach((t) => t.dispose());
        cardSlots.forEach((slot) => {
          if (slot.mesh.material instanceof THREE.Material) {
            slot.mesh.material.dispose();
          }
        });
        renderer.dispose();
      };
    }, [getDomCardRects, mounted]);

    if (!mounted) return null;

    return createPortal(
      <div
        ref={containerRef}
        id="card-sculpture-stage"
        className="fixed inset-0 w-full h-full pointer-events-none z-35 overflow-hidden select-none"
        style={{ visibility: "hidden", opacity: 0, transition: "none" }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>,
      document.body
    );
  }
);
