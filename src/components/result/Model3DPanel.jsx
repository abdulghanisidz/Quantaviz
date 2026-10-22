import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useTheme } from '../../contexts/ThemeContext'
import GlassCard from '../ui/GlassCard'

function pickSceneMode(text) {
  const normalized = String(text || '').toLowerCase()
  if (normalized.includes('atom') || normalized.includes('electron')) return 'atom'
  if (normalized.includes('orbit') || normalized.includes('planet') || normalized.includes('solar')) return 'orbit'
  if (normalized.includes('velocity') || normalized.includes('motion') || normalized.includes('speed')) return 'motion'
  return 'energy'
}

function EnergyMesh({ color, mode }) {
  const meshRef = useRef(null)
  const geometry = useMemo(() => {
    if (mode === 'atom') return new THREE.IcosahedronGeometry(1, 1)
    if (mode === 'orbit') return new THREE.TorusKnotGeometry(0.75, 0.22, 100, 16)
    if (mode === 'motion') return new THREE.CapsuleGeometry(0.55, 1, 8, 16)
    return new THREE.SphereGeometry(1.15, 64, 64)
  }, [mode])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.rotation.y += mode === 'motion' ? 0.01 : 0.006
    mesh.rotation.x = Math.sin(state.clock.elapsedTime * (mode === 'atom' ? 0.8 : 0.4)) * 0.2
    mesh.position.x = mode === 'motion' ? Math.sin(state.clock.elapsedTime * 1.2) * 0.55 : 0
    const scale = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04
    mesh.scale.setScalar(scale)
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color={color} metalness={0.88} roughness={0.22} emissive={color} emissiveIntensity={0.28} />
    </mesh>
  )
}

function Scene({ color, mode }) {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 3, 2]} intensity={1.15} />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color={color} />
      <EnergyMesh color={color} mode={mode} />
    </>
  )
}

export default function Model3DPanel({ label }) {
  const { accent } = useTheme()
  const mode = pickSceneMode(label)

  return (
    <GlassCard className="overflow-hidden">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
          3D visualization
        </h3>
        <span className="rounded-full bg-[var(--qv-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--qv-accent)]">
          Three.js
        </span>
      </div>
      <div className="h-[220px] w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-900/80 to-black md:h-[280px]">
        <Canvas camera={{ position: [0, 0, 3.4], fov: 45 }} gl={{ alpha: false }}>
          <Scene color={accent} mode={mode} />
        </Canvas>
      </div>
      {label ? <p className="mt-2 text-center text-xs text-slate-500">{label}</p> : null}
    </GlassCard>
  )
}
