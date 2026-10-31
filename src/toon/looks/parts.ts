// Shared head geometry for every look: the same Person (Looks.tsx CAST) gives the same silhouette of hair, scarf,
// pigtails in the puppet, linocut and cutaway looks. R = head radius; the head centre is (0, 0).
import {Person} from './Looks';

export const headPath = (R: number) => `M 0 ${-R} C ${R * 0.62} ${-R} ${R * 0.96} ${-R * 0.6} ${R * 0.94} ${R * 0.05} C ${R * 0.92} ${R * 0.62} ${R * 0.52} ${R} 0 ${R} C ${-R * 0.52} ${R} ${-R * 0.92} ${R * 0.62} ${-R * 0.94} ${R * 0.05} C ${-R * 0.96} ${-R * 0.6} ${-R * 0.62} ${-R} 0 ${-R} Z`;

// hair or headwear: `back` is drawn behind the head, `front` over it
export const hairPaths = (R: number, p: Person): {back: string[]; front: string[]; extra: string[]} => {
  const cap = `M ${-R * 0.98} ${-R * 0.1} C ${-R * 1.06} ${-R * 1.22} ${R * 1.06} ${-R * 1.22} ${R * 0.98} ${-R * 0.1} Q ${R * 0.55} ${-R * 0.62} ${R * 0.05} ${-R * 0.52} Q ${-R * 0.5} ${-R * 0.64} ${-R * 0.98} ${-R * 0.1} Z`;
  const spikes = [[-0.6, -0.95, -25], [-0.15, -1.12, -6], [0.35, -1.08, 14], [0.75, -0.8, 35]].map(([cx, cy, a]) => {
    const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180), X = cx * R, Y = cy * R;
    const pt = (dx: number, dy: number) => `${X + dx * c - dy * s} ${Y + dx * s + dy * c}`;
    return `M ${pt(-R * 0.14, R * 0.1)} L ${pt(0, -R * 0.24)} L ${pt(R * 0.14, R * 0.1)} Z`;
  });
  const ell = (cx: number, cy: number, rx: number, ry: number) => `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
  switch (p.hair) {
    case 'messy': return {back: [], front: [cap, ...spikes], extra: []};
    case 'bald': return {back: [], front: [ell(-R * 0.9, -R * 0.12, R * 0.18, R * 0.32), ell(R * 0.9, -R * 0.12, R * 0.18, R * 0.32)], extra: []};
    case 'bun': return {back: [ell(0, -R * 1.05, R * 0.36, R * 0.36)], front: [cap], extra: []};
    case 'long': return {back: [`M ${-R * 1.02} ${-R * 0.2} L ${-R * 1.02} ${R * 1.2} Q 0 ${R * 1.4} ${R * 1.02} ${R * 1.2} L ${R * 1.02} ${-R * 0.2} Z`], front: [cap], extra: []};
    case 'pigtails': return {back: [ell(-R * 1.12, R * 0.25, R * 0.3, R * 0.5), ell(R * 1.12, R * 0.25, R * 0.3, R * 0.5)], front: [cap], extra: []};
    case 'scarf': return {
      back: [`M ${-R * 1.12} ${R * 0.1} C ${-R * 1.3} ${-R * 1.35} ${R * 1.3} ${-R * 1.35} ${R * 1.12} ${R * 0.1} L ${R * 0.95} ${R * 1.25} L ${-R * 0.95} ${R * 1.25} Z`],
      front: [`M ${-R * 1.1} ${R * 0.15} C ${-R * 1.22} ${-R * 1.3} ${R * 1.22} ${-R * 1.3} ${R * 1.1} ${R * 0.15} Q ${R * 0.85} ${-R * 0.5} 0 ${-R * 0.55} Q ${-R * 0.85} ${-R * 0.5} ${-R * 1.1} ${R * 0.15} Z`],
      extra: [`M ${-R * 0.25} ${R * 1.02} L ${R * 0.25} ${R * 1.02} L ${R * 0.12} ${R * 1.36} L ${-R * 0.12} ${R * 1.36} Z`]};
    default: return {back: [], front: [cap], extra: []};
  }
};

export const mustachePath = (R: number) => `M ${-R * 0.3} ${R * 0.42} Q ${-R * 0.15} ${R * 0.26} 0 ${R * 0.36} Q ${R * 0.15} ${R * 0.26} ${R * 0.3} ${R * 0.42} Q 0 ${R * 0.48} ${-R * 0.3} ${R * 0.42} Z`;
export const creepyMouth = (R: number, y: number) => `M ${-R * 0.52} ${y - R * 0.12} Q 0 ${y + R * 0.38} ${R * 0.52} ${y - R * 0.12} Q 0 ${y + R * 0.1} ${-R * 0.52} ${y - R * 0.12} Z`;

// time quantised to `fps` steps: stepped "on twos" or puppet-like jerky motion
export const stepT = (t: number, fps: number) => Math.floor(t * fps) / fps;
