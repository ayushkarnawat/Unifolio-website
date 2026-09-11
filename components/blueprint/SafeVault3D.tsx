"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
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

export const SafeVault3D = forwardRef<SafeVault3DRef, SafeVault3DProps>(
  function SafeVault3D({ className = "" }, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const floatGroupRef = useRef<HTMLDivElement | null>(null);
    const closedDoorGroupRef = useRef<HTMLDivElement | null>(null);
    const discRef = useRef<HTMLImageElement | null>(null);
    const openChamberRef = useRef<HTMLDivElement | null>(null);

    const animProgressRef = useRef<number>(0);
    const rimSecurityAngleRef = useRef<number>(0);
    const rimTweenRef = useRef<gsap.core.Tween | null>(null);
    const floatTweenRef = useRef<gsap.core.Tween | null>(null);
    const rockTweenRef = useRef<gsap.core.Tween | null>(null);

    // KINEMATICS:
    // 1. Unlock phase (0.00 -> 0.26): Inner locking disc rotates clockwise (+26°) to UNLOCK.
    // 2. Door swing phase (0.26 -> 1.00): Closed door unseats and swings to the LEFT around the hinge.
    //    Open chamber sketch reveals behind it with full perspective open door matching the asset.
    // 3. Closing (1.00 -> 0.00): Door swings back to the right, seats flush, and disc rotates back anticlockwise.
    const updateDoorMotion = (p: number) => {
      animProgressRef.current = p;
      const clampP = Math.max(0, Math.min(1, p));
      const closedDoor = closedDoorGroupRef.current;
      const disc = discRef.current;
      const openChamber = openChamberRef.current;
      if (!closedDoor || !disc || !openChamber) return;

      const P_UNLOCK = 0.26;

      if (clampP <= P_UNLOCK) {
        // Stage 1: Rotate locking disc clockwise to unlock as user scrolls down
        const u = clampP / P_UNLOCK;
        const easeU = u * u * (3 - 2 * u);
        const currentAngle = rimSecurityAngleRef.current + 26 * easeU;

        gsap.set(disc, {
          rotate: currentAngle,
          transformOrigin: "50% 50%",
        });

        gsap.set(closedDoor, {
          x: 0,
          z: 0,
          rotateY: 0,
          opacity: 1,
          visibility: "visible",
        });

        gsap.set(openChamber, {
          opacity: 0,
          visibility: "hidden",
        });
      } else {
        // Stage 2: Door swings open to the LEFT around the hinge
        const t = (clampP - P_UNLOCK) / (1 - P_UNLOCK);
        const easeT = Math.sin(t * Math.PI * 0.5);

        // Keep disc at unlocked rotation
        gsap.set(disc, {
          rotate: rimSecurityAngleRef.current + 26,
          transformOrigin: "50% 50%",
        });

        // Subtle mechanical settle near the end of swing
        let settle = 0;
        if (t > 0.72) {
          const s = Math.min(1, Math.max(0, (t - 0.72) / 0.28));
          settle = 3.2 * Math.sin(s * Math.PI) * (1 - s * 0.3);
        }

        const swingAngle = -78 * easeT - settle; // Swings to the LEFT
        const unseatX = -28 * easeT;
        const unseatZ = 35 * Math.sin(t * Math.PI);

        gsap.set(closedDoor, {
          transformOrigin: "8% 50%", // Left hinge
          rotateY: swingAngle,
          x: unseatX,
          z: unseatZ,
          opacity: t > 0.65 ? Math.max(0, 1 - (t - 0.65) / 0.28) : 1,
          visibility: t >= 0.96 ? "hidden" : "visible",
        });

        // Open chamber becomes visible as door begins swinging
        const openOpacity = Math.min(1, t / 0.45);
        gsap.set(openChamber, {
          opacity: openOpacity,
          visibility: openOpacity > 0 ? "visible" : "hidden",
        });
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        setOpenProgress: (progress: number) => {
          updateDoorMotion(progress);
        },
        setCardsProgress: () => {
          // Controlled via DOM card choreography in BlueprintHero
        },
        triggerRimStep: (direction: 1 | -1 = 1, stateIndex?: number) => {
          const STEP_ANGLE = 22.5; // 22.5° discrete step per security tab
          let targetAngle: number;
          if (stateIndex !== undefined) {
            // Scrolling down (increasing stateIndex): CLOCKWISE rotation (+angle)
            // Scrolling up (decreasing stateIndex): ANTICLOCKWISE rotation (-angle)
            targetAngle = stateIndex * STEP_ANGLE;
          } else {
            targetAngle = rimSecurityAngleRef.current + (direction === 1 ? STEP_ANGLE : -STEP_ANGLE);
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
              if (discRef.current && animProgressRef.current <= 0.26) {
                const u = animProgressRef.current / 0.26;
                const easeU = u * u * (3 - 2 * u);
                gsap.set(discRef.current, {
                  rotate: proxy.angle + 26 * easeU,
                  transformOrigin: "50% 50%",
                });
              }
            },
          });
        },
        resetRim: () => {
          if (rimTweenRef.current) {
            rimTweenRef.current.kill();
          }
          rimSecurityAngleRef.current = 0;
          if (discRef.current && animProgressRef.current <= 0.26) {
            gsap.set(discRef.current, {
              rotate: 0,
              transformOrigin: "50% 50%",
            });
          }
        },
      }),
      []
    );

    useEffect(() => {
      const floatEl = floatGroupRef.current;
      if (!floatEl) return;

      // Subtle ambient floating and drifting motion matching luxury aesthetic
      floatTweenRef.current = gsap.to(floatEl, {
        y: -6,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      rockTweenRef.current = gsap.to(floatEl, {
        rotate: -0.65,
        duration: 4.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Initial state: closed and locked
      updateDoorMotion(0);

      return () => {
        floatTweenRef.current?.kill();
        rockTweenRef.current?.kill();
        rimTweenRef.current?.kill();
      };
    }, []);

    return (
      <div
        ref={rootRef}
        className={`relative flex items-center justify-center overflow-visible select-none pointer-events-none ${className}`}
        style={{ perspective: "1400px" }}
      >
        {/* Ambient floating container */}
        <div
          ref={floatGroupRef}
          className="relative w-full h-full flex items-center justify-center overflow-visible will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* LAYER 1: OPEN VAULT CHAMBER SKETCH
              Chamber circle is aligned at (50%, 50%) of container.
              Door swings open to the LEFT out to the left margin. */}
          <div
            ref={openChamberRef}
            className="absolute top-0 h-full overflow-visible pointer-events-none will-change-[opacity,transform]"
            style={{
              // Open asset is 1024x770. Chamber circle center is at 614/1024 = 59.96% from left.
              // Aligning center (614px, 385px) to (50%, 50%):
              left: "50%",
              top: "50%",
              width: "calc(100% * (1024 / 770))",
              height: "100%",
              transform: "translate(-59.96%, -50%)",
              opacity: 0,
              visibility: "hidden",
            }}
          >
            <img
              src="/sketch-vault-open.png"
              alt="Security Vault Open Chamber"
              className="w-full h-full object-contain filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.14)]"
              draggable={false}
            />
          </div>

          {/* LAYER 2: CLOSED VAULT DOOR ASSEMBLY
              Hinged at the left, swings open to the left with 3D perspective. */}
          <div
            ref={closedDoorGroupRef}
            className="absolute top-0 h-full overflow-visible pointer-events-none will-change-[opacity,transform]"
            style={{
              // Closed asset is 820x770. Circle center is at 410/820 = 50%.
              left: "50%",
              top: "50%",
              width: "calc(100% * (820 / 770))",
              height: "100%",
              transform: "translate(-50%, -50%)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Outer stationary bolted frame with hinge */}
            <img
              src="/sketch-vault-frame.png"
              alt="Security Vault Outer Frame"
              className="absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_22px_50px_rgba(0,0,0,0.16)]"
              draggable={false}
            />

            {/* Inner rotating locking wheel & dial disc */}
            <img
              ref={discRef}
              src="/sketch-vault-disc.png"
              alt="Security Vault Locking Disc"
              className="absolute inset-0 w-full h-full object-contain will-change-transform"
              style={{ transformOrigin: "50% 50%" }}
              draggable={false}
            />
          </div>
        </div>
      </div>
    );
  }
);
