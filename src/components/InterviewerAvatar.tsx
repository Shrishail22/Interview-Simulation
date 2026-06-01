import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface AvatarProps {
  status: "idle" | "listening" | "speaking" | "thinking";
  volume: number; // Input voice level from audio analyzer
}

export default function InterviewerAvatar({ status, volume }: AvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef(status);
  const volumeRef = useRef(volume);

  // Keep references updated for the requestAnimationFrame loop to prevent closures
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // scene, camera, renderer with shadows/lighting
    const scene = new THREE.Scene();
    scene.background = null; 

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Subtle 3D Glass Geometry
    const geometry = new THREE.IcosahedronGeometry(1.2, 2);

    // Premium Frosted Ceramic / Physical glass material with high-end lighting properties
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x4f46e5, // Brand premium indigo
      emissive: 0x111122,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.4, // frosted glass transmission
      thickness: 1.5, // glass thickness
      ior: 1.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.95,
      flatShading: true, // Elegant low-poly look that sparkles cleanly
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Floating Ring Element, matte and elegant
    const torusGeometry = new THREE.TorusGeometry(1.5, 0.03, 16, 100);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.4,
      metalness: 0.8,
      transparent: true,
      opacity: 0.45,
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.rotation.x = Math.PI / 2.5;
    scene.add(torus);

    // Elegant Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xf3f4f6, 1.2);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Brand Accent Light to give elegant Vision Pro style backdrop glow
    const pointLight = new THREE.PointLight(0x818cf8, 2.5, 12);
    pointLight.position.set(-3, -2, 2);
    scene.add(pointLight);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    // Reset loop variables
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const currentStatus = statusRef.current;
      const currentVol = volumeRef.current;

      // Base continuous premium micro-spin
      mesh.rotation.y = elapsedTime * 0.12;
      mesh.rotation.x = elapsedTime * 0.05;
      torus.rotation.z = -elapsedTime * 0.08;

      let targetColor = 0x4f46e5; // Premium SaaS Indigo
      let scaleVal = 1.0;

      if (currentStatus === "listening") {
        targetColor = 0x10b981; // Elegant Emerald Green
        // Soft breath scale
        scaleVal = 1.0 + Math.sin(elapsedTime * 3.5) * 0.04;
      } else if (currentStatus === "speaking") {
        targetColor = 0x6366f1; // Vibrant Indigo
        // Animate grid scale dynamically based on audio amplitude (soundwave response)
        const speechAmp = 1.0 + (currentVol || Math.random() * 0.1) * 0.3;
        scaleVal = speechAmp;
      } else if (currentStatus === "thinking") {
        targetColor = 0xa855f7; // Tech purple
        scaleVal = 1.02 + Math.sin(elapsedTime * 8) * 0.02;
        mesh.rotation.y = elapsedTime * 0.6; // Softly faster
      } else {
        // Idle
        targetColor = 0x4f46e5;
        scaleVal = 1.0 + Math.sin(elapsedTime * 1.5) * 0.02;
      }

      // Smooth color and size interpolation
      const colorObj = new THREE.Color(targetColor);
      material.color.lerp(colorObj, 0.1);
      
      const currentScale = mesh.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, scaleVal, 0.12);
      mesh.scale.set(nextScale, nextScale, nextScale);

      // Subtle float animation
      mesh.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[260px] flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200/80 shadow-sm">
      <div ref={mountRef} className="w-full h-full max-w-[260px]" />

      {/* Floating minimalistic state chip */}
      <div className="absolute bottom-4 flex items-center space-x-2 bg-white/80 backdrop-blur-md border border-gray-200 px-3 py-1.5 rounded-full shadow-sm text-xs font-medium select-none text-gray-800">
        <span className={`w-2 h-2 rounded-full ${
          status === "speaking"
            ? "bg-indigo-600 animate-pulse"
            : status === "listening"
            ? "bg-emerald-500 animate-pulse"
            : status === "thinking"
            ? "bg-purple-500 animate-spin"
            : "bg-gray-400"
        }`} />
        <span className="opacity-80 font-semibold uppercase tracking-wider text-[10px]">
          {status}
        </span>
      </div>
    </div>
  );
}
