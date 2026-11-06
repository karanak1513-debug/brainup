import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { sounds } from '../utils/soundFX';
import { getLevelDifficulty, DIFFICULTY_CONFIG } from '../utils/levels';
import { Dices, Play, RotateCw, Sparkles, Zap, MousePointerClick, Layers } from 'lucide-react';

export const GAMES = [
  {
    id: 'sudoku',
    faceIndex: 0,
    number: '01',
    name: 'Sudoku Blitz',
    badge: 'Matrix Logic',
    icon: '🧩',
    desc: 'Solve the cosmic number matrix without quadrant conflicts.',
    targetRotation: { x: 0, y: -Math.PI / 2, z: 0 },
    color: '#00F0FF'
  },
  {
    id: 'riddles',
    faceIndex: 1,
    number: '02',
    name: 'Cosmic Riddles',
    badge: 'Lateral Thinking',
    icon: '🔮',
    desc: 'Unravel deep spacetime paradoxes & astronomical mysteries.',
    targetRotation: { x: 0, y: Math.PI / 2, z: 0 },
    color: '#EC4899'
  },
  {
    id: 'logic',
    faceIndex: 2,
    number: '03',
    name: 'Logic & Reasoning',
    badge: 'Cognitive Matrix',
    icon: '⚡',
    desc: 'Identify quantum sequence anomalies & deductive laws.',
    targetRotation: { x: Math.PI / 2, y: 0, z: 0 },
    color: '#8B5CF6'
  },
  {
    id: 'math',
    faceIndex: 3,
    number: '04',
    name: 'Rapid Math Sprint',
    badge: 'Speed Sprint',
    icon: '🚀',
    desc: 'High-speed mental arithmetic against the cosmic clock.',
    targetRotation: { x: -Math.PI / 2, y: 0, z: 0 },
    color: '#F59E0B'
  },
  {
    id: 'arrow',
    faceIndex: 4,
    number: '05',
    name: 'Arrow Treasure Hunt',
    badge: 'Spatial Vector',
    icon: '🧭',
    desc: 'Memorize vector trajectories to unlock the Singularity Vault.',
    targetRotation: { x: 0, y: 0, z: 0 },
    color: '#10B981'
  },
  {
    id: 'memory',
    faceIndex: 5,
    number: '06',
    name: 'Quantum Memory Grid',
    badge: 'Visual Recall',
    icon: '🌌',
    desc: 'Match entangled cosmic celestial artifacts in minimum moves.',
    targetRotation: { x: 0, y: Math.PI, z: 0 },
    color: '#3B82F6'
  }
];

// Helper to create glowing futuristic high-DPI Canvas Texture for each face
function createFaceTexture(game, dimensionColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 768, 768);
  grad.addColorStop(0, '#0c0f24');
  grad.addColorStop(0.5, '#060714');
  grad.addColorStop(1, '#04050d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 768, 768);

  // Subtle sci-fi grid overlay
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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

  // Outer Neon Border
  ctx.strokeStyle = game.color;
  ctx.lineWidth = 18;
  ctx.strokeRect(24, 24, 720, 720);

  // Inner subtle neon border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, 684, 684);

  // Sci-fi Corner Brackets
  ctx.fillStyle = game.color;
  const bSize = 54;
  const bThick = 9;
  // Top-Left
  ctx.fillRect(48, 48, bSize, bThick);
  ctx.fillRect(48, 48, bThick, bSize);
  // Top-Right
  ctx.fillRect(768 - 48 - bSize, 48, bSize, bThick);
  ctx.fillRect(768 - 48 - bThick, 48, bThick, bSize);
  // Bottom-Left
  ctx.fillRect(48, 768 - 48 - bThick, bSize, bThick);
  ctx.fillRect(48, 768 - 48 - bSize, bThick, bSize);
  // Bottom-Right
  ctx.fillRect(768 - 48 - bSize, 768 - 48 - bThick, bSize, bThick);
  ctx.fillRect(768 - 48 - bThick, 768 - 48 - bSize, bThick, bSize);

  // Header Face Tag: FACE 01 // 100 LEVELS
  ctx.font = '700 32px "Orbitron", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.textAlign = 'center';
  ctx.shadowColor = game.color;
  ctx.shadowBlur = 10;
  ctx.fillText(`FACE ${game.number} • 100 LEVELS`, 384, 125);
  ctx.shadowBlur = 0;

  // Difficulty spectrum sub-tag
  ctx.font = '600 20px "Orbitron", monospace';
  ctx.fillStyle = game.color;
  ctx.fillText('EASY ➔ MEDIUM ➔ HARD ➔ SUPER HARD', 384, 165);

  // Center Icon Circle Glow
  ctx.beginPath();
  ctx.arc(384, 305, 110, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fill();
  ctx.strokeStyle = game.color;
  ctx.lineWidth = 5;
  ctx.stroke();

  // Emoji / Icon
  ctx.font = '115px "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(game.icon, 384, 305);

  // Game Title
  ctx.font = '900 48px "Orbitron", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = game.color;
  ctx.shadowBlur = 24;
  ctx.fillText(game.name.toUpperCase(), 384, 485);
  ctx.shadowBlur = 0;

  // Short Description
  ctx.font = '400 25px "Inter", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(game.desc, 384, 550, 640);

  // High-contrast "SINGLE-CLICK TO LAUNCH" Cyber Pill Button
  const btnY = 620;
  const btnW = 540;
  const btnH = 74;
  const btnX = (768 - btnW) / 2;

  // Pill Background
  ctx.fillStyle = game.color;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(btnX, btnY, btnW, btnH, 37);
  } else {
    ctx.rect(btnX, btnY, btnW, btnH);
  }
  ctx.fill();

  // Button Text
  ctx.font = '900 28px "Orbitron", monospace';
  ctx.fillStyle = '#060714';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('▶ SINGLE-CLICK TO LAUNCH', 384, btnY + btnH / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export default function CubeDice({ dimension, onSelectGame, activeGameId }) {
  const mountRef = useRef(null);
  const cubeRef = useRef(null);
  const materialsRef = useRef([]);
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [hoveredGame, setHoveredGame] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // State refs for animation loop
  const rotState = useRef({
    rx: 0,
    ry: -Math.PI / 2,
    rz: 0,
    targetRx: 0,
    targetRy: -Math.PI / 2,
    targetRz: 0,
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
    tumbleDuration: 1800,
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

    // After quick warp zoom, trigger game view transition
    setTimeout(() => {
      onSelectGame(game.id);
    }, 400);
  };

  // Setup Three.js Cube
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2.8, 20);
    pointLight.position.set(5, 5, 6);
    scene.add(pointLight);

    const backLight = new THREE.PointLight(0x8b5cf6, 2.0, 20);
    backLight.position.set(-5, -5, -4);
    scene.add(backLight);

    // Create 6 materials for 6 faces
    const materials = GAMES.map((game) => {
      const texture = createFaceTexture(game, dimension);
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.22,
        metalness: 0.12,
        emissive: new THREE.Color(game.color),
        emissiveIntensity: 0.12
      });
    });
    materialsRef.current = materials;

    // Box Geometry
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    cubeRef.current = cube;

    // Glowing Edge Outline
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 3,
      transparent: true,
      opacity: 0.75
    });
    const edgeLines = new THREE.LineSegments(edges, lineMaterial);
    cube.add(edgeLines);

    // Raycaster for Face Clicks & Dynamic Glow Hovers
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    // Helper: Raycast face at client coordinates
    const getFaceAtClientPos = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObject(cube);
      if (intersects.length > 0) {
        const faceMatIndex = (intersects[0].face && typeof intersects[0].face.materialIndex === 'number')
          ? intersects[0].face.materialIndex
          : Math.floor(intersects[0].faceIndex / 2);
        return { game: GAMES[faceMatIndex], faceMatIndex };
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
          // Highlight the specific hovered face in 3D
          materials.forEach((mat, idx) => {
            mat.emissiveIntensity = idx === hit.faceMatIndex ? 0.45 : 0.12;
          });
        } else {
          setHoveredGame(null);
          materials.forEach((mat) => {
            mat.emissiveIntensity = 0.12;
          });
        }
      }

      if (!rotState.current.isDragging) return;

      const deltaX = clientX - rotState.current.prevMouseX;
      const deltaY = clientY - rotState.current.prevMouseY;

      rotState.current.dragDistance += Math.abs(deltaX) + Math.abs(deltaY);
      rotState.current.vx = deltaX * 0.007;
      rotState.current.vy = deltaY * 0.007;

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

      // Distinguish a clean single-click / tap from a rotational drag
      const isSingleClick = movement < 15 && elapsed < 450;
      rotState.current.isDragging = false;

      if (isSingleClick && !rotState.current.isLaunching) {
        const hit = getFaceAtClientPos(clientX, clientY);
        if (hit && hit.game) {
          // SINGLE CLICK ON THE DICE FACE OPENS THE GAME DIRECTLY!
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
          rotState.current.rx = THREE.MathUtils.lerp(rotState.current.rx, targetRot.x, ease * 0.2);
          rotState.current.ry = THREE.MathUtils.lerp(rotState.current.ry, targetRot.y, ease * 0.2);
          rotState.current.rz = THREE.MathUtils.lerp(rotState.current.rz, targetRot.z, ease * 0.2);
        }

        cube.scale.setScalar(1 + progress * 0.45);
        camera.position.z = THREE.MathUtils.lerp(4.2, 2.7, ease);
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

        cube.position.y = Math.sin(elapsed * 1.5) * 0.08;
      }

      cube.rotation.x = rotState.current.rx;
      cube.rotation.y = rotState.current.ry;
      cube.rotation.z = rotState.current.rz;

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
      geometry.dispose();
      materials.forEach((m) => {
        m.map.dispose();
        m.dispose();
      });
      edges.dispose();
      lineMaterial.dispose();
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
      <div className="relative w-full h-[430px] md:h-[490px] flex items-center justify-center select-none">
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
                  SINGLE-CLICK TO OPEN: <strong className="text-white">{hoveredGame.name.toUpperCase()}</strong> (100 LEVELS)
                </span>
              ) : (
                <span>Single-click any side of dice to launch game!</span>
              )}
            </span>
          </div>

          {/* Right: Orbit Tip */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-slate-300">
            <RotateCw className="w-3.5 h-3.5 text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Drag to rotate in 3D</span>
          </div>
        </div>

        {/* Face Selector Mini Badges - Single click launches directly */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 md:gap-2.5 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-2xl">
          {GAMES.map((game, idx) => {
            const isHovered = hoveredGame && hoveredGame.id === game.id;
            const isCurrent = selectedGame.id === game.id;
            return (
              <button
                key={game.id}
                onClick={() => launchGame(game)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  isHovered || isCurrent
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105 border border-purple-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/15 border border-transparent'
                }`}
                title={`Single-click to open ${game.name} (Levels 1-100)`}
              >
                <span className="text-sm">{game.icon}</span>
                <span className="font-mono font-bold">F{idx + 1}</span>
                <span className="hidden md:inline text-[10px] text-purple-200 uppercase">{game.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Game Card with Direct Single-Click Info & Controls */}
      <div className="w-full max-w-2xl mt-4 p-5 rounded-3xl glass-panel text-center relative overflow-hidden transition-all duration-300 border border-white/15 shadow-2xl">
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
          <span>FACE {selectedGame.number} • 100 LEVELS (EASY ➔ SUPER HARD)</span>
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            <Dices className={`w-4 h-4 text-purple-400 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Tumbling Quantum Dice...' : 'Roll Random Face'}</span>
          </button>

          <button
            onClick={() => launchGame(selectedGame)}
            disabled={isLaunching}
            className="btn-cosmic flex items-center gap-2.5 px-8 py-3 rounded-2xl text-base font-bold font-orbitron shadow-xl"
            style={{ borderColor: selectedGame.color }}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>LAUNCH {selectedGame.name.toUpperCase()} (LVL 1-100)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
