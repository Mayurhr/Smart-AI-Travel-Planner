/**
 * Smart AI Travel Planner 3.0
 * Procedural 3D Earth Component with Three.js
 *
 * Implements:
 * - High-fidelity azure ocean gradient with procedural continent blobs
 * - Realistic atmospheric halo glow shader
 * - Pulsing waypoint rings for active itineraries
 * - Bezier curved flight trajectory arcs
 * - Inertia-damped mouse drag & tilt interaction
 * - Zero external 404 dependencies (100% procedural textures)
 * - Safe WebGL lifecycle with canvas mount ref & cleanup
 * - Graceful fallback if WebGL is unavailable
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Waypoint {
  name: string;
  lat: number;
  lon: number;
  color: number;
  label?: string;
  affinity?: string;
  temp?: string;
}

interface Earth3DProps {
  height?: string;
  activeFilter?: 'all' | 'flights' | 'hotels' | 'route';
  onSelectWaypoint?: (wpName: string) => void;
  interactive?: boolean;
}

const DEFAULT_WAYPOINTS: Waypoint[] = [
  { name: 'Amalfi Coast', lat: 40.6333, lon: 14.6029, color: 0x0891b2, label: 'Amalfi Coast, Italy', affinity: '98% Affinity', temp: '24°C Twilight' },
  { name: 'Kyoto Arashiyama', lat: 35.0116, lon: 135.6775, color: 0x7c3aed, label: 'Kyoto, Japan', affinity: '96% Affinity', temp: '17°C Mist Season' },
  { name: 'Lapland Levi', lat: 68.9063, lon: 27.0289, color: 0x0284c7, label: 'Lapland, Finland', affinity: '99% Affinity', temp: '-4°C Clear Sky' },
  { name: 'London Kloten', lat: 51.5074, lon: -0.1278, color: 0x7c3aed, label: 'London, UK', affinity: '94% Affinity', temp: '18°C' },
  { name: 'Paris Capital', lat: 48.8566, lon: 2.3522, color: 0x0891b2, label: 'Paris, France', affinity: '95% Affinity', temp: '19°C' },
  { name: 'Swiss Alps', lat: 46.8182, lon: 8.2275, color: 0x10b981, label: 'Interlaken, CH', affinity: '97% Affinity', temp: '12°C Alpine' },
  { name: 'Rome Heights', lat: 41.9028, lon: 12.4964, color: 0xf59e0b, label: 'Rome, Italy', affinity: '93% Affinity', temp: '22°C' },
  { name: 'Santorini Caldera', lat: 36.3932, lon: 25.4615, color: 0xec4899, label: 'Santorini, Greece', affinity: '98% Affinity', temp: '23°C Sunny' },
];

export const Earth3D: React.FC<Earth3DProps> = ({
  height = '520px',
  activeFilter = 'all',
  onSelectWaypoint,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);
  const [selectedPin, setSelectedPin] = useState<string>('Amalfi Coast');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 520;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 0, 3.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(width, heightPx);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch {
      setWebglSupported(false);
      return;
    }

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Procedural High-Fidelity Canvas Texture for Earth
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = 2048;
    mapCanvas.height = 1024;
    const ctx = mapCanvas.getContext('2d');

    if (ctx) {
      // Azure & Cyan Ocean Gradient
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      oceanGrad.addColorStop(0, '#0284c7');
      oceanGrad.addColorStop(0.35, '#0369a1');
      oceanGrad.addColorStop(0.7, '#0891b2');
      oceanGrad.addColorStop(1, '#0e7490');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 2048, 1024);

      // Lat/Lon subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.2;
      for (let x = 0; x < 2048; x += 128) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1024);
        ctx.stroke();
      }
      for (let y = 0; y < 1024; y += 128) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(2048, y);
        ctx.stroke();
      }

      // Procedural continents (crisp pearl white)
      ctx.fillStyle = '#f8fafc';
      const drawBlob = (cx: number, cy: number, rx: number, ry: number, seed: number) => {
        ctx.beginPath();
        const pts = 32;
        for (let i = 0; i <= pts; i++) {
          const angle = (i / pts) * Math.PI * 2;
          const wobble = Math.sin(angle * 3 + seed) * 0.18 + Math.cos(angle * 6 + seed) * 0.12;
          const x = cx + Math.cos(angle) * (rx * (1 + wobble));
          const y = cy + Math.sin(angle) * (ry * (1 + wobble));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      };

      drawBlob(480, 310, 190, 120, 1.3); // N. America
      drawBlob(360, 250, 110, 80, 2.5);
      drawBlob(640, 680, 110, 170, 3.2); // S. America
      drawBlob(1050, 280, 95, 75, 4.1);  // Europe
      drawBlob(1090, 320, 85, 65, 1.8);
      drawBlob(1080, 560, 140, 170, 5.5); // Africa
      drawBlob(1360, 440, 75, 95, 6.7);  // India
      drawBlob(1420, 310, 250, 160, 6.2); // Asia
      drawBlob(1670, 350, 35, 75, 8.4);  // Japan
      drawBlob(1610, 750, 130, 95, 9.3); // Australia
      drawBlob(1024, 990, 850, 60, 0.4); // Antarctica
    }

    const earthTexture = new THREE.CanvasTexture(mapCanvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    // Earth Mesh
    const earthGeo = new THREE.SphereGeometry(1.22, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specular: 0x38bdf8,
      shininess: 30,
      emissive: 0x0284c7,
      emissiveIntensity: 0.12,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Subtle cloud layer
    const cloudGeo = new THREE.SphereGeometry(1.238, 48, 48);
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    globeGroup.add(cloudMesh);

    // Navigational cyan wireframe
    const wireGeo = new THREE.SphereGeometry(1.242, 36, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0891b2,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // Outer atmospheric halo
    const haloGeo = new THREE.SphereGeometry(1.38, 32, 32);
    const haloMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(0.03, 0.57, 0.7, 1.0) * intensity * 0.95;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    // Helper: Lat/Lon to Vector3
    const latLonToVec3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // Waypoint Markers
    const markerRings: THREE.Mesh[] = [];
    DEFAULT_WAYPOINTS.forEach((wp) => {
      const pos = latLonToVec3(wp.lat, wp.lon, 1.25);

      const pinGeo = new THREE.SphereGeometry(0.024, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: wp.color });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos);
      globeGroup.add(pin);

      const ringGeo = new THREE.RingGeometry(0.032, 0.052, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: wp.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos.clone().multiplyScalar(1.006));
      ring.lookAt(pos.clone().multiplyScalar(2));
      globeGroup.add(ring);
      markerRings.push(ring);
    });

    // Connecting curved flight trajectory arcs
    for (let i = 0; i < DEFAULT_WAYPOINTS.length - 1; i++) {
      const p1 = latLonToVec3(DEFAULT_WAYPOINTS[i].lat, DEFAULT_WAYPOINTS[i].lon, 1.25);
      const p2 = latLonToVec3(DEFAULT_WAYPOINTS[i + 1].lat, DEFAULT_WAYPOINTS[i + 1].lon, 1.25);
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(1.48);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(36);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.75,
        linewidth: 2,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(arcLine);
    }

    // Studio Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.35);
    sunLight.position.set(5, 4, 4);
    scene.add(sunLight);

    const fillCyan = new THREE.DirectionalLight(0x38bdf8, 0.75);
    fillCyan.position.set(-5, -2, -3);
    scene.add(fillCyan);

    // Mouse drag and tilt interaction with smooth damping
    let targetRotX = 0.45;
    let targetRotY = -0.3; // Initial orientation towards Europe/Mediterranean
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.005;
        targetRotX += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        const normY = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotY += normX * 0.0008;
        targetRotX += normY * 0.0004;
      }
    };

    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        targetRotY += 0.0012; // Slow elegant auto-rotation
      }

      globeGroup.rotation.y += (targetRotY - globeGroup.rotation.y) * 0.06;
      globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.06;
      cloudMesh.rotation.y += 0.0004;

      markerRings.forEach((ring, idx) => {
        const pulse = 1 + Math.sin(elapsed * 3.5 + idx * 1.2) * 0.3;
        ring.scale.set(pulse, pulse, pulse);
        const ringMat = ring.material as THREE.MeshBasicMaterial;
        if (ringMat) {
          ringMat.opacity = Math.max(0.2, 0.85 - (pulse - 1));
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
    };
  }, [interactive]);

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#EFF6FF] via-[#F8FAFC] to-white border border-[#E2E8F0] shadow-sm overflow-hidden select-none">
      {/* 3D Canvas Mount Point */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full relative flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {!webglSupported && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 w-full h-full">
            <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl">public</span>
            </div>
            <h4 className="text-base font-bold text-slate-800">2D Cartography Projection Active</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Live orbital rendering gracefully downgraded to high-resolution vector coordinates.
            </p>
          </div>
        )}
      </div>

      {/* Floating Telemetry Badges (Amalfi, Kyoto, Lapland) */}
      <div className="absolute top-4 left-4 z-10 hidden sm:block">
        <div
          onClick={() => {
            setSelectedPin('Amalfi Coast');
            onSelectWaypoint?.('Amalfi Coast');
          }}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border ${
            selectedPin === 'Amalfi Coast' ? 'border-[#0891B2] ring-2 ring-[#0891B2]/20' : 'border-[#E2E8F0]'
          } shadow-sm cursor-pointer hover:scale-102 transition-all`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#0891B2]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#0F172A]">Amalfi Coast</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EFF6FF] text-[#0891B2] font-bold">98% Affinity</span>
            </div>
            <span className="text-[11px] text-[#64748B] font-mono">24°C Twilight · Sea 22°C</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 hidden sm:block">
        <div
          onClick={() => {
            setSelectedPin('Kyoto Arashiyama');
            onSelectWaypoint?.('Kyoto Arashiyama');
          }}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border ${
            selectedPin === 'Kyoto Arashiyama' ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20' : 'border-[#E2E8F0]'
          } shadow-sm cursor-pointer hover:scale-102 transition-all`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#0F172A]">Kyoto Arashiyama</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F5F3FF] text-[#7C3AED] font-bold">96% Affinity</span>
            </div>
            <span className="text-[11px] text-[#64748B] font-mono">17°C Mist Season · Dew 94%</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-16 left-4 z-10 hidden sm:block">
        <div
          onClick={() => {
            setSelectedPin('Lapland Levi');
            onSelectWaypoint?.('Lapland Levi');
          }}
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border ${
            selectedPin === 'Lapland Levi' ? 'border-[#0891B2] ring-2 ring-[#0891B2]/20' : 'border-[#E2E8F0]'
          } shadow-sm cursor-pointer hover:scale-102 transition-all`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#0F172A]">Finnish Lapland</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EFF6FF] text-[#0891B2] font-bold">99% Affinity</span>
            </div>
            <span className="text-[11px] text-[#64748B] font-mono">-4°C Clear Sky · Aurora Kp 6.2</span>
          </div>
        </div>
      </div>

    </div>
  );
};
