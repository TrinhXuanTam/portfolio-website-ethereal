import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Procedural gradient "artwork" per project (no raster assets) with a liquid
// displacement that intensifies on hover and leans toward the cursor. Each
// project seeds a different hue rotation so the three panels feel distinct.
// Uses frameloop="demand"-ish behavior via a hover flag to stay cheap.

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
  uniform float uHover;     // 0..1 eased
  uniform vec2  uMouse;     // local uv of cursor, 0..1
  uniform float uSeed;

  vec3 palette(float t) {
    // desaturated sage / azure / sand rotated per-seed
    vec3 a = vec3(0.78, 0.80, 0.75);
    vec3 b = vec3(0.16, 0.14, 0.18);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.15 + uSeed * 0.33, 0.35 + uSeed * 0.2, 0.62 - uSeed * 0.18);
    return a + b * cos(6.28318 * (c * t + d));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;

    // Liquid displacement: warp uv by flowing noise, stronger on hover and
    // pulled toward the cursor for a "reveal" that follows the pointer.
    float t = uTime * 0.15;
    vec2 toMouse = uv - uMouse;
    float ripple = uHover * 0.06 * sin(length(toMouse) * 14.0 - uTime * 2.5);
    vec2 warp = vec2(
      noise(uv * 3.0 + t),
      noise(uv * 3.0 - t + 5.0)
    ) - 0.5;
    uv += warp * (0.05 + uHover * 0.10);
    uv += normalize(toMouse + 0.0001) * ripple;

    float g = noise(uv * 2.2 + t * 0.5);
    vec3 col = palette(g * 0.6 + uSeed * 0.25 + length(uv - 0.5) * 0.4);

    // soft inner vignette to keep it refined
    float vig = smoothstep(1.1, 0.2, distance(vUv, vec2(0.5)));
    col = mix(col * 0.92, col, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`

function Plane({ hoverRef, seed }) {
  const matRef = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uSeed: { value: seed },
    }),
    [seed]
  )

  const { invalidate } = useThree()
  // expose invalidate so the outer DOM handlers can kick the on-demand loop
  hoverRef.current.invalidate = invalidate

  useFrame((_, delta) => {
    if (!matRef.current) return
    const u = matRef.current.uniforms
    u.uTime.value += delta
    // ease hover
    u.uHover.value += (hoverRef.current.active - u.uHover.value) * 0.08
    u.uMouse.value.x += (hoverRef.current.x - u.uMouse.value.x) * 0.1
    u.uMouse.value.y += (hoverRef.current.y - u.uMouse.value.y) * 0.1

    // On-demand render loop: keep requesting frames only while the panel is
    // hovered OR the hover ease is still settling. At rest it stops entirely,
    // so idle/off-screen panels cost nothing (frameloop="demand").
    if (hoverRef.current.active > 0.001 || u.uHover.value > 0.002) {
      invalidate()
    }
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
      />
    </mesh>
  )
}

export default function ProjectArt({ seed = 0 }) {
  const hoverRef = useRef({ active: 0, x: 0.5, y: 0.5 })

  // Cache the panel rect on enter (avoids getBoundingClientRect on every move).
  const rectRef = useRef(null)
  const onMove = (e) => {
    const rect = rectRef.current || e.currentTarget.getBoundingClientRect()
    hoverRef.current.x = (e.clientX - rect.left) / rect.width
    hoverRef.current.y = 1 - (e.clientY - rect.top) / rect.height
    hoverRef.current.invalidate?.()
  }
  const onEnter = (e) => {
    rectRef.current = e.currentTarget.getBoundingClientRect()
    hoverRef.current.active = 1
    hoverRef.current.invalidate?.() // kick the on-demand loop
  }
  const onLeave = () => {
    hoverRef.current.active = 0
    hoverRef.current.invalidate?.() // let it render the ease-out then settle
  }

  return (
    <div
      className="h-full w-full"
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <Canvas
        frameloop="demand"
        dpr={1}
        gl={{ antialias: false, alpha: false }}
        camera={{ position: [0, 0, 1] }}
      >
        <Plane hoverRef={hoverRef} seed={seed} />
      </Canvas>
    </div>
  )
}
