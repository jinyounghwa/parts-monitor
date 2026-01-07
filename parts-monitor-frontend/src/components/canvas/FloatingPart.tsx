'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

import { ThreeElements } from '@react-three/fiber'

type FloatingPartProps = ThreeElements['mesh'] & {
  color?: string
}

export function FloatingPart(props: FloatingPartProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2
      meshRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <Float
      speed={2} 
      rotationIntensity={1} 
      floatIntensity={1} 
      floatingRange={[-0.5, 0.5]}
    >
      <mesh
        {...props}
        ref={meshRef}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        scale={hovered ? 1.2 : 1}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={hovered ? '#4f46e5' : props.color || '#e2e8f0'}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}
