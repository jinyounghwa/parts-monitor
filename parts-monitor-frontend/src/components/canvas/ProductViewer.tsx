'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stage, Float, Text, Html } from '@react-three/drei'
import * as THREE from 'three'

function ProceduralPart({ type, name }: { type?: string; name: string }) {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHover] = useState(false)

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  // Simple procedural generation logic based on name hashing or type
  // If type contains 'IC', 'MCU', 'Processor' -> Flat Box with pins
  // If type contains 'Capacitor', 'Resistor' -> Cylinder
  // Default -> Box

  const isChip = name.includes('IC') || name.includes('MCU') || name.includes('Processor') || type?.includes('IC')
  const isCylindrical = name.includes('Cap') || name.includes('Res') || type?.includes('Capacitor')

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {isCylindrical ? (
          <mesh
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hovered ? 1.1 : 1}
          >
            <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
            <meshStandardMaterial color={hovered ? '#60a5fa' : '#3b82f6'} roughness={0.3} metalness={0.8} />
          </mesh>
        ) : isChip ? (
          <group
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hovered ? 1.1 : 1}
          >
            {/* Chip Body */}
            <mesh>
              <boxGeometry args={[2, 0.2, 2]} />
              <meshStandardMaterial color="#1f2937" roughness={0.2} metalness={0.1} />
            </mesh>
            {/* Pins (Simplified) */}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={i} position={[1.1, 0, (i - 3.5) * 0.5]}>
                <boxGeometry args={[0.2, 0.05, 0.2]} />
                <meshStandardMaterial color="#d1d5db" metalness={1} roughness={0.2} />
              </mesh>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <mesh key={`l-${i}`} position={[-1.1, 0, (i - 3.5) * 0.5]}>
                <boxGeometry args={[0.2, 0.05, 0.2]} />
                <meshStandardMaterial color="#d1d5db" metalness={1} roughness={0.2} />
              </mesh>
            ))}
          </group>
        ) : (
          <mesh
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hovered ? 1.1 : 1}
          >
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial color={hovered ? '#60a5fa' : '#475569'} roughness={0.1} metalness={0.5} />
          </mesh>
        )}
      </Float>
      
      <Html position={[0, -2, 0]} center>
        <div className="bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm whitespace-nowrap">
          {name}
        </div>
      </Html>
    </group>
  )
}

export default function ProductViewer({ type, name }: { type?: string; name: string }) {
  return (
    <div className="w-full h-[300px] bg-gray-100 dark:bg-gray-900/50 rounded-lg overflow-hidden relative">
      <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Stage environment="city" intensity={0.5}>
          <ProceduralPart type={type} name={name} />
        </Stage>
        <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={false} />
      </Canvas>
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 dark:bg-black/80 px-2 py-1 rounded">
        Interactive 3D View
      </div>
    </div>
  )
}
