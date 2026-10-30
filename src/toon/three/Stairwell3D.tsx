// 3D stairwell of a panel block, seen from the open well between the flights: the camera falls through the floors
// like a POV run down the stairs. Switchback flights, landings, railings, two-tone painted walls, stencilled floor
// numbers, cold fluorescent lamps. Props are CC0 models from Poly Haven (public/models, textures stripped by
// scripts/gltf_flat.py) recoloured flat, so they sit in the outline-free "Красная нить" look.
// No shadows and no post-processing: it must stay cheap for software GL (TOON_GL=swangle).
import React, {useLayoutEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {continueRender, delayRender, staticFile} from 'remotion';
import {useThree} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

export const FLOOR_H = 2.8;
const X0 = -2.6, X1 = 2.6, Z0 = -1.6, Z1 = 1.6, LAND = 1.25, GAP = 0.45, STEPS = 9;
export const S3 = {
  bg: '#05070b', fog: '#070a0f', wallLow: '#1f4a4f', wallLowDark: '#173a3e', wallUp: '#5f6158', band: '#0f2a2d',
  slab: '#3e3934', slabEdge: '#221f1c', step: '#575049', rail: '#4a2a1a', bar: '#14171d',
  tube: '#e4fff0', lampLight: '#bff5d6', number: '#c23030', dark: '#0b0d12', camLed: '#ff2a2a', box: '#3b4a52', boxDoor: '#56666e',
};

const lam = new Map<string, THREE.MeshLambertMaterial>();
const L = (c: string, emissive?: string) => {
  const k = c + (emissive ?? '');
  if (!lam.has(k)) lam.set(k, new THREE.MeshLambertMaterial({color: c, emissive: emissive ?? '#000000'}));
  return lam.get(k)!;
};
const bas = new Map<string, THREE.MeshBasicMaterial>();
const B = (c: string) => { if (!bas.has(c)) bas.set(c, new THREE.MeshBasicMaterial({color: c})); return bas.get(c)!; };
const box = new THREE.BoxGeometry(1, 1, 1);

// one box from min/max corners
const Bx: React.FC<{a: [number, number, number]; b: [number, number, number]; m: THREE.Material}> = ({a, b, m}) => (
  <mesh geometry={box} material={m} position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]}
    scale={[Math.abs(b[0] - a[0]) || 0.001, Math.abs(b[1] - a[1]) || 0.001, Math.abs(b[2] - a[2]) || 0.001]} />
);

// ---------- CC0 models (loaded once, shared) ----------
const cache = new Map<string, THREE.Group>();
const useModel = (file: string) => {
  const [g, setG] = useState<THREE.Group | null>(cache.get(file) ?? null);
  const [handle] = useState(() => (cache.has(file) ? null : delayRender(`model ${file}`)));
  useLayoutEffect(() => {
    if (!handle) return;
    new GLTFLoader().load(staticFile(`models/${file}`), (gl) => { cache.set(file, gl.scene); setG(gl.scene); continueRender(handle); },
      undefined, (e) => { console.error(e); continueRender(handle); });
  }, [file, handle]);
  return g;
};
// clone of a model with every mesh painted one flat colour (glass parts may get their own)
const Model: React.FC<{file: string; color: string; glass?: string; emissive?: string; p: [number, number, number]; r?: [number, number, number]; s?: number}> =
  ({file, color, glass, emissive, p, r = [0, 0, 0], s = 1}) => {
  const g = useModel(file);
  const obj = useMemo(() => {
    if (!g) return null;
    const c = g.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const isGlass = /glass/i.test((m.material as THREE.Material)?.name ?? '');
      m.material = isGlass && glass ? (emissive ? B(glass) : L(glass)) : L(color);
    });
    return c;
  }, [g, color, glass, emissive]);
  return obj ? <primitive object={obj} position={p} rotation={r} scale={s} /> : null;
};

// stencilled floor number as a texture (made once per number)
const numTex = new Map<string, THREE.CanvasTexture>();
const NumberTex = (n: string) => {
  if (!numTex.has(n)) {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
    const x = cv.getContext('2d')!;
    x.fillStyle = S3.number; x.font = '900 200px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(n, 128, 140);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; numTex.set(n, tx);
  }
  return numTex.get(n)!;
};

// a flight of steps between two heights along x, on the strip z0..z1; balusters on the well side
const Flight: React.FC<{xa: number; xb: number; ya: number; yb: number; z0: number; z1: number; wellZ: number}> = ({xa, xb, ya, yb, z0, z1, wellZ}) => {
  const steps = [];
  const dx = (xb - xa) / STEPS, dy = (yb - ya) / STEPS;
  for (let i = 0; i < STEPS; i++) {
    const x = xa + dx * i, y = ya + dy * (i + 1);
    steps.push(<Bx key={i} a={[x, y - Math.abs(dy) - 0.02, z0]} b={[x + dx, y, z1]} m={L(i % 2 ? S3.step : S3.slab)} />);
  }
  // slanted slab under the steps
  const len = Math.hypot(xb - xa, yb - ya), ang = Math.atan2(yb - ya, xb - xa);
  const bars = [];
  for (let i = 0; i <= STEPS; i += 1) {
    const x = xa + dx * i, y = ya + dy * i;
    bars.push(<Bx key={i} a={[x - 0.012, y, wellZ - 0.012]} b={[x + 0.012, y + 0.95, wellZ + 0.012]} m={L(S3.bar)} />);
  }
  return (
    <group>
      {steps}
      <mesh geometry={box} material={L(S3.slabEdge)} position={[(xa + xb) / 2, (ya + yb) / 2 - 0.18, (z0 + z1) / 2]} rotation={[0, 0, ang]} scale={[len, 0.14, Math.abs(z1 - z0)]} />
      {bars}
      <mesh geometry={box} material={L(S3.rail)} position={[(xa + xb) / 2, (ya + yb) / 2 + 0.97, wellZ]} rotation={[0, 0, ang]} scale={[len, 0.06, 0.07]} />
    </group>
  );
};

// one storey: main landing (with the floor number, lamp and props) + mid landing, two flights going up
const Storey: React.FC<{n: number; lit: number; props?: boolean; lamp: string}> = ({n, lit, props, lamp}) => {
  const y = n * FLOOR_H, ym = y + FLOOR_H / 2;
  const wall = (side: 'x0' | 'x1' | 'z0' | 'z1', y0: number, y1: number) => {
    const t = 0.1;
    const span: [[number, number, number], [number, number, number]] =
      side === 'x0' ? [[X0 - t, y0, Z0], [X0, y1, Z1]] : side === 'x1' ? [[X1, y0, Z0], [X1 + t, y1, Z1]]
      : side === 'z0' ? [[X0, y0, Z0 - t], [X1, y0 + (y1 - y0), Z0]] : [[X0, y0, Z1], [X1, y1, Z1 + t]];
    return span;
  };
  const twoTone = (side: 'x0' | 'x1' | 'z0' | 'z1', y0: number, k: number) => {
    const lo = wall(side, y0, y0 + 1.5), hi = wall(side, y0 + 1.5, y0 + FLOOR_H), bd = wall(side, y0 + 1.48, y0 + 1.53);
    return <group key={side + k}>
      <Bx a={lo[0]} b={lo[1]} m={L(k % 2 ? S3.wallLowDark : S3.wallLow)} />
      <Bx a={hi[0]} b={hi[1]} m={L(S3.wallUp)} />
      <Bx a={bd[0]} b={bd[1]} m={L(S3.band)} />
    </group>;
  };
  return (
    <group>
      {(['x0', 'x1', 'z0', 'z1'] as const).map((s, i) => twoTone(s, y, n + i))}
      {/* main landing (left) and mid landing (right) */}
      <Bx a={[X0, y - 0.16, Z0]} b={[X0 + LAND, y, Z1]} m={L(S3.slab)} />
      <Bx a={[X1 - LAND, ym - 0.16, Z0]} b={[X1, ym, Z1]} m={L(S3.slab)} />
      {/* flight up: near strip, then back on the far strip */}
      <Flight xa={X0 + LAND} xb={X1 - LAND} ya={y} yb={ym} z0={GAP} z1={Z1} wellZ={GAP + 0.03} />
      <Flight xa={X1 - LAND} xb={X0 + LAND} ya={ym} yb={y + FLOOR_H} z0={Z0} z1={-GAP} wellZ={-GAP - 0.03} />
      {/* railings along the landings' well edge */}
      <Bx a={[X0 + LAND - 0.03, y, -GAP]} b={[X0 + LAND, y + 0.95, GAP]} m={L(S3.bar)} />
      <Bx a={[X1 - LAND, ym, -GAP]} b={[X1 - LAND + 0.03, ym + 0.95, GAP]} m={L(S3.bar)} />
      {/* door to the flat + stencilled number on the landing wall */}
      <Bx a={[X0 - 0.02, y, -0.55]} b={[X0 + 0.02, y + 2.05, 0.45]} m={L('#3a2a22')} />
      <mesh position={[X0 + 0.03, y + 1.95, 1.05]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshBasicMaterial map={NumberTex(String(n))} transparent opacity={0.5 + 0.5 * lit} toneMapped={false} />
      </mesh>
      {/* lamp over the landing: CC0 fluorescent fixture, glowing tube when the floor is lit */}
      <Model file="mounted_fluorescent_lights.glb" color="#2b2f36" glass={lit > 0.5 ? S3.tube : '#3a3f44'} emissive={lit > 0.5 ? 'y' : undefined}
        p={[X0 + 0.6, y + FLOOR_H - 0.08, 0]} r={[Math.PI, Math.PI / 2, 0]} s={0.9} />
      {lit > 0 && <pointLight position={[X0 + 0.8, y + FLOOR_H - 0.5, 0]} color={lamp} intensity={13 * lit} distance={7} decay={1.6} />}
      {props && <Model file="power_box_01.glb" color={S3.box} p={[X0 + 0.25, y + 1.0, -1.35]} r={[0, 0, 0]} s={1.3} />}
    </group>
  );
};

export type StairCam = {y: number; yaw: number; bob: number};

const Camera: React.FC<{c: StairCam}> = ({c}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const r = 0.22;
    cam.position.set(Math.cos(c.yaw) * r + 0.1, c.y + c.bob * 0.05, Math.sin(c.yaw) * r);
    cam.up.set(Math.cos(c.yaw + Math.PI / 2), 0, Math.sin(c.yaw + Math.PI / 2));
    cam.lookAt(Math.cos(c.yaw) * 0.1, c.y - 12, Math.sin(c.yaw) * 0.1);
    cam.fov = 72; cam.near = 0.05; cam.far = 60; cam.updateProjectionMatrix();
  });
  return null;
};

// floors 1..top; `lit(n)` 0..1 per floor (flicker, dead lamps); `camLed` blinks the CCTV led on the top floor
// `alarm` 0..1 turns the lamps from cold fluorescent to red and opens the red glow at the bottom
export const Stairwell3D: React.FC<{cam: StairCam; top?: number; lit: (n: number) => number; camLed?: number; alarm?: number}> = ({cam, top = 10, lit, camLed = 1, alarm = 0}) => {
  const lamp = '#' + new THREE.Color(S3.lampLight).lerp(new THREE.Color('#ff4a3a'), alarm).getHexString();
  return <>
    <color attach="background" args={[S3.bg]} />
    <fog attach="fog" args={[S3.fog, 2.5, 16]} />
    <ambientLight intensity={0.55} color="#6a7aa0" />
    <hemisphereLight args={['#cfe8ff', '#1a1410', 0.3]} />
    <Camera c={cam} />
    {Array.from({length: top}, (_, i) => i + 1).map((n) => <Storey key={n} n={n} lit={lit(n)} props={n % 3 === 0} lamp={lamp} />)}
    {/* CCTV on the 9th floor, staring up the well */}
    <Model file="security_camera_01.glb" color="#c9ccd2" glass="#111" p={[X1 - 0.25, 9 * FLOOR_H + 2.3, Z1 - 0.3]} r={[0, -2.4, 0]} s={1.4} />
    <mesh position={[X1 - 0.4, 9 * FLOOR_H + 2.3, Z1 - 0.42]} material={B(camLed > 0.5 ? S3.camLed : '#401010')}><sphereGeometry args={[0.03, 8, 8]} /></mesh>
    {/* red exit glow at the bottom: where you are running to */}
    <pointLight position={[0, 1.2, 0]} color="#ff2a2a" intensity={40 + 80 * alarm} distance={14} decay={1.4} />
    {/* basement darkness */}
    <Bx a={[X0, -0.2, Z0]} b={[X1, 0, Z1]} m={L(S3.dark)} />
  </>;
};
