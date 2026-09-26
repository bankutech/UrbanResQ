import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function Disaster3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080c14, 0.032);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(-0.4, 0.85, 7.2);

    const renderer = new THREE.WebGLRenderer({
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
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x223249, 3.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 5.0);
    keyLight.position.set(-5, 9, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const topRimLight = new THREE.DirectionalLight(0xffffff, 2.6);
    topRimLight.position.set(0, 10, -3);
    scene.add(topRimLight);

    const alertRimLight = new THREE.PointLight(0xef4444, 5.8, 18);
    alertRimLight.position.set(4, -1, 3);
    scene.add(alertRimLight);

    const amberFill = new THREE.PointLight(0xf59e0b, 3.0, 15);
    amberFill.position.set(-4, -2, -2);
    scene.add(amberFill);

    const medkitGroup = new THREE.Group();
    scene.add(medkitGroup);
    medkitGroup.position.set(-0.7, 0.25, 0);

    const caseWidth = 2.5;
    const caseHeight = 1.75;
    const caseDepth = 1.15;

    const caseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.35,
      roughness: 0.38,
      envMapIntensity: 1.0,
    });

    const caseGeo = new THREE.BoxGeometry(caseWidth, caseHeight, caseDepth);
    const caseMesh = new THREE.Mesh(caseGeo, caseMat);
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    medkitGroup.add(caseMesh);

    const lidSeamMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.8,
      roughness: 0.2,
    });
    const seamGeo = new THREE.BoxGeometry(caseWidth + 0.02, 0.06, caseDepth + 0.02);
    const seamMesh = new THREE.Mesh(seamGeo, lidSeamMat);
    seamMesh.position.set(0, 0.25, 0);
    medkitGroup.add(seamMesh);

    const ribMat = new THREE.MeshStandardMaterial({
      color: 0x273549,
      metalness: 0.45,
      roughness: 0.3,
    });
    [-0.5, 0, 0.5].forEach((rx) => {
      const ribGeo = new THREE.BoxGeometry(0.12, 0.08, caseDepth - 0.15);
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.set(rx, caseHeight / 2 + 0.04, 0);
      medkitGroup.add(rib);
    });

    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x0b111c,
      metalness: 0.7,
      roughness: 0.25,
    });

    const rivetMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.2,
    });

    const cornerCoords = [
      [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1],
    ];

    cornerCoords.forEach(([cx, cy, cz]) => {
      const bumperGeo = new THREE.BoxGeometry(0.38, 0.38, 0.38);
      const bumper = new THREE.Mesh(bumperGeo, bumperMat);
      const bx = (cx * caseWidth) / 2;
      const by = (cy * caseHeight) / 2;
      const bz = (cz * caseDepth) / 2;
      bumper.position.set(bx, by, bz);
      medkitGroup.add(bumper);

      const rivetGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const rivet = new THREE.Mesh(rivetGeo, rivetMat);
      rivet.position.set(
        bx + (cx * 0.14),
        by + (cy * 0.14),
        bz + (cz * 0.2)
      );
      medkitGroup.add(rivet);
    });

    const latchMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.92,
      roughness: 0.15,
      emissive: 0x0891b2,
      emissiveIntensity: 0.25,
    });

    const latchBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.8,
      roughness: 0.3,
    });

    [-0.58, 0.58].forEach((lx) => {
      const baseGeo = new THREE.BoxGeometry(0.24, 0.46, 0.08);
      const baseMesh = new THREE.Mesh(baseGeo, latchBaseMat);
      baseMesh.position.set(lx, 0.08, caseDepth / 2 + 0.03);
      medkitGroup.add(baseMesh);

      const latchGeo = new THREE.BoxGeometry(0.16, 0.36, 0.1);
      const latch = new THREE.Mesh(latchGeo, latchMat);
      latch.position.set(lx, 0.08, caseDepth / 2 + 0.07);
      medkitGroup.add(latch);
    });

    const handleMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.6,
      roughness: 0.35,
    });
    const handleBarMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2,
    });

    const handleCrossGeo = new THREE.BoxGeometry(0.9, 0.14, 0.14);
    const handleCross = new THREE.Mesh(handleCrossGeo, handleBarMat);
    handleCross.position.set(0, caseHeight / 2 + 0.34, 0);
    medkitGroup.add(handleCross);

    [-0.4, 0.4].forEach((hx) => {
      const handleSideGeo = new THREE.BoxGeometry(0.12, 0.36, 0.14);
      const handleSide = new THREE.Mesh(handleSideGeo, handleMat);
      handleSide.position.set(hx, caseHeight / 2 + 0.17, 0);
      medkitGroup.add(handleSide);
    });

    const crossBorderMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.3,
      roughness: 0.2,
      emissive: 0xffffff,
      emissiveIntensity: 0.15,
    });

    const crossBorderV = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.94, 0.03),
      crossBorderMat
    );
    crossBorderV.position.set(0, 0.05, caseDepth / 2 + 0.03);
    medkitGroup.add(crossBorderV);

    const crossBorderH = new THREE.Mesh(
      new THREE.BoxGeometry(0.94, 0.36, 0.03),
      crossBorderMat
    );
    crossBorderH.position.set(0, 0.05, caseDepth / 2 + 0.03);
    medkitGroup.add(crossBorderH);

    const crossEmblemMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1.6,
      roughness: 0.15,
      metalness: 0.2,
    });

    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.84, 0.05),
      crossEmblemMat
    );
    crossV.position.set(0, 0.05, caseDepth / 2 + 0.05);
    medkitGroup.add(crossV);

    const crossH = new THREE.Mesh(
      new THREE.BoxGeometry(0.84, 0.26, 0.05),
      crossEmblemMat
    );
    crossH.position.set(0, 0.05, caseDepth / 2 + 0.05);
    medkitGroup.add(crossH);

    const crossLight = new THREE.PointLight(0xef4444, 3.2, 4.0);
    crossLight.position.set(0, 0.05, caseDepth / 2 + 0.5);
    medkitGroup.add(crossLight);

    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });
    [-0.3, -0.1, 0.1, 0.3].forEach((lx) => {
      const ledGeo = new THREE.BoxGeometry(0.08, 0.03, 0.02);
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(lx, caseHeight / 2 - 0.12, caseDepth / 2 + 0.02);
      medkitGroup.add(led);
    });

    const ringGeo1 = new THREE.TorusGeometry(2.2, 0.022, 16, 90);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.75,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.7;
    medkitGroup.add(ring1);

    const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const orbitNode1 = new THREE.Mesh(nodeGeo, nodeMat);
    orbitNode1.position.set(2.2, 0, 0);
    ring1.add(orbitNode1);

    const ringGeo2 = new THREE.TorusGeometry(2.5, 0.018, 16, 90);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.55,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 3.2;
    ring2.rotation.y = Math.PI / 5.5;
    medkitGroup.add(ring2);

    const orbitNode2 = new THREE.Mesh(
      nodeGeo,
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    orbitNode2.position.set(-2.5, 0, 0);
    ring2.add(orbitNode2);

    const terrainGeo = new THREE.PlaneGeometry(30, 30, 52, 52);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const dist = Math.sqrt(vx * vx + vy * vy);
      const vz =
        Math.sin(vx * 0.42) * Math.cos(vy * 0.42) * 0.7 +
        Math.sin(dist * 0.65) * 0.4 -
        1.7;
      pos.setZ(i, vz);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x0c1524,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      emissive: 0x0284c7,
      emissiveIntensity: 0.12,
    });

    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2.3;
    terrain.position.set(0, -2.2, -2.2);
    scene.add(terrain);

    const radarGroup = new THREE.Group();
    radarGroup.rotation.x = -Math.PI / 2.3;
    radarGroup.position.set(0, -2.0, -2.1);
    scene.add(radarGroup);

    const pulseRings: THREE.Mesh[] = [];
    [2.6, 4.4, 6.6, 9.0].forEach((radius, idx) => {
      const rGeo = new THREE.RingGeometry(radius - 0.045, radius, 72);
      const rMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0xef4444 : 0x06b6d4,
        transparent: true,
        opacity: 0.42 - idx * 0.07,
        side: THREE.DoubleSide,
      });
      const rMesh = new THREE.Mesh(rGeo, rMat);
      pulseRings.push(rMesh);
      radarGroup.add(rMesh);
    });

    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cCyan = new THREE.Color(0x38bdf8);
    const cRed = new THREE.Color(0xef4444);
    const cAmber = new THREE.Color(0xf59e0b);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14;

      const pick = Math.random();
      const col = pick < 0.6 ? cCyan : pick < 0.85 ? cRed : cAmber;
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

    const particleMat = new THREE.PointsMaterial({
      size: 0.068,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

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

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      medkitGroup.position.y = 0.25 + Math.sin(elapsed * 1.5) * 0.08;
      medkitGroup.rotation.y = 0.25 + Math.sin(elapsed * 0.8) * 0.18 + targetX * 0.4;
      medkitGroup.rotation.x = 0.12 + Math.cos(elapsed * 0.9) * 0.08 - targetY * 0.3;
      medkitGroup.rotation.z = Math.sin(elapsed * 0.6) * 0.04;

      ring1.rotation.z = elapsed * 0.7;
      ring2.rotation.z = -elapsed * 0.85;

      pulseRings.forEach((r, idx) => {
        const s = 1 + ((elapsed * 0.25 + idx * 0.25) % 1) * 0.35;
        r.scale.set(s, s, 1);
      });

      particles.rotation.y = elapsed * 0.04;
      particles.rotation.x = elapsed * 0.02;

      terrain.rotation.z = Math.sin(elapsed * 0.08) * 0.03;

      renderer.render(scene, camera);
    };

    animate();

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

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      terrainGeo.dispose();
      caseGeo.dispose();
      particleGeo.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 pointer-events-none" />;
}
