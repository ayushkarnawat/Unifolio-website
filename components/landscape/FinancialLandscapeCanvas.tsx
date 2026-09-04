"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/components/theme/ThemeProvider";

interface FinancialLandscapeCanvasProps {
  scrollProgress: number; // 0 to 1
  activeChapter: number; // 0 to 6
  interactivePromptIndex?: number;
  className?: string;
}

// Stage asset metadata with accurate aspect ratios:
// Stage 1: 1536x1024 (1.50)
// Stage 2: 1536x1024 (1.50)
// Stage 3: 523x424 (1.233)
// Stage 4: 531x389 (1.365)
// Stage 5: 485x371 (1.307)
// Stage 6: 529x401 (1.319)
const STAGE_ASSETS = [
  { url: "/Product Page Assets/Stage 1.png", aspect: 1.500, baseScale: 1.0 },
  { url: "/Product Page Assets/Stage 2.png", aspect: 1.500, baseScale: 1.0 },
  { url: "/Product Page Assets/Stage 3.png", aspect: 1.233, baseScale: 1.06 },
  { url: "/Product Page Assets/STage 4.png", aspect: 1.365, baseScale: 1.03 },
  { url: "/Product Page Assets/Stage 5.png", aspect: 1.307, baseScale: 1.04 },
  { url: "/Product Page Assets/Stage 6.png", aspect: 1.319, baseScale: 1.06 },
];

export function FinancialLandscapeCanvas({
  scrollProgress,
  activeChapter,
  interactivePromptIndex = 0,
  className = "",
}: FinancialLandscapeCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State refs for the Three.js RAF loop
  const progressRef = useRef(scrollProgress);
  const chapterRef = useRef(activeChapter);
  const isDarkRef = useRef(isDark);
  const promptIndexRef = useRef(interactivePromptIndex);

  // Mouse coords for subtle tactile dimensional tilt
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    chapterRef.current = activeChapter;
  }, [activeChapter]);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    promptIndexRef.current = interactivePromptIndex;
  }, [interactivePromptIndex]);

  // Track mouse movements for gentle spatial parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseRef.current.targetX = (e.clientX - halfW) / halfW;
      mouseRef.current.targetY = (e.clientY - halfH) / halfH;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animFrameId = 0;
    let isDisposed = false;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Perspective camera with natural architectural focal length (38 deg FOV)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 16.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // --- MASTER DIMENSIONAL RIG ---
    // Holds the island meshes and handles slow rotation, tilt, and hover
    const worldRig = new THREE.Group();
    scene.add(worldRig);

    // --- TEXTURE PRELOADING & MESH CREATION ---
    const textureLoader = new THREE.TextureLoader();
    const stageMeshes: THREE.Mesh[] = [];
    const stageMaterials: THREE.MeshBasicMaterial[] = [];

    // Base plane height chosen to provide ample negative space and prevent colliding with typography
    const basePlaneHeight = 4.85;

    STAGE_ASSETS.forEach((asset, idx) => {
      const planeWidth = basePlaneHeight * asset.aspect * asset.baseScale;
      const planeHeight = basePlaneHeight * asset.baseScale;

      const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1, 1);

      const texture = textureLoader.load(asset.url, () => {
        if (!isDisposed) renderer.render(scene, camera);
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: idx === 0 ? 1 : 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, idx * 0.004); // minute z-offset to prevent z-fighting
      worldRig.add(mesh);

      stageMeshes.push(mesh);
      stageMaterials.push(material);
    });

    // --- DAMPED MOTION STATE (INERTIA SIMULATION) ---
    // Start at +2.75 on the right for intimate, balanced composition with the opening text on the left
    let currentRigX = 2.75;
    let currentRigY = 0.0;
    let currentRotX = -0.11;
    let currentRotY = 0.06;
    let currentRotZ = 0.0;
    let currentScale = 1.0;

    const opacities = [1, 0, 0, 0, 0, 0];

    const clock = new THREE.Clock();

    // --- SYNCHRONIZED TIMELINE INTERVALS ---
    // Exact match with FinancialLandscapeExperience typography timeline:
    // Stage 0 (Opening):      Dwell 0.00 -> 0.10, Transition 0.10 -> 0.15
    // Stage 1 (Ask):          Dwell 0.15 -> 0.25, Transition 0.25 -> 0.30
    // Stage 2 (See All):      Dwell 0.30 -> 0.40, Transition 0.40 -> 0.45
    // Stage 3 (Understand):   Dwell 0.45 -> 0.55, Transition 0.55 -> 0.60
    // Stage 4 (Risk):         Dwell 0.60 -> 0.70, Transition 0.70 -> 0.75
    // Stage 5 (Plan Ahead):   Dwell 0.75 -> 0.85, Transition 0.85 -> 0.90
    // Stage 6 (Closing):      Dwell 0.90 -> 1.00
    const TRANSITIONS = [
      { start: 0.10, end: 0.15, from: 0, to: 1 },
      { start: 0.25, end: 0.30, from: 1, to: 2 },
      { start: 0.40, end: 0.45, from: 2, to: 3 },
      { start: 0.55, end: 0.60, from: 3, to: 4 },
      { start: 0.70, end: 0.75, from: 4, to: 5 },
      { start: 0.85, end: 0.90, from: 5, to: 5 }, // Stage 6 visual resolves into Closing
    ];

    // --- ANIMATION LOOP ---
    const animate = () => {
      if (isDisposed) return;
      animFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const p = progressRef.current;
      const promptIdx = promptIndexRef.current;

      // 1. Smooth mouse coordinate interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // 2. Compute Target Lateral Position & Dynamic Angle based on scroll:
      // Visual coordinates (±2.75 units): Perfectly balanced between intimacy and negative space
      let targetRigX = 2.75;
      let targetRigY = 0.0;
      let targetRotY = 0.06;
      let targetRotX = -0.11;
      let targetScaleFactor = 1.0;

      if (p < 0.10) {
        // Stage 0 (Opening) - Visual Right (+2.75), Text Left
        targetRigX = 2.75;
        targetRigY = 0.05;
        targetRotY = 0.05;
        targetRotX = -0.09;
        targetScaleFactor = 1.0;
      } else if (p < 0.15) {
        // Transition 0 -> 1 (Both visual and text glide synchronously)
        const t = (p - 0.10) / 0.05;
        targetRigX = 2.75;
        targetRigY = THREE.MathUtils.lerp(0.05, 0.0, t);
        targetRotY = THREE.MathUtils.lerp(0.05, 0.10, t);
        targetRotX = THREE.MathUtils.lerp(-0.09, -0.08, t);
      } else if (p < 0.25) {
        // Stage 1 (Ask) - Visual Right (+2.75), Text Left
        targetRigX = 2.75;
        targetRigY = 0.0;
        targetRotY = 0.10 + promptIdx * 0.025;
        targetRotX = -0.08 - promptIdx * 0.015;
        targetScaleFactor = 1.01;
      } else if (p < 0.30) {
        // Transition 1 -> 2 (Visual glides from Right to Left, synchronized with text)
        const t = (p - 0.25) / 0.05;
        targetRigX = THREE.MathUtils.lerp(2.75, -2.75, t);
        targetRigY = THREE.MathUtils.lerp(0.0, 0.05, t);
        targetRotY = THREE.MathUtils.lerp(0.10, -0.08, t);
        targetRotX = THREE.MathUtils.lerp(-0.08, -0.10, t);
      } else if (p < 0.40) {
        // Stage 2 (See Everything) - Visual Left (-2.75), Text Right
        targetRigX = -2.75;
        targetRigY = 0.05;
        targetRotY = -0.08;
        targetRotX = -0.10;
        targetScaleFactor = 1.02;
      } else if (p < 0.45) {
        // Transition 2 -> 3 (Visual glides from Left to Right, synchronized with text)
        const t = (p - 0.40) / 0.05;
        targetRigX = THREE.MathUtils.lerp(-2.75, 2.75, t);
        targetRigY = THREE.MathUtils.lerp(0.05, -0.05, t);
        targetRotY = THREE.MathUtils.lerp(-0.08, 0.08, t);
        targetRotX = THREE.MathUtils.lerp(-0.10, -0.12, t);
      } else if (p < 0.55) {
        // Stage 3 (Understand What You Own) - Visual Right (+2.75), Text Left
        targetRigX = 2.75;
        targetRigY = -0.05;
        targetRotY = 0.08;
        targetRotX = -0.12;
        targetScaleFactor = 1.02;
      } else if (p < 0.60) {
        // Transition 3 -> 4 (Visual glides from Right to Left, synchronized with text)
        const t = (p - 0.55) / 0.05;
        targetRigX = THREE.MathUtils.lerp(2.75, -2.75, t);
        targetRigY = THREE.MathUtils.lerp(-0.05, -0.05, t);
        targetRotY = THREE.MathUtils.lerp(0.08, -0.10, t);
        targetRotX = THREE.MathUtils.lerp(-0.12, -0.09, t);
      } else if (p < 0.70) {
        // Stage 4 (Know Your Risk) - Visual Left (-2.75), Text Right
        targetRigX = -2.75;
        targetRigY = -0.05;
        targetRotY = -0.10;
        targetRotX = -0.09;
        targetScaleFactor = 1.03;
      } else if (p < 0.75) {
        // Transition 4 -> 5 (Visual glides from Left to Right, synchronized with text)
        const t = (p - 0.70) / 0.05;
        targetRigX = THREE.MathUtils.lerp(-2.75, 2.75, t);
        targetRigY = THREE.MathUtils.lerp(-0.05, 0.05, t);
        targetRotY = THREE.MathUtils.lerp(-0.10, 0.06, t);
        targetRotX = THREE.MathUtils.lerp(-0.09, -0.08, t);
      } else if (p < 0.85) {
        // Stage 5 (Plan Ahead) - Visual Right (+2.75), Text Left
        targetRigX = 2.75;
        targetRigY = 0.05;
        targetRotY = 0.06;
        targetRotX = -0.08;
        targetScaleFactor = 1.03;
      } else if (p < 0.90) {
        // Transition into Closing: Visual 5 smoothly dissolves away into the distance
        const t = (p - 0.85) / 0.05;
        targetRigX = THREE.MathUtils.lerp(2.75, 3.2, t);
        targetRigY = THREE.MathUtils.lerp(0.05, 0.12, t);
        targetRotY = THREE.MathUtils.lerp(0.06, 0.04, t);
        targetRotX = THREE.MathUtils.lerp(-0.08, -0.05, t);
        targetScaleFactor = THREE.MathUtils.lerp(1.03, 0.94, t);
      } else {
        // Stage 6 (Closing): Fully transitioned out. Complete visual silence.
        targetRigX = 3.2;
        targetRigY = 0.12;
        targetRotY = 0.04;
        targetRotX = -0.05;
        targetScaleFactor = 0.94;
      }

      // 3. Compute Synchronized Target Opacities:
      // Exact zero-lag alignment with the transition intervals
      const targetOpacities = [0, 0, 0, 0, 0, 0];

      if (p < 0.10) {
        targetOpacities[0] = 1;
      } else if (p < 0.15) {
        const t = (p - 0.10) / 0.05;
        targetOpacities[0] = 1 - t;
        targetOpacities[1] = t;
      } else if (p < 0.25) {
        targetOpacities[1] = 1;
      } else if (p < 0.30) {
        const t = (p - 0.25) / 0.05;
        targetOpacities[1] = 1 - t;
        targetOpacities[2] = t;
      } else if (p < 0.40) {
        targetOpacities[2] = 1;
      } else if (p < 0.45) {
        const t = (p - 0.40) / 0.05;
        targetOpacities[2] = 1 - t;
        targetOpacities[3] = t;
      } else if (p < 0.55) {
        targetOpacities[3] = 1;
      } else if (p < 0.60) {
        const t = (p - 0.55) / 0.05;
        targetOpacities[3] = 1 - t;
        targetOpacities[4] = t;
      } else if (p < 0.70) {
        targetOpacities[4] = 1;
      } else if (p < 0.75) {
        const t = (p - 0.70) / 0.05;
        targetOpacities[4] = 1 - t;
        targetOpacities[5] = t;
      } else if (p < 0.85) {
        targetOpacities[5] = 1;
      } else if (p < 0.90) {
        // Dissolve visual out completely as user enters closing statement
        const t = (p - 0.85) / 0.05;
        targetOpacities[5] = 1 - t;
      } else {
        // Closing statement: All visuals completely transparent (0 opacity)
        // Leaving the closing section completely clean, spacious, and quiet
      }

      // 4. Synchronous Application (Direct tracking of GSAP scrubbed progress):
      // Because ScrollTrigger's scrub: 1.0 already smooths `p` with physical momentum,
      // direct tracking guarantees 100% frame-perfect synchronization with the editorial text.
      currentRigX = targetRigX;
      currentRigY = targetRigY;
      currentRotY = targetRotY;
      currentRotX = targetRotX;
      currentScale = targetScaleFactor;

      // Completely hide 3D world rig and canvas in the closing section
      const isClosingSection = p >= 0.88;
      worldRig.visible = !isClosingSection;
      if (renderer.domElement) {
        renderer.domElement.style.opacity = isClosingSection ? "0" : "1";
      }

      for (let i = 0; i < 6; i++) {
        stageMaterials[i].opacity = targetOpacities[i];
      }

      // 5. Subtle Kinetic Idle Life (Breathing / Floating Hover):
      const hoverY = Math.sin(time * 1.3) * 0.09;
      const hoverRotZ = Math.cos(time * 0.9) * 0.012;
      const hoverRotX = Math.sin(time * 1.1) * 0.009;

      // 6. Interactive Cursor Parallax:
      const mouseTiltX = -mouseRef.current.y * 0.06;
      const mouseTiltY = mouseRef.current.x * 0.09;

      // 7. Apply to Master Rig:
      worldRig.position.x = currentRigX + mouseRef.current.x * 0.18;
      worldRig.position.y = currentRigY + hoverY - mouseRef.current.y * 0.10;
      worldRig.rotation.x = currentRotX + hoverRotX + mouseTiltX;
      worldRig.rotation.y = currentRotY + mouseTiltY;
      worldRig.rotation.z = currentRotZ + hoverRotZ;
      worldRig.scale.setScalar(currentScale);

      if (!isClosingSection) {
        renderer.render(scene, camera);
      } else {
        renderer.clear();
      }
    };

    animate();

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!container || isDisposed) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;

      // Adapt camera distance for mobile/tablet viewports so the sculptural island fits nicely
      if (newW < 768) {
        camera.position.z = 19.5;
      } else if (newW < 1200) {
        camera.position.z = 17.5;
      } else {
        camera.position.z = 16.0;
      }

      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // --- CLEANUP ---
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);

      stageMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
      });
      stageMaterials.forEach((mat) => {
        if (mat.map) mat.map.dispose();
        mat.dispose();
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full pointer-events-none select-none ${className}`}
    />
  );
}
