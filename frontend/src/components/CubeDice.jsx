import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { sounds } from '../utils/soundFX';
import { Dices, Play, RotateCw, MousePointerClick } from 'lucide-react';

export const GAMES = [
  {
    id: 'sudoku',
    pipCount: 1,
    number: '01',
    name: 'Sudoku Blitz',
    badge: 'Matrix Logic',
    icon: '🧩',
    desc: 'Solve the cosmic number matrix without quadrant conflicts.',
    faceDir: '+Z', // Front Face
    targetRotation: { x: 0.28, y: -0.32, z: 0.04 },
    color: '#00F0FF'
  },
  {
    id: 'riddles',
    pipCount: 2,
    number: '02',
    name: 'Cosmic Riddles',
    badge: 'Lateral Thinking',
    icon: '🔮',
    desc: 'Unravel deep spacetime paradoxes & astronomical mysteries.',
    faceDir: '+X', // Right Face
    targetRotation: { x: 0.28, y: -Math.PI / 2 - 0.32, z: 0.04 },
    color: '#EC4899'
  },
  {
    id: 'logic',
    pipCount: 3,
    number: '03',
    name: 'Logic & Reasoning',
    badge: 'Cognitive Matrix',
    icon: '⚡',
    desc: 'Identify quantum sequence anomalies & deductive laws.',
    faceDir: '+Y', // Top Face
    targetRotation: { x: Math.PI / 2 - 0.28, y: 0, z: -0.32 },
    color: '#8B5CF6'
  },
  {
    id: 'math',
    pipCount: 4,
    number: '04',
    name: 'Rapid Math Sprint',
    badge: 'Speed Sprint',
    icon: '🚀',
    desc: 'High-speed mental arithmetic against the cosmic clock.',
    faceDir: '-Y', // Bottom Face (opposite 3)
    targetRotation: { x: -Math.PI / 2 + 0.28, y: 0, z: 0.32 },
    color: '#F59E0B'
  },
  {
    id: 'arrow',
    pipCount: 5,
    number: '05',
    name: 'Arrow Treasure Hunt',
    badge: 'Spatial Vector',
    icon: '🧭',
    desc: 'Memorize vector trajectories to unlock the Singularity Vault.',
    faceDir: '-X', // Left Face (opposite 2)
    targetRotation: { x: 0.28, y: Math.PI / 2 - 0.32, z: 0.04 },
    color: '#10B981'
  },
  {
    id: 'memory',
    pipCount: 6,
    number: '06',
    name: 'Quantum Memory Grid',
    badge: 'Visual Recall',
    icon: '🌌',
    desc: 'Match entangled cosmic celestial artifacts in minimum moves.',
    faceDir: '-Z', // Back Face (opposite 1)
    targetRotation: { x: 0.28, y: Math.PI - 0.32, z: 0.04 },
    color: '#3B82F6'
  }
];

// Helper to draw authentic 3D dice pips (dots 1 to 6)
function drawDicePips(ctx, count, color) {
  const pipMap = {
    1: [[384, 384]],
    2: [[210, 210], [558, 558]],
    3: [[210, 210], [384, 384], [558, 558]],
    4: [[210, 210], [558, 210], [210, 558], [558, 558]],
    5: [[210, 210], [558, 210], [384, 384], [210, 558], [558, 558]],
    6: [[210, 210], [558, 210], [210, 384], [558, 384], [210, 558], [558, 558]]
  };

  const points = pipMap[count] || [[384, 384]];
  const pipR = count === 1 ? 58 : count >= 5 ? 36 : 42;

  points.forEach(([px, py]) => {
    // 1. Recessed 3D Bevel Shadow (socket indent)
    ctx.beginPath();
    ctx.arc(px, py, pipR + 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fill();

    // 2. Glowing Outer Neon Rim
    ctx.beginPath();
    ctx.arc(px, py, pipR + 3, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // 3. Core Radial Gradient (illuminated gemstone / quantum pip)
    const pipGrad = ctx.createRadialGradient(
      px - pipR * 0.25,
      py - pipR * 0.25,
      pipR * 0.1,
      px,
      py,
      pipR
    );
    pipGrad.addColorStop(0, '#ffffff');
    pipGrad.addColorStop(0.35, '#ffffff');
    pipGrad.addColorStop(0.7, color);
    pipGrad.addColorStop(1, '#040714');

    ctx.beginPath();
    ctx.arc(px, py, pipR, 0, Math.PI * 2);
    ctx.fillStyle = pipGrad;
    ctx.fill();

    // 4. Glass Specular Highlight
    ctx.beginPath();
    ctx.arc(px - pipR * 0.32, py - pipR * 0.32, pipR * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
  });
}

// Helper to create glowing futuristic high-DPI Canvas Texture for each face
function createFaceTexture(game, dimensionColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  // Background gradient with deep cosmic dark acrylic feel
  const grad = ctx.createLinearGradient(0, 0, 768, 768);
  grad.addColorStop(0, '#0e122b');
  grad.addColorStop(0.5, '#070918');
  grad.addColorStop(1, '#04050d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 768, 768);

  // Subtle sci-fi grid overlay
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  const step = 48;
  for (let x = 0; x <= 768; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 768);
    ctx.stroke();
  }
  for (let y = 0; y <= 768; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(768, y);
    ctx.stroke();
  }

  // Rounded Die Face Border
  ctx.save();
  ctx.strokeStyle = game.color;
  ctx.lineWidth = 14;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(28, 28, 712, 712, 72);
  } else {
    ctx.rect(28, 28, 712, 712);
  }
  ctx.stroke();

  // Subtle inner border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(46, 46, 676, 676, 56);
  } else {
    ctx.rect(46, 46, 676, 676);
  }
  ctx.stroke();
  ctx.restore();

  // 1. Draw Authentic 3D Dice Pips
  drawDicePips(ctx, game.pipCount, game.color);

  // 2. Header: DIE FACE #
  ctx.save();
  ctx.font = '700 30px "Orbitron", monospace';
  ctx.fillStyle = game.color;
  ctx.textAlign = 'center';
  ctx.shadowColor = game.color;
  ctx.shadowBlur = 12;
  ctx.fillText(`● DIE FACE ${game.pipCount} ●`, 384, 98);
  ctx.restore();

  // 3. Center Game Icon (If 1 pip, icon sits slightly above; else center or floating)
  ctx.save();
  ctx.font = '72px "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (game.pipCount === 1) {
    ctx.fillText(game.icon, 384, 250);
  } else if (game.pipCount === 2 || game.pipCount === 4) {
    ctx.fillText(game.icon, 384, 384);
  } else {
    ctx.fillText(game.icon, 384, 155);
  }
  ctx.restore();

  // 4. Bottom Game Title & Badge Banner
  ctx.save();
  // Pill banner behind title
  const bannerY = 624;
  const bannerW = 600;
  const bannerH = 88;
  const bannerX = (768 - bannerW) / 2;

  ctx.fillStyle = 'rgba(7, 9, 24, 0.92)';
  ctx.strokeStyle = game.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 44);
  } else {
    ctx.rect(bannerX, bannerY, bannerW, bannerH);
  }
  ctx.fill();
  ctx.stroke();

  // Game Name
  ctx.font = '900 36px "Orbitron", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = game.color;
  ctx.shadowBlur = 16;
  ctx.fillText(game.name.toUpperCase(), 384, bannerY + 36);

  // Subtitle
  ctx.font = '700 17px "Orbitron", monospace';
  ctx.fillStyle = game.color;
  ctx.shadowBlur = 0;
  ctx.fillText('100 LEVELS • CLICK TO PLAY', 384, bannerY + 66);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export default function CubeDice({ dimension, onSelectGame, activeGameId }) {
  const mountRef = useRef(null);
  const diceGroupRef = useRef(null);
  const faceMeshesRef = useRef([]);
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [hoveredGame, setHoveredGame] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // State refs for animation loop
  // Starts with authentic 3D isometric perspective showing 3 faces (Front, Top, Right)!
  const rotState = useRef({
    rx: 0.42,
    ry: -0.58,
    rz: 0.08,
    targetRx: 0.42,
    targetRy: -0.58,
    targetRz: 0.08,
    vx: 0,
    vy: 0,
    isDragging: false,
    dragDistance: 0,
    downX: 0,
    downY: 0,
    downTime: 0,
    prevMouseX: 0,
    prevMouseY: 0,
    isTumbling: false,
    tumbleStart: 0,
    tumbleDuration: 1900,
    tumbleTarget: null,
    isLaunching: false,
    launchStart: 0,
    launchTargetRot: null,
    launchGameId: null
  });

  // Direct Launch Action Handler
  const launchGame = (game) => {
    if (rotState.current.isLaunching) return;
    sounds.playWarp();
    setSelectedGame(game);
    setIsLaunching(true);

    rotState.current.isLaunching = true;
    rotState.current.launchStart = performance.now();
    rotState.current.launchTargetRot = game.targetRotation;
    rotState.current.launchGameId = game.id;

    setTimeout(() => {
      onSelectGame(game.id);
    }, 420);
  };

  // Smoothly orient to a specific face when clicked
  const focusGameFace = (game) => {
    setSelectedGame(game);
    sounds.playClick();
    rotState.current.isTumbling = true;
    rotState.current.tumbleStart = performance.now();
    rotState.current.tumbleDuration = 800;
    rotState.current.startX = rotState.current.rx;
    rotState.current.startY = rotState.current.ry;
    rotState.current.startZ = rotState.current.rz;
    rotState.current.tumbleTarget = {
      x: game.targetRotation.x,
      y: game.targetRotation.y,
      z: game.targetRotation.z
    };
  };

  // Setup Three.js Cube
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    // Perspective camera with generous field of view to show genuine 3D dice depth
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 5.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Dynamic 3-Point Lighting for authentic 3D dice specular highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x00f0ff, 2.2, 25);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const bottomLight = new THREE.PointLight(0x8b5cf6, 1.8, 20);
    bottomLight.position.set(0, -6, 2);
    scene.add(bottomLight);

    // Root 3D Dice Group
    const diceGroup = new THREE.Group();
    scene.add(diceGroup);
    diceGroupRef.current = diceGroup;

    // 1. Base Beveled Rounded Die Body
    const bodyGeometry = new RoundedBoxGeometry(2.1, 2.1, 2.1, 8, 0.22);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x080a1c,
      roughness: 0.18,
      metalness: 0.88,
      emissive: 0x0f1230,
      emissiveIntensity: 0.35
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    diceGroup.add(bodyMesh);

    // 2. Glowing Neon Edge Outline
    const edgeGeo = new THREE.EdgesGeometry(bodyGeometry);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 2,
      transparent: true,
      opacity: 0.75
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    diceGroup.add(edgeLines);

    // 3. Six Face Plates with authentic pips and branding
    const facePlanes = [];
    const faceGeometry = new THREE.PlaneGeometry(1.72, 1.72);

    const faceConfigs = [
      { game: GAMES[0], pos: [0, 0, 1.055], rot: [0, 0, 0] }, // +Z Front (1 Pip)
      { game: GAMES[1], pos: [1.055, 0, 0], rot: [0, Math.PI / 2, 0] }, // +X Right (2 Pips)
      { game: GAMES[2], pos: [0, 1.055, 0], rot: [-Math.PI / 2, 0, 0] }, // +Y Top (3 Pips)
      { game: GAMES[3], pos: [0, -1.055, 0], rot: [Math.PI / 2, 0, 0] }, // -Y Bottom (4 Pips)
      { game: GAMES[4], pos: [-1.055, 0, 0], rot: [0, -Math.PI / 2, 0] }, // -X Left (5 Pips)
      { game: GAMES[5], pos: [0, 0, -1.055], rot: [0, Math.PI, 0] } // -Z Back (6 Pips)
    ];

    faceConfigs.forEach(({ game, pos, rot }) => {
      const texture = createFaceTexture(game, dimension);
      const faceMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.22,
        metalness: 0.15,
        emissive: new THREE.Color(game.color),
        emissiveIntensity: 0.18,
        transparent: true
      });
      const plane = new THREE.Mesh(faceGeometry, faceMat);
      plane.position.set(...pos);
      plane.rotation.set(...rot);
      plane.userData = { game };
      diceGroup.add(plane);
      facePlanes.push(plane);
    });
    faceMeshesRef.current = facePlanes;

    // 4. Subtle Floor Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(1.6, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.45;
    scene.add(shadowMesh);

    // Raycaster for Face Clicks & Dynamic Glow Hovers
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const getFaceAtClientPos = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(facePlanes, false);
      if (intersects.length > 0 && intersects[0].object.userData.game) {
        return {
          game: intersects[0].object.userData.game,
          mesh: intersects[0].object
        };
      }
      return null;
    };

    // Pointer Handlers
    const onPointerDown = (e) => {
      rotState.current.isDragging = true;
      rotState.current.dragDistance = 0;
      rotState.current.isTumbling = false;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      rotState.current.downX = clientX;
      rotState.current.downY = clientY;
      rotState.current.downTime = performance.now();
      rotState.current.prevMouseX = clientX;
      rotState.current.prevMouseY = clientY;
    };

    const onPointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      // Real-time Hover Detection & Face Illumination
      if (!rotState.current.isDragging && !rotState.current.isLaunching) {
        const hit = getFaceAtClientPos(clientX, clientY);
        if (hit) {
          setHoveredGame(hit.game);
          facePlanes.forEach((mesh) => {
            mesh.material.emissiveIntensity = mesh === hit.mesh ? 0.55 : 0.16;
          });
        } else {
          setHoveredGame(null);
          facePlanes.forEach((mesh) => {
            mesh.material.emissiveIntensity = 0.18;
          });
        }
      }

      if (!rotState.current.isDragging) return;

      const deltaX = clientX - rotState.current.prevMouseX;
      const deltaY = clientY - rotState.current.prevMouseY;

      rotState.current.dragDistance += Math.abs(deltaX) + Math.abs(deltaY);
      rotState.current.vx = deltaX * 0.0075;
      rotState.current.vy = deltaY * 0.0075;

      rotState.current.ry += rotState.current.vx;
      rotState.current.rx += rotState.current.vy;

      rotState.current.prevMouseX = clientX;
      rotState.current.prevMouseY = clientY;
    };

    const onPointerUp = (e) => {
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const elapsed = performance.now() - rotState.current.downTime;
      const movement = Math.hypot(clientX - rotState.current.downX, clientY - rotState.current.downY);

      const isSingleClick = movement < 16 && elapsed < 450;
      rotState.current.isDragging = false;

      if (isSingleClick && !rotState.current.isLaunching) {
        const hit = getFaceAtClientPos(clientX, clientY);
        if (hit && hit.game) {
          launchGame(hit.game);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Launch Warp Zoom Sequence
      if (rotState.current.isLaunching) {
        const now = performance.now();
        const progress = Math.min((now - rotState.current.launchStart) / 380, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        const targetRot = rotState.current.launchTargetRot;
        if (targetRot) {
          rotState.current.rx = THREE.MathUtils.lerp(rotState.current.rx, targetRot.x, ease * 0.25);
          rotState.current.ry = THREE.MathUtils.lerp(rotState.current.ry, targetRot.y, ease * 0.25);
          rotState.current.rz = THREE.MathUtils.lerp(rotState.current.rz, targetRot.z, ease * 0.25);
        }

        diceGroup.scale.setScalar(1 + progress * 0.4);
        camera.position.z = THREE.MathUtils.lerp(5.2, 3.2, ease);
      }
      // Tumbling / Spin Roll Sequence
      else if (rotState.current.isTumbling) {
        const now = performance.now();
        const progress = Math.min((now - rotState.current.tumbleStart) / rotState.current.tumbleDuration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        const target = rotState.current.tumbleTarget;
        if (target) {
          rotState.current.rx = THREE.MathUtils.lerp(rotState.current.startX, target.x, ease);
          rotState.current.ry = THREE.MathUtils.lerp(rotState.current.startY, target.y, ease);
          rotState.current.rz = THREE.MathUtils.lerp(rotState.current.startZ, target.z, ease);
        }

        if (progress >= 1) {
          rotState.current.isTumbling = false;
          setIsSpinning(false);
          sounds.playCorrect();
        }
      }
      // Idle Floating Animation & Inertial Momentum
      else if (!rotState.current.isDragging) {
        rotState.current.rx += rotState.current.vy;
        rotState.current.ry += rotState.current.vx;
        rotState.current.vx *= 0.92;
        rotState.current.vy *= 0.92;

        // Gentle floating respiration
        diceGroup.position.y = Math.sin(elapsed * 1.6) * 0.09;
        // Subtle organic 3D wobble so edges and depth are always alive
        diceGroup.rotation.z = rotState.current.rz + Math.sin(elapsed * 0.8) * 0.03;
      }

      diceGroup.rotation.x = rotState.current.rx;
      diceGroup.rotation.y = rotState.current.ry;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      bodyGeometry.dispose();
      bodyMaterial.dispose();
      faceGeometry.dispose();
      facePlanes.forEach((mesh) => {
        mesh.material.map.dispose();
        mesh.material.dispose();
      });
      edgeGeo.dispose();
      edgeMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      renderer.dispose();
    };
  }, [dimension]);

  // Roll / Spin Dice Animation (Random selector)
  const handleRollDice = () => {
    if (isSpinning || isLaunching) return;
    setIsSpinning(true);
    sounds.playDiceRoll();

    const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
    setSelectedGame(randomGame);

    const fullSpinsX = (Math.floor(Math.random() * 2) + 2) * Math.PI * 2;
    const fullSpinsY = (Math.floor(Math.random() * 2) + 3) * Math.PI * 2;

    rotState.current.startX = rotState.current.rx;
    rotState.current.startY = rotState.current.ry;
    rotState.current.startZ = rotState.current.rz;

    rotState.current.tumbleTarget = {
      x: randomGame.targetRotation.x + fullSpinsX,
      y: randomGame.targetRotation.y + fullSpinsY,
      z: randomGame.targetRotation.z
    };
    rotState.current.tumbleStart = performance.now();
    rotState.current.tumbleDuration = 1900;
    rotState.current.isTumbling = true;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 py-2">
      {/* Interactive 3D Dice Canvas Area */}
      <div className="relative w-full h-[450px] md:h-[510px] flex items-center justify-center select-none">
        <div
          ref={mountRef}
          className={`w-full h-full ${
            hoveredGame ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
          }`}
        />

        {/* Dynamic Single-Click Floating HUD Target Indicator */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {/* Left: Dynamic Hover / Launch Status */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-md border transition-all duration-200 shadow-xl ${
              hoveredGame
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 scale-105 ring-2 ring-cyan-400/50'
                : 'bg-black/60 border-cyan-500/40 text-cyan-300'
            }`}
          >
            <MousePointerClick className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span className="font-mono text-xs sm:text-sm font-bold">
              {hoveredGame ? (
                <span>
                  DICE FACE {hoveredGame.pipCount}: <strong className="text-white">{hoveredGame.name.toUpperCase()}</strong> (TAP TO PLAY)
                </span>
              ) : (
                <span>🎲 3D Quantum Dice: Drag to rotate or click any face to launch!</span>
              )}
            </span>
          </div>

          {/* Right: Orbit Tip */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-300">
            <RotateCw className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>360° Free 3D Orbit</span>
          </div>
        </div>

        {/* Face Selector Mini Badges - Single click rotates & showcases directly */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2.5 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-2xl">
          {GAMES.map((game) => {
            const isHovered = hoveredGame && hoveredGame.id === game.id;
            const isCurrent = selectedGame.id === game.id;
            return (
              <button
                key={game.id}
                onClick={() => focusGameFace(game)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  isHovered || isCurrent
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105 border border-purple-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/15 border border-transparent'
                }`}
                title={`Orient to Face ${game.pipCount}: ${game.name}`}
              >
                <span className="text-sm">{game.icon}</span>
                <span className="font-mono font-bold">D{game.pipCount}</span>
                <span className="hidden md:inline text-[10px] text-purple-200 uppercase">{game.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Game Card with Direct Single-Click Info & Controls */}
      <div className="w-full max-w-2xl mt-3 p-5 rounded-3xl glass-panel text-center relative overflow-hidden transition-all duration-300 border border-white/15 shadow-2xl">
        <div
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: selectedGame.color }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: selectedGame.color }}
        />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono font-semibold mb-2">
          <span>{selectedGame.icon}</span>
          <span>DICE FACE {selectedGame.pipCount} • 100 CHALLENGE LEVELS</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-extrabold font-orbitron tracking-wide text-white drop-shadow-md">
          {selectedGame.name}
        </h3>
        <p className="text-sm md:text-base text-slate-300 mt-1 max-w-lg mx-auto">
          {selectedGame.desc}
        </p>

        {/* Buttons: Roll Dice or Direct Launch */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-5">
          <button
            onClick={handleRollDice}
            disabled={isSpinning || isLaunching}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Dices className={`w-4 h-4 text-purple-400 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Tumbling Quantum Dice...' : 'Roll Dice (Random Face)'}</span>
          </button>

          <button
            onClick={() => launchGame(selectedGame)}
            disabled={isLaunching}
            className="btn-cosmic flex items-center gap-2.5 px-8 py-3 rounded-2xl text-base font-bold font-orbitron shadow-xl cursor-pointer"
            style={{ borderColor: selectedGame.color }}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY {selectedGame.name.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
