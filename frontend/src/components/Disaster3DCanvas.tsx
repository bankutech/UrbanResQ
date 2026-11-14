import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/** Defensive WebGL availability check to prevent unhandled WebGL context crashes */
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function Disaster3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    // 1. Verify WebGL support
    if (!checkWebGLSupport()) {
      setWebGLSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    // Check reduced-motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Track resources for comprehensive disposal on unmount
    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];

    const registerGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      disposableGeometries.push(g);
      return g;
    };
    const registerMat = <T extends THREE.Material>(m: T): T => {
      disposableMaterials.push(m);
      return m;
    };

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number | null = null;

    try {
      const scene = new THREE.Scene();
      // Subdued tactical fog blending cleanly into the dark background
      scene.fog = new THREE.FogExp2(0x080c14, 0.04);

      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.set(-0.4, 0.85, 7.2);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x080c14, 1);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      container.appendChild(renderer.domElement);

      // Realistic, mature tactical lighting (no gratuitous neon glare)
      const ambientLight = new THREE.AmbientLight(0x1a2636, 2.5);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0x94a3b8, 3.8);
      keyLight.position.set(-5, 9, 7);
      keyLight.castShadow = true;
      scene.add(keyLight);

      const topRimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
      topRimLight.position.set(0, 10, -3);
      scene.add(topRimLight);

      const alertRimLight = new THREE.PointLight(0xdc2626, 2.2, 16);
      alertRimLight.position.set(4, -1, 3);
      scene.add(alertRimLight);

      const fillLight = new THREE.PointLight(0x0284c7, 1.6, 14);
      fillLight.position.set(-4, -2, -2);
      scene.add(fillLight);

      const medkitGroup = new THREE.Group();
      scene.add(medkitGroup);
      medkitGroup.position.set(-0.7, 0.25, 0);

      const caseWidth = 2.5;
      const caseHeight = 1.75;
      const caseDepth = 1.15;

      // Realistic tactical matte composite casing
      const caseMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          metalness: 0.2,
          roughness: 0.6,
        })
      );

      const caseGeo = registerGeo(
        new THREE.BoxGeometry(caseWidth, caseHeight, caseDepth)
      );
      const caseMesh = new THREE.Mesh(caseGeo, caseMat);
      caseMesh.castShadow = true;
      caseMesh.receiveShadow = true;
      medkitGroup.add(caseMesh);

      const lidSeamMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.5,
          roughness: 0.4,
        })
      );
      const seamGeo = registerGeo(
        new THREE.BoxGeometry(caseWidth + 0.02, 0.06, caseDepth + 0.02)
      );
      const seamMesh = new THREE.Mesh(seamGeo, lidSeamMat);
      seamMesh.position.set(0, 0.25, 0);
      medkitGroup.add(seamMesh);

      const ribMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.3,
          roughness: 0.5,
        })
      );
      [-0.5, 0, 0.5].forEach((rx) => {
        const ribGeo = registerGeo(
          new THREE.BoxGeometry(0.12, 0.08, caseDepth - 0.15)
        );
        const rib = new THREE.Mesh(ribGeo, ribMat);
        rib.position.set(rx, caseHeight / 2 + 0.04, 0);
        medkitGroup.add(rib);
      });

      const bumperMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x090d16,
          metalness: 0.4,
          roughness: 0.5,
        })
      );

      const rivetMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x64748b,
          metalness: 0.8,
          roughness: 0.3,
        })
      );

      const cornerCoords = [
        [-1, -1, -1],
        [1, -1, -1],
        [-1, 1, -1],
        [1, 1, -1],
        [-1, -1, 1],
        [1, -1, 1],
        [-1, 1, 1],
        [1, 1, 1],
      ];

      cornerCoords.forEach(([cx, cy, cz]) => {
        const bumperGeo = registerGeo(new THREE.BoxGeometry(0.38, 0.38, 0.38));
        const bumper = new THREE.Mesh(bumperGeo, bumperMat);
        const bx = (cx * caseWidth) / 2;
        const by = (cy * caseHeight) / 2;
        const bz = (cz * caseDepth) / 2;
        bumper.position.set(bx, by, bz);
        medkitGroup.add(bumper);

        const rivetGeo = registerGeo(new THREE.SphereGeometry(0.04, 8, 8));
        const rivet = new THREE.Mesh(rivetGeo, rivetMat);
        rivet.position.set(bx + cx * 0.14, by + cy * 0.14, bz + cz * 0.2);
        medkitGroup.add(rivet);
      });

      const latchMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x0284c7,
          metalness: 0.8,
          roughness: 0.3,
        })
      );

      const latchBaseMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.6,
          roughness: 0.4,
        })
      );

      [-0.58, 0.58].forEach((lx) => {
        const baseGeo = registerGeo(new THREE.BoxGeometry(0.24, 0.46, 0.08));
        const baseMesh = new THREE.Mesh(baseGeo, latchBaseMat);
        baseMesh.position.set(lx, 0.08, caseDepth / 2 + 0.03);
        medkitGroup.add(baseMesh);

        const latchGeo = registerGeo(new THREE.BoxGeometry(0.16, 0.36, 0.1));
        const latch = new THREE.Mesh(latchGeo, latchMat);
        latch.position.set(lx, 0.08, caseDepth / 2 + 0.07);
        medkitGroup.add(latch);
      });

      const handleMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          metalness: 0.4,
          roughness: 0.5,
        })
      );
      const handleBarMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x475569,
          metalness: 0.6,
          roughness: 0.3,
        })
      );

      const handleCrossGeo = registerGeo(
        new THREE.BoxGeometry(0.9, 0.14, 0.14)
      );
      const handleCross = new THREE.Mesh(handleCrossGeo, handleBarMat);
      handleCross.position.set(0, caseHeight / 2 + 0.34, 0);
      medkitGroup.add(handleCross);

      [-0.4, 0.4].forEach((hx) => {
        const handleSideGeo = registerGeo(
          new THREE.BoxGeometry(0.12, 0.36, 0.14)
        );
        const handleSide = new THREE.Mesh(handleSideGeo, handleMat);
        handleSide.position.set(hx, caseHeight / 2 + 0.17, 0);
        medkitGroup.add(handleSide);
      });

      // Professional red cross insignia (subdued, institutional)
      const crossBorderMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          metalness: 0.1,
          roughness: 0.4,
        })
      );

      const crossBorderV = new THREE.Mesh(
        registerGeo(new THREE.BoxGeometry(0.36, 0.94, 0.03)),
        crossBorderMat
      );
      crossBorderV.position.set(0, 0.05, caseDepth / 2 + 0.03);
      medkitGroup.add(crossBorderV);

      const crossBorderH = new THREE.Mesh(
        registerGeo(new THREE.BoxGeometry(0.94, 0.36, 0.03)),
        crossBorderMat
      );
      crossBorderH.position.set(0, 0.05, caseDepth / 2 + 0.03);
      medkitGroup.add(crossBorderH);

      const crossEmblemMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          roughness: 0.3,
          metalness: 0.1,
        })
      );

      const crossV = new THREE.Mesh(
        registerGeo(new THREE.BoxGeometry(0.26, 0.84, 0.05)),
        crossEmblemMat
      );
      crossV.position.set(0, 0.05, caseDepth / 2 + 0.05);
      medkitGroup.add(crossV);

      const crossH = new THREE.Mesh(
        registerGeo(new THREE.BoxGeometry(0.84, 0.26, 0.05)),
        crossEmblemMat
      );
      crossH.position.set(0, 0.05, caseDepth / 2 + 0.05);
      medkitGroup.add(crossH);

      // Clean topographical grid (subtle, technical wireframe)
      const terrainGeo = registerGeo(new THREE.PlaneGeometry(30, 30, 44, 44));
      const pos = terrainGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const dist = Math.sqrt(vx * vx + vy * vy);
        const vz =
          Math.sin(vx * 0.42) * Math.cos(vy * 0.42) * 0.6 +
          Math.sin(dist * 0.65) * 0.3 -
          1.7;
        pos.setZ(i, vz);
      }
      terrainGeo.computeVertexNormals();

      const terrainMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        })
      );

      const terrain = new THREE.Mesh(terrainGeo, terrainMat);
      terrain.rotation.x = -Math.PI / 2.3;
      terrain.position.set(0, -2.2, -2.2);
      scene.add(terrain);

      // Technical radar range markers
      const radarGroup = new THREE.Group();
      radarGroup.rotation.x = -Math.PI / 2.3;
      radarGroup.position.set(0, -2.0, -2.1);
      scene.add(radarGroup);

      const pulseRings: THREE.Mesh[] = [];
      [3.0, 5.5, 8.0].forEach((radius, idx) => {
        const rGeo = registerGeo(
          new THREE.RingGeometry(radius - 0.03, radius, 64)
        );
        const rMat = registerMat(
          new THREE.MeshBasicMaterial({
            color: idx % 2 === 0 ? 0x0284c7 : 0x475569,
            transparent: true,
            opacity: 0.3 - idx * 0.08,
            side: THREE.DoubleSide,
          })
        );
        const rMesh = new THREE.Mesh(rGeo, rMat);
        pulseRings.push(rMesh);
        radarGroup.add(rMesh);
      });

      // Subdued particle field
      const particleCount = 200;
      const particleGeo = registerGeo(new THREE.BufferGeometry());
      const particlePositions = new Float32Array(particleCount * 3);
      const particleColors = new Float32Array(particleCount * 3);

      const cSlate = new THREE.Color(0x64748b);
      const cBlue = new THREE.Color(0x0284c7);

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 22;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;

        const col = Math.random() < 0.7 ? cSlate : cBlue;
        particleColors[i * 3] = col.r;
        particleColors[i * 3 + 1] = col.g;
        particleColors[i * 3 + 2] = col.b;
      }

      particleGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(particlePositions, 3)
      );
      particleGeo.setAttribute(
        "color",
        new THREE.BufferAttribute(particleColors, 3)
      );

      const particleMat = registerMat(
        new THREE.PointsMaterial({
          size: 0.05,
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
        })
      );

      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });

      const clock = new THREE.Clock();

      const renderFrame = () => {
        const elapsed = clock.getElapsedTime();

        targetX += (mouseX - targetX) * 0.04;
        targetY += (mouseY - targetY) * 0.04;

        medkitGroup.position.y = 0.25 + Math.sin(elapsed * 1.2) * 0.06;
        medkitGroup.rotation.y =
          0.2 + Math.sin(elapsed * 0.6) * 0.12 + targetX * 0.3;
        medkitGroup.rotation.x =
          0.1 + Math.cos(elapsed * 0.7) * 0.05 - targetY * 0.2;

        pulseRings.forEach((r, idx) => {
          const s = 1 + (((elapsed * 0.2 + idx * 0.2) % 1) * 0.25);
          r.scale.set(s, s, 1);
        });

        particles.rotation.y = elapsed * 0.02;
        terrain.rotation.z = Math.sin(elapsed * 0.05) * 0.02;

        renderer?.render(scene, camera);
      };

      const animate = () => {
        renderFrame();
        animationFrameId = requestAnimationFrame(animate);
      };

      // Respect reduced motion: static frame render
      if (prefersReducedMotion) {
        renderFrame();
      } else {
        animate();
      }

      // Tab visibility: pause loop when hidden
      const handleVisibilityChange = () => {
        if (prefersReducedMotion) return;
        if (document.hidden) {
          if (animationFrameId !== null) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        } else {
          if (animationFrameId === null) {
            clock.start();
            animate();
          }
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        if (width < 1024) {
          camera.position.set(0, 1.4, 8.8);
          medkitGroup.position.set(0, 1.35, 0);
        } else {
          camera.position.set(-0.4, 0.85, 7.2);
          medkitGroup.position.set(-0.7, 0.25, 0);
        }
        camera.updateProjectionMatrix();

        renderer?.setSize(width, height);
        renderer?.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (prefersReducedMotion) {
          renderFrame();
        }
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );

        if (renderer && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }

        disposableGeometries.forEach((g) => g.dispose());
        disposableMaterials.forEach((m) => m.dispose());
      };
    } catch (err) {
      console.warn(
        "[Disaster3DCanvas] WebGL initialization failed. Falling back to clean tactical background.",
        err
      );
      setWebGLSupported(false);
    }
  }, []);

  // WebGL Fallback: Clean tactical vector grid
  if (!webGLSupported) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute inset-0 bg-[#080C14] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none select-none"
      aria-hidden="true"
      role="presentation"
    />
  );
}
