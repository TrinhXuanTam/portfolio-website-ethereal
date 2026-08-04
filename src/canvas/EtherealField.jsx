import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { pointer } from '../lib/pointer'

// A whisper-quiet layer of atmospheric depth over the flat fluid gradient:
// a fine field of slowly drifting dust motes spread across several depth
// planes. No solid shapes — just faint specks that catch a little parallax as
// the cursor moves, giving the vast background a sense of 3D space without
// ever competing with the content. Deliberately barely-there.

const COUNT = 240

// Soft round sprite so motes are gentle dots, not hard squares.
function makeSprite() {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.5)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

export default function EtherealField() {
  const group = useRef()
  const { camera } = useThree()
  const target = useRef(new THREE.Vector2(0, 0))
  const sprite = useMemo(() => makeSprite(), [])

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = -Math.random() * 8 // spread into depth
      sizes[i] = 0.02 + Math.random() * 0.06
    }
    return { positions, sizes }
  }, [])

  useFrame((state) => {
    // ease a gentle parallax target toward the cursor
    target.current.x += (pointer.x - target.current.x) * 0.03
    target.current.y += (pointer.y - target.current.y) * 0.03

    if (group.current) {
      // very slight breathing drift so the motes never sit perfectly still
      group.current.rotation.y = state.clock.elapsedTime * 0.008
      group.current.position.x = target.current.x * 0.35
      group.current.position.y = target.current.y * 0.25
    }

    // barely-there camera lean for real depth parallax
    camera.position.x += (target.current.x * 0.25 - camera.position.x) * 0.04
    camera.position.y += (target.current.y * 0.18 - camera.position.y) * 0.04
    camera.lookAt(0, 0, -2)
  })

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={COUNT}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          map={sprite}
          size={0.08}
          sizeAttenuation
          color="#7f8a83"
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </group>
  )
}
