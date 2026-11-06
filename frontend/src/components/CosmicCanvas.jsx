import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const DIMENSION_COLORS = {
  'cyber-neon': {
    stars: 0x00F0FF,
    dust: 0xFF007F,
    fog: 0x060913
  },
  'cosmos-violet': {
    stars: 0x8B5CF6,
    dust: 0xC084FC,
    fog: 0x070714
  },
  'solar-flare': {
    stars: 0xF59E0B,
    dust: 0xFF5722,
    fog: 0x110802
  },
  'matrix-emerald': {
    stars: 0x10B981,
    dust: 0x34D399,
    fog: 0x021208
  },
  'quantum-prism': {
    stars: 0xEC4899,
    dust: 0x6366F1,
    fog: 0x080918
  }
};

export default function CosmicCanvas({ dimension = 'cosmos-violet', isWarping = false }) {
  const mountRef = useRef(null);
  const stateRef = useRef({
    dimension,
    isWarping,
    targetSpeed: 0.002,
    currentSpeed: 0.002
  });

  useEffect(() => {
    stateRef.current.dimension = dimension;
    stateRef.current.isWarping = isWarping;
  }, [dimension, isWarping]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Initial Fog
    const initialPalette = DIMENSION_COLORS[dimension] || DIMENSION_COLORS['cosmos-violet'];
    scene.fog = new THREE.FogExp2(initialPalette.fog, 0.0012);

    // 1. Starfield Particles (Thousands of deep stars)
    const starCount = 3500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starVelocities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
      starVelocities[i] = 0.5 + Math.random() * 1.5;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    // Create custom particle circle texture programmatically
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const starTexture = new THREE.CanvasTexture(canvas);

    const starMaterial = new THREE.PointsMaterial({
      size: 4,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color(initialPalette.stars)
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 2. Cosmic Dust / Nebula Clouds
    const dustCount = 800;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 1200;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 16,
      map: starTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color(initialPalette.dust)
    });
    const dustCloud = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustCloud);

    // Mouse movement parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId;
    let currentStarColor = new THREE.Color(initialPalette.stars);
    let currentDustColor = new THREE.Color(initialPalette.dust);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth color morphing towards active dimension
      const targetColors = DIMENSION_COLORS[stateRef.current.dimension] || DIMENSION_COLORS['cosmos-violet'];
      currentStarColor.lerp(new THREE.Color(targetColors.stars), 0.05);
      currentDustColor.lerp(new THREE.Color(targetColors.dust), 0.05);
      starMaterial.color.copy(currentStarColor);
      dustMaterial.color.copy(currentDustColor);
      scene.fog.color.lerp(new THREE.Color(targetColors.fog), 0.05);

      // Mouse Parallax smooth lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      scene.rotation.y = mouseX;
      scene.rotation.x = mouseY;

      // Handle Hyperspace / Warp Speed
      const isWarp = stateRef.current.isWarping;
      stateRef.current.targetSpeed = isWarp ? 22 : 0.4;
      stateRef.current.currentSpeed += (stateRef.current.targetSpeed - stateRef.current.currentSpeed) * 0.08;
      const speed = stateRef.current.currentSpeed;

      const positions = starGeometry.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        // Move stars towards camera
        positions[i * 3 + 2] += starVelocities[i] * speed;
        if (positions[i * 3 + 2] > 600) {
          positions[i * 3 + 2] = -1400;
          positions[i * 3] = (Math.random() - 0.5) * 2000;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        }
      }
      starGeometry.attributes.position.needsUpdate = true;

      // Dust slow celestial rotation
      dustCloud.rotation.z += 0.0006;
      dustCloud.rotation.y += 0.0004;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      starGeometry.dispose();
      dustGeometry.dispose();
      starMaterial.dispose();
      dustMaterial.dispose();
      starTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
