'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { Activity } from 'lucide-react'

function AnimatedGlobe({ status }: { status: 'normal' | 'warning' | 'error' }) {
  const color = status === 'error' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#3b82f6'
  
  return (
    <Sphere args={[1, 32, 32]} scale={2}>
      <MeshDistortMaterial
        color={color}
        envMapIntensity={0.4}
        clearcoat={0.8}
        clearcoatRoughness={0}
        metalness={0.1}
        distort={0.4}
        speed={2}
      />
    </Sphere>
  )
}

export default function DashboardScene({ status = 'normal' }: { status?: 'normal' | 'warning' | 'error' }) {
  return (
    <div className="relative w-full h-full min-h-[120px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedGlobe status={status} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={5} />
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Activity className="w-8 h-8 text-white opacity-80" />
      </div>
    </div>
  )
}
