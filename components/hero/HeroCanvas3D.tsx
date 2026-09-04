"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "@/lib/gsap";

export function HeroCanvas3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect reduced motion preference
    const reducedMotion = prefersReducedMotion();

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 11.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Master Scene Group (for parallax and centering)
    const worldGroup = new THREE.Group();
    // Offset slightly to the right to leave space for left headline text
    worldGroup.position.set(1.4, 0, 0);
    scene.add(worldGroup);

    // =========================================================================
    // 1. LIGHTING (Editorial, Sculptural, Moody)
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(6, 8, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x88bb99, 1.2);
    fillLight.position.set(-8, -4, 4);
    scene.add(fillLight);

    // Glowing Emerald Accent Light emanating from the Ring
    const emeraldPointLight = new THREE.PointLight(0x22c55e, 3.8, 12, 1.5);
    emeraldPointLight.position.set(0.6, 0.8, 1.2);
    worldGroup.add(emeraldPointLight);

    // =========================================================================
    // 2. THE SCULPTURAL 3D UNIFOLIO RING (Physical, Segmented, Tilted)
    // =========================================================================
    const ringGroup = new THREE.Group();
    ringGroup.rotation.set(0.32, -0.42, 0.14);
    worldGroup.add(ringGroup);

    const RING_RADIUS = 2.3;
    const TUBE_RADIUS = 0.32;
    const RADIAL_SEGMENTS = 32;
    const TUBULAR_SEGMENTS = 120;

    // Segment 1: Dark Obsidian/Graphite Body (approx 260 degrees)
    const darkBodyGeo = new THREE.TorusGeometry(
      RING_RADIUS,
      TUBE_RADIUS,
      RADIAL_SEGMENTS,
      TUBULAR_SEGMENTS,
      Math.PI * 1.45
    );
    const darkBodyMat = new THREE.MeshStandardMaterial({
      color: 0x141618,
      roughness: 0.28,
      metalness: 0.82,
    });
    const darkBodyMesh = new THREE.Mesh(darkBodyGeo, darkBodyMat);
    darkBodyMesh.rotation.z = Math.PI * 0.35;
    ringGroup.add(darkBodyMesh);

    // Segment 2: Signature Unifolio Emerald Luminous Arc (approx 100 degrees)
    const greenArcGeo = new THREE.TorusGeometry(
      RING_RADIUS,
      TUBE_RADIUS * 1.02,
      RADIAL_SEGMENTS,
      TUBULAR_SEGMENTS,
      Math.PI * 0.65
    );
    const greenArcMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.85,
      roughness: 0.18,
      metalness: 0.35,
    });
    const greenArcMesh = new THREE.Mesh(greenArcGeo, greenArcMat);
    greenArcMesh.rotation.z = Math.PI * 1.78;
    ringGroup.add(greenArcMesh);

    // Subtle Internal Glass Core ring
    const innerRingGeo = new THREE.TorusGeometry(
      RING_RADIUS * 0.94,
      0.02,
      16,
      80
    );
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    ringGroup.add(innerRingMesh);

    // =========================================================================
    // 3. TEXTURES FOR CARDS & PROCEDURAL DOCUMENTS
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();
    const cardTexturePaths = [
      "/cards/card-1.png",
      "/cards/card-2.png",
      "/cards/card-3.png",
      "/cards/card-4.png",
      "/cards/card-5.png",
      "/cards/card-6.png",
    ];

    const cardTextures = cardTexturePaths.map((path) => {
      const tex = textureLoader.load(path);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      return tex;
    });

    // Helper: Create procedural minimal document texture
    const createDocTexture = (title: string, linesCount: number, hasMetric = false) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 700;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Dark card surface
      ctx.fillStyle = "#0c0e11";
      ctx.fillRect(0, 0, 512, 700);

      // Subtle hairline border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, 500, 688);

      // Header icon / dot
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(48, 48, 8, 0, Math.PI * 2);
      ctx.fill();

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText(title, 72, 56);

      // Editorial lines
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      for (let i = 0; i < linesCount; i++) {
        const lineY = 120 + i * 36;
        const width = 380 - (i % 3) * 60;
        ctx.fillRect(48, lineY, width, 8);
      }

      // Metric Highlight (if any)
      if (hasMetric) {
        ctx.strokeStyle = "rgba(34, 197, 94, 0.35)";
        ctx.strokeRect(48, 480, 416, 140);
        ctx.fillStyle = "#22c55e";
        ctx.font = "bold 42px monospace";
        ctx.fillText("₹1.48Cr", 72, 550);
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "18px monospace";
        ctx.fillText("OPTIMISED ALLOCATION", 72, 585);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      return texture;
    };

    const docTextures = [
      createDocTexture("PORTFOLIO VALUATION", 8, true),
      createDocTexture("EXPENSE RATIO (TER)", 10, false),
      createDocTexture("AUTONOMOUS LEDGER", 7, true),
      createDocTexture("MULTI-PAN HARVEST", 9, false),
    ].filter(Boolean) as THREE.CanvasTexture[];

    // =========================================================================
    // 4. THE "SCATTERED → COLLECTED → ORGANISED" DYNAMIC OBJECT SYSTEM
    // =========================================================================
    interface PortfolioItem {
      mesh: THREE.Mesh;
      baseScale: number;
      cycleOffset: number; // 0 to 1 offset in master cycle
      speed: number;
      incomingY: number;
      incomingZ: number;
      incomingRot: THREE.Euler;
      organizedSlot: { x: number; y: number; z: number };
    }

    const items: PortfolioItem[] = [];
    const TOTAL_ITEMS = 22;

    // Card & Sheet Geometries
    const cardGeo = new THREE.PlaneGeometry(1.6, 2.15);
    const docGeo = new THREE.PlaneGeometry(1.45, 1.95);
    const smallTileGeo = new THREE.PlaneGeometry(1.2, 1.2);

    for (let i = 0; i < TOTAL_ITEMS; i++) {
      let geo = cardGeo;
      let mat: THREE.Material;

      const type = i % 3;
      if (type === 0) {
        // Texture from Cards
        geo = cardGeo;
        const tex = cardTextures[i % cardTextures.length];
        mat = new THREE.MeshStandardMaterial({
          map: tex,
          side: THREE.DoubleSide,
          roughness: 0.4,
          metalness: 0.1,
          transparent: true,
          opacity: 0.96,
        });
      } else if (type === 1) {
        // Procedural Document Sheet
        geo = docGeo;
        const tex = docTextures[i % docTextures.length];
        mat = new THREE.MeshStandardMaterial({
          map: tex,
          side: THREE.DoubleSide,
          roughness: 0.3,
          metalness: 0.15,
          transparent: true,
          opacity: 0.92,
        });
      } else {
        // Minimal Dark Grid Tile
        geo = smallTileGeo;
        mat = new THREE.MeshStandardMaterial({
          color: 0x111317,
          roughness: 0.35,
          metalness: 0.7,
          side: THREE.DoubleSide,
        });
      }

      const mesh = new THREE.Mesh(geo, mat);
      worldGroup.add(mesh);

      // Organized destination position on the right:
      // Arrange into clean 3-column / 3-row structured strata with subtle stacking depth
      const row = i % 4;
      const col = Math.floor(i / 4) % 3;
      const stackDepth = (i % 2) * 0.15;
      const targetOrganizedX = 2.8 + col * 1.55;
      const targetOrganizedY = (row - 1.5) * 1.35;
      const targetOrganizedZ = stackDepth - 0.2;

      items.push({
        mesh,
        baseScale: 0.95 + (i % 3) * 0.1,
        cycleOffset: i / TOTAL_ITEMS,
        speed: 0.085 + (i % 4) * 0.012,
        incomingY: (Math.random() - 0.5) * 6.5,
        incomingZ: (Math.random() - 0.5) * 5.5,
        incomingRot: new THREE.Euler(
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 2.2
        ),
        organizedSlot: {
          x: targetOrganizedX,
          y: targetOrganizedY,
          z: targetOrganizedZ,
        },
      });
    }

    // =========================================================================
    // 5. INTERACTION & MOUSE PARALLAX CONTROLLER
    // =========================================================================
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 0.45;
      targetMouseY = y * 0.35;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      // Adjust camera distance for mobile vs desktop
      if (newWidth < 768) {
        camera.position.z = 14.5;
        worldGroup.position.set(0, -0.6, 0);
      } else {
        camera.position.z = 11.5;
        worldGroup.position.set(1.4, 0, 0);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Visibility observer to pause loop when off-screen
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // =========================================================================
    // 6. CONTINUOUS TICKER & CHOREOGRAPHY LOOP
    // =========================================================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera & Mouse Parallax Smooth Interpolation
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      camera.position.x = currentMouseX * 1.5;
      camera.position.y = currentMouseY * 1.2;
      camera.lookAt(worldGroup.position.x * 0.2, 0, 0);

      // Subtle Idle Ring Breathing
      ringGroup.rotation.y = -0.42 + Math.sin(elapsed * 0.5) * 0.08;
      ringGroup.rotation.x = 0.32 + Math.cos(elapsed * 0.4) * 0.05;
      ringGroup.position.y = Math.sin(elapsed * 0.8) * 0.08;

      // Update each item through the 3 phases:
      // Phase 0 -> 0.35 : Scattered (Incoming from left / depth with chaotic tilt)
      // Phase 0.35 -> 0.60 : Ring Interaction (Approaching / passing through ring aperture)
      // Phase 0.60 -> 1.00 : Organised (Snapping into aligned, clean composition on right)
      items.forEach((item, idx) => {
        let p = (elapsed * item.speed + item.cycleOffset) % 1.0;

        let posX = 0;
        let posY = 0;
        let posZ = 0;
        let rotX = 0;
        let rotY = 0;
        let rotZ = 0;
        let scale = item.baseScale;
        let opacity = 1;

        if (p < 0.35) {
          // --- STAGE 1: SCATTERED (INCOMING) ---
          const stageP = p / 0.35; // 0 to 1
          // Travel from x: -7.5 toward x: -1.6
          posX = THREE.MathUtils.lerp(-7.5, -1.6, stageP);
          // Gently curving path toward ring center
          posY = THREE.MathUtils.lerp(item.incomingY, 0, stageP * 0.7);
          posZ = THREE.MathUtils.lerp(item.incomingZ, (idx % 2 === 0 ? 0.6 : -0.6), stageP);

          // Tumble rotation
          rotX = item.incomingRot.x + stageP * 0.8;
          rotY = item.incomingRot.y + stageP * 1.2;
          rotZ = item.incomingRot.z + stageP * 0.6;

          // Fade in smoothly as it enters from deep left
          opacity = THREE.MathUtils.clamp(stageP * 2.5, 0, 1);
        } else if (p < 0.6) {
          // --- STAGE 2: RING PROCESSING & APERTURE PASSAGE ---
          const stageP = (p - 0.35) / 0.25; // 0 to 1
          // Moves through the center of the ring: x: -1.6 to +1.8
          posX = THREE.MathUtils.lerp(-1.6, 1.8, stageP);
          // Passing directly through ring zone with gentle magnetic pull
          posY = THREE.MathUtils.lerp(0, item.organizedSlot.y * 0.4, stageP);
          // Half pass in front, half pass directly through aperture
          const depthOffset = (idx % 2 === 0 ? 0.45 : -0.35);
          posZ = THREE.MathUtils.lerp(depthOffset, item.organizedSlot.z, stageP);

          // Rotations start harmonizing and damping down toward flat 0
          rotX = THREE.MathUtils.lerp(item.incomingRot.x * 0.4, 0, stageP);
          rotY = THREE.MathUtils.lerp(item.incomingRot.y * 0.4, 0, stageP);
          rotZ = THREE.MathUtils.lerp(item.incomingRot.z * 0.4, 0, stageP);

          // Subtle luminous pulse as it crosses the green ring threshold
          scale = item.baseScale * (1 + Math.sin(stageP * Math.PI) * 0.12);
        } else {
          // --- STAGE 3: ORGANISED (OUTGOING) ---
          const stageP = (p - 0.6) / 0.4; // 0 to 1
          // Settles into aligned, disciplined strata
          posX = THREE.MathUtils.lerp(1.8, item.organizedSlot.x + stageP * 1.4, stageP);
          posY = item.organizedSlot.y;
          posZ = item.organizedSlot.z;

          // Completely aligned flat orientation — Chaos turned into clarity
          rotX = 0;
          rotY = 0;
          rotZ = 0;

          // Soft dissolve as it exits the right edge to loop back cleanly
          if (stageP > 0.8) {
            opacity = 1 - (stageP - 0.8) * 5;
          }
        }

        item.mesh.position.set(posX, posY, posZ);
        item.mesh.rotation.set(rotX, rotY, rotZ);
        item.mesh.scale.set(scale, scale, scale);

        const mat = item.mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.opacity = opacity;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // =========================================================================
    // CLEANUP
    // =========================================================================
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();

      // Dispose Three.js resources
      darkBodyGeo.dispose();
      darkBodyMat.dispose();
      greenArcGeo.dispose();
      greenArcMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      cardGeo.dispose();
      docGeo.dispose();
      smallTileGeo.dispose();

      cardTextures.forEach((t) => t.dispose());
      docTextures.forEach((t) => t.dispose());

      items.forEach((item) => {
        if (Array.isArray(item.mesh.material)) {
          item.mesh.material.forEach((m) => m.dispose());
        } else {
          item.mesh.material.dispose();
        }
        item.mesh.geometry.dispose();
      });

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-10"
      style={{ touchAction: "none" }}
    />
  );
}
