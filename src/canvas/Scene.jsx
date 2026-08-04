import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import FluidGradient from './FluidGradient'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The continuous WebGL background. Fixed behind all DOM (see .canvas-layer).
 * Rendered on demand where possible and capped DPR so the fluid shader never
 * costs frame rate on high-density displays.
 *
 * On reduced-motion we skip WebGL entirely and fall back to a static CSS wash.
 */
export default function Scene() {
  if (prefersReduced) {
    return (
      <div
        className="canvas-layer"
        style={{
          background:
            'radial-gradient(60% 60% at 30% 25%, rgba(169,189,161,0.30), transparent 60%),' +
            'radial-gradient(55% 55% at 75% 70%, rgba(166,190,210,0.28), transparent 60%),' +
            'radial-gradient(50% 50% at 60% 40%, rgba(226,210,182,0.25), transparent 60%),' +
            '#f3f1eb',
        }}
      />
    )
  }

  return (
    <div className="canvas-layer">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 1] }}
      >
        <Suspense fallback={null}>
          <FluidGradient />
        </Suspense>
      </Canvas>
    </div>
  )
}
