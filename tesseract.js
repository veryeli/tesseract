// --- helpers ---
const cssVar = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

// Colors from your theme
const outerColor = cssVar('--accent', '#9fffb9'); // outer cube
const innerColor = cssVar('--glow',   '#7df9ff'); // inner cube
const linkColor  = cssVar('--halo',   '#ffc6ff'); // bridges
const strokeInk  = cssVar('--ink',    '#e7f0ff');

const illoElem = document.querySelector('.illo');
if (!illoElem) { /* silently exit if header not on this page */ throw new Error('No .illo canvas found'); }

const TAU = Zdog.TAU;
let isSpinning = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : true;

// Responsive zoom
const baseSize = 200;
function computeZoom() {
  const minWindow = Math.min(window.innerWidth - 20, window.innerHeight - 120);
  return Math.min(4, Math.max(1, Math.floor(minWindow / (baseSize / 4)) / 4));
}
function setCanvasSize() {
  const zoom = computeZoom();
  illoElem.setAttribute('width',  baseSize * zoom);
  illoElem.setAttribute('height', baseSize * zoom);
  return zoom;
}
let zoom = setCanvasSize();
window.addEventListener('resize', () => { zoom = setCanvasSize(); illo.updateRenderGraph(); });

// Illustration
const illo = new Zdog.Illustration({
  element: illoElem,
  zoom,
  dragRotate: true,
});

// Sizes & strokes
const sizeOuter = 100;
const sizeInner = 66;
const strokeOuter = 3;
const strokeInner = 2;
const strokeLink  = 1.5;

// Initial tilt to avoid flat projections
const initialBoxRotation = { x: -TAU/20, y: TAU/8 };

// Outer cube
new Zdog.Box({
  addTo: illo,
  width: sizeOuter,
  height: sizeOuter,
  depth: sizeOuter,
  stroke: strokeOuter,
  color: outerColor,
  fill: false,
  rotate: initialBoxRotation,
});

// Inner cube on its own anchor (lets us add w-like phase)
const anchorInner = new Zdog.Anchor({
  addTo: illo,
  rotate: { z: 11 * TAU / 100 }
});

new Zdog.Box({
  addTo: anchorInner,
  width: sizeInner,
  height: sizeInner,
  depth: sizeInner,
  stroke: strokeInner,
  color: innerColor,
  fill: false,
  rotate: initialBoxRotation,
});

// Unit cube vertices (unchanged)
const vertices = [
  { x: -1, y: -1, z:  1 },
  { x: -1, y: -1, z: -1 },
  { x:  1, y: -1, z: -1 },
  { x:  1, y: -1, z:  1 },
  { x: -1, y:  1, z:  1 },
  { x: -1, y:  1, z: -1 },
  { x:  1, y:  1, z: -1 },
  { x:  1, y:  1, z:  1 },
];

// helper: rotate a fresh vector and return it
const rotVec = (x,y,z, rotObj) => new Zdog.Vector({x,y,z}).rotate(rotObj);
// helper: copy coords from vec B into vec A
const copyVec = (a, b) => { a.x=b.x; a.y=b.y; a.z=b.z; };

const links = [];  // { v, aVec, bVec, shape, glow? }

vertices.forEach((v) => {
  // live endpoints we’ll mutate every frame
  const aVec = new Zdog.Vector(); // outer endpoint
  const bVec = new Zdog.Vector(); // inner endpoint

  // main edge
  const shape = new Zdog.Shape({
    addTo: illo,
    path: [ aVec, bVec ],
    stroke: strokeLink,
    color: linkColor
  });

  // optional soft glow underlay
  const glow = new Zdog.Shape({
    addTo: illo,
    path: [ aVec, bVec ],
    stroke: strokeLink * 4.5,
    color: 'rgba(255,255,255,.12)'
  });

  links.push({ v, aVec, bVec, shape, glow });
});

function updateLinks(s, zRot){
  // half-sizes
  const ho = sizeOuter / 2;
  const hi = (sizeInner / 2) * s; // apply inner scale

  links.forEach(({ v, aVec, bVec }) => {
    // outer endpoint: scale to outer size, rotate by initialBoxRotation
    const Ao = rotVec(v.x * ho, v.y * ho, v.z * ho, initialBoxRotation);

    // inner endpoint: scale to inner size * current scale, rotate initial, then z phase
    let Bi = rotVec(v.x * hi, v.y * hi, v.z * hi, initialBoxRotation);
    Bi = Bi.rotate({ z: zRot });

    // copy into live vectors (so Zdog sees the change)
    copyVec(aVec, Ao);
    copyVec(bVec, Bi);
  });
}



// Animation loop: slow spin + subtle inner “w-pulse”
let ticker = 0;
const spinPeriod = 300;     // frames per full rotation
const pulsePeriod = 160;    // frames per inner scale pulse
const wobble = 0.12;        // radians wobble

function animate() {
  if (isSpinning) {
    const rot = (ticker % spinPeriod) / spinPeriod;
    const pulse = (ticker % pulsePeriod) / pulsePeriod;
    // Global rotation
    illo.rotate.x = Zdog.easeInOut(rot, 3) * TAU;
    illo.rotate.y = rot * TAU;
    // Inner “w-axis” feel via scale + phase shift
    const s = 0.88 + 0.12 * Math.sin(pulse * TAU);
    anchorInner.scale = { x: s, y: s, z: s };
    anchorInner.rotate.z = 0.11 * TAU + 0.06 * Math.sin((pulse + 0.25) * TAU);
    updateLinks(s, anchorInner.rotate.z);

    // gentle wobble so it doesn’t roll off
    illo.rotate.z = wobble * Math.sin(rot * TAU * 0.5);
    ticker++;
  }

  illo.updateRenderGraph();
  requestAnimationFrame(animate);
}
animate();