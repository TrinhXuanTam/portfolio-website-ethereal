import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from '../lib/pointer'

// Full-screen plane running a custom GLSL fragment shader: layered domain-warped
// fractal noise blended between three desaturated accent colors (sage / azure /
// sand) over an alabaster base. The whole field drifts slowly and leans gently
// toward the cursor, reading as fluid mist rather than a defined shape.

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uMouse;      // smoothed, [-1,1]
  uniform float uScrollN;   // scroll progress, 0..1
  uniform float uScrollV;   // eased scroll velocity, ~[-1,1]
  uniform float uStrength;  // 0 = calm background, 1 = bold (transition)
  uniform float uAspect;
  uniform vec3  uBase;
  uniform vec3  uSage;
  uniform vec3  uAzure;
  uniform vec3  uSand;

  // -- simplex-ish value noise (cheap, smooth) -------------------------------
  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    // 4 octaves is plenty for a soft, blurred field and ~20% cheaper per pixel
    // than 5 — the top octave is imperceptible under the vignette + blur.
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv;
    p.x *= uAspect;

    // Scroll velocity adds to the flow of time, so scrolling makes the liquid
    // surge; scroll progress slowly shifts the field vertically. Combined with
    // the cursor drift, the background now reacts on touch devices too.
    // Stronger mode flows faster for a more alive, bolder liquid.
    float t = uTime * (0.08 + uStrength * 0.28) + uScrollV * 0.22;

    // Scale the field so we see broad liquid folds, and let the cursor / scroll
    // push the whole flow around like a finger dragging through water.
    p *= 1.35;
    vec2 drift = vec2(uMouse.x, uMouse.y) * 0.28
               + vec2(uScrollV * 0.2, -uScrollN * 0.6);

    // Domain warping — feed noise into noise for organic, churning liquid folds.
    // Every layer is animated in time so the folds continuously flow and fold
    // back on themselves rather than sitting nearly still.
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.9 * t) + drift),
      fbm(p + vec2(5.2, 1.3) - 0.7 * t + drift)
    );
    vec2 r = vec2(
      fbm(p + 2.2 * q + vec2(1.7 - 0.5 * t, 9.2 + 0.6 * t)),
      fbm(p + 2.2 * q + vec2(8.3 + 0.4 * t, 2.8 - 0.55 * t))
    );
    float f = fbm(p + 2.6 * r + 0.5 * t);

    // Map the field into gentle color bands.
    vec3 col = uBase;
    col = mix(col, uSage,  smoothstep(0.0, 0.7, f));
    col = mix(col, uAzure, smoothstep(0.25, 1.0, length(r)) * 0.7);
    col = mix(col, uSand,  smoothstep(0.15, 0.95, q.x) * 0.5);

    // Lift toward the base so accents stay whisper-soft when calm; in strong
    // mode the accents come through much more for a bold, saturated liquid.
    col = mix(uBase, col, mix(0.82, 1.0, uStrength));

    // Vast, calm vignette so edges melt into the page background; the vignette
    // flattens in strong mode so color fills the whole frame.
    float vig = smoothstep(1.35, 0.15, distance(uv, vec2(0.5)));
    col = mix(uBase, col, mix(0.58 + 0.42 * vig, 1.0, uStrength));

    // A faint fine grain to kill banding on such smooth gradients.
    float grain = (hash(uv * 850.0 + t).x) * 0.012;
    col += grain;

    gl_FragColor = vec4(col, 1.0);
  }
`

export default function FluidGradient({ strength = 0 }) {
  const matRef = useRef()
  const { size } = useThree()
  const smoothMouse = useRef(new THREE.Vector2(0, 0))

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScrollN: { value: 0 },
      uScrollV: { value: 0 },
      uStrength: { value: strength },
      uAspect: { value: 1 },
      uBase: { value: new THREE.Color('#f3f1eb') },
      uSage: { value: new THREE.Color('#93ab89') },
      uAzure: { value: new THREE.Color('#8fb0cb') },
      uSand: { value: new THREE.Color('#dcc7a2') },
    }),
    // strength only sets the initial value; live updates happen in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useFrame((_, delta) => {
    if (!matRef.current) return
    // Skip all shader work while the tab is hidden — saves CPU/GPU + battery.
    if (typeof document !== 'undefined' && document.hidden) return
    const u = matRef.current.uniforms
    u.uTime.value += delta
    u.uStrength.value = strength
    u.uAspect.value = size.width / size.height
    // Ease the smoothed mouse toward the shared pointer target.
    smoothMouse.current.x += (pointer.x - smoothMouse.current.x) * 0.025
    smoothMouse.current.y += (pointer.y - smoothMouse.current.y) * 0.025
    u.uMouse.value.copy(smoothMouse.current)

    // Scroll progress eases toward the target; velocity decays back to rest so
    // a scroll produces a surge that settles rather than a permanent offset.
    u.uScrollN.value += (pointer.scrollN - u.uScrollN.value) * 0.05
    u.uScrollV.value += (pointer.scrollV - u.uScrollV.value) * 0.06
    pointer.scrollV *= 0.92
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
