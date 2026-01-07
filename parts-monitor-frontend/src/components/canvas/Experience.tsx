'use client'

import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei'
import { FloatingPart } from './FloatingPart'
import { Suspense } from 'react'

export default function Experience() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <group position={[3, 0, -2]}>
            <FloatingPart position={[-2, 2, 0]} color="#3b82f6" /> {/* Blue */}
            <FloatingPart position={[2, 1, -2]} color="#10b981" /> {/* Emerald */}
            <FloatingPart position={[-1, -2, 1]} color="#f59e0b" /> {/* Amber */}
            <FloatingPart position={[3, -1, 0]} color="#ef4444" /> {/* Red */}
            <FloatingPart position={[0, 0, 0]} scale={1.5} color="#6366f1" /> {/* Indigo */}
          </group>

          <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  )
}
