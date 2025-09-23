"use client"

import { Suspense, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Float } from "@react-three/drei"

function EnhancedGrocery3DCart() {
  const meshRef = useRef<any>()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2
    }
  })
  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={0.8}>
      <group ref={meshRef}>
        <mesh position={[0, 0, 0]} scale={[2.5, 2.5, 2.5]}>
          <boxGeometry args={[1, 0.8, 0.6]} />
          <meshStandardMaterial color="#164e63" metalness={0.3} roughness={0.2} emissive="#164e63" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0, 0.5, 0]} scale={[2.2, 0.1, 0.5]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#8b5cf6" metalness={0.5} roughness={0.1} emissive="#8b5cf6" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[-0.7, -0.5, 0]} scale={[0.4, 0.4, 0.4]}>
          <cylinderGeometry args={[0.5, 0.5, 0.2]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} emissive="#475569" emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0.7, -0.5, 0]} scale={[0.4, 0.4, 0.4]}>
          <cylinderGeometry args={[0.5, 0.5, 0.2]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} emissive="#475569" emissiveIntensity={0.1} />
        </mesh>
      </group>
    </Float>
  )
}

function AdvancedParticleField() {
  const groupRef = useRef<any>()
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002
      groupRef.current.rotation.x += 0.001
      groupRef.current.children.forEach((particle: any, index: number) => {
        const time = state.clock.elapsedTime
        const speed = 0.3 + (index % 4) * 0.15
        particle.position.x += Math.sin(time * speed + index * 0.5) * 0.003
        particle.position.y += Math.cos(time * speed * 0.8 + index * 0.3) * 0.002
        particle.position.z += Math.sin(time * speed * 0.6 + index * 0.7) * 0.0025
        const scale = 1 + Math.sin(time * 2 + index) * 0.3
        particle.scale.setScalar(scale)
        if (particle.position.x > 20) particle.position.x = -20
        if (particle.position.x < -20) particle.position.x = 20
        if (particle.position.y > 15) particle.position.y = -15
        if (particle.position.y < -15) particle.position.y = 15
        if (particle.position.z > 15) particle.position.z = -15
        if (particle.position.z < -15) particle.position.z = 15
      })
    }
  })
  const particles = Array.from({ length: 200 }, (_, i) => {
    const x = (Math.random() - 0.5) * 40
    const y = (Math.random() - 0.5) * 30
    const z = (Math.random() - 0.5) * 30
    const size = Math.random() * 0.06 + 0.02
    const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]
    const color = colors[i % 5]
    return (
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[size]} />
        <meshStandardMaterial color={color} opacity={0.9} transparent emissive={color} emissiveIntensity={0.4} metalness={0.2} roughness={0.8} />
      </mesh>
    )
  })
  return <group ref={groupRef}>{particles}</group>
}

function MorphingObjects() {
  const groupRef = useRef<any>()
  const cubeRefs = useRef<any[]>(Array(15).fill(null).map(() => useRef<any>()))
  const sphereRefs = useRef<any[]>(Array(10).fill(null).map(() => useRef<any>()))
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Animate small cubes
    cubeRefs.current.forEach((ref, i) => {
      if (ref.current) {
        // Different rotation speeds for each cube
        ref.current.rotation.x += 0.005 + (i % 5) * 0.002
        ref.current.rotation.y += 0.007 + (i % 3) * 0.003
        ref.current.rotation.z += 0.003 + (i % 4) * 0.001
        
        // Different movement patterns
        const speedX = 0.2 + (i % 5) * 0.05
        const speedY = 0.15 + (i % 7) * 0.04
        const speedZ = 0.1 + (i % 3) * 0.06
        const radiusX = 5 + (i % 10) * 1.5
        const radiusY = 4 + (i % 8) * 1.2
        const radiusZ = 3 + (i % 6) * 0.8
        const phaseX = i * 0.5
        const phaseY = i * 0.7
        const phaseZ = i * 0.3
        
        ref.current.position.x = Math.sin(time * speedX + phaseX) * radiusX
        ref.current.position.y = Math.cos(time * speedY + phaseY) * radiusY
        ref.current.position.z = -10 + Math.sin(time * speedZ + phaseZ) * radiusZ
      }
    })
    
    // Animate spheres
    sphereRefs.current.forEach((ref, i) => {
      if (ref.current) {
        // Different rotation speeds for each sphere
        ref.current.rotation.y += 0.006 + (i % 4) * 0.002
        ref.current.rotation.z += 0.004 + (i % 5) * 0.001
        
        // Different movement patterns
        const speedX = 0.15 + (i % 6) * 0.04
        const speedY = 0.2 + (i % 4) * 0.05
        const speedZ = 0.12 + (i % 5) * 0.03
        const radiusX = 6 + (i % 8) * 1.3
        const radiusY = 5 + (i % 6) * 1.1
        const radiusZ = 4 + (i % 7) * 0.9
        const phaseX = i * 0.6
        const phaseY = i * 0.4
        const phaseZ = i * 0.8
        
        ref.current.position.x = Math.cos(time * speedX + phaseX) * radiusX
        ref.current.position.y = Math.sin(time * speedY + phaseY) * radiusY
        ref.current.position.z = -12 + Math.cos(time * speedZ + phaseZ) * radiusZ
      }
    })
  })
  
  // Generate small cubes
  const cubes = Array.from({ length: 15 }, (_, i) => {
    const size = 0.2 + Math.random() * 0.3
    const x = (Math.random() - 0.5) * 20
    const y = (Math.random() - 0.5) * 15
    const z = -10 - Math.random() * 10
    const color = i % 2 === 0 ? "#8b5cf6" : "#ec4899"
    
    return (
      <mesh key={`cube-${i}`} ref={cubeRefs.current[i]} position={[x, y, z]} scale={[size, size, size]} className="bg-3d-object bg-3d-object-cube">
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.4} 
          emissive={color} 
          emissiveIntensity={0.5} 
          metalness={0.4} 
          roughness={0.3} 
        />
      </mesh>
    )
  })
  
  // Generate spheres
  const spheres = Array.from({ length: 10 }, (_, i) => {
    const size = 0.15 + Math.random() * 0.25
    const x = (Math.random() - 0.5) * 20
    const y = (Math.random() - 0.5) * 15
    const z = -12 - Math.random() * 8
    const color = i % 2 === 0 ? "#ec4899" : "#8b5cf6"
    
    return (
      <mesh key={`sphere-${i}`} ref={sphereRefs.current[i]} position={[x, y, z]} scale={[size, size, size]} className="bg-3d-object bg-3d-object-sphere">
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.4} 
          emissive={color} 
          emissiveIntensity={0.5} 
          metalness={0.6} 
          roughness={0.2} 
        />
      </mesh>
    )
  })
  
  return (
    <group ref={groupRef}>
      {cubes}
      {spheres}
    </group>
  )
}

export default function Hero3D() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -10 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <spotLight position={[-10, -10, -10]} intensity={0.8} />
          <MorphingObjects />
          <AdvancedParticleField />
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} />
        </Suspense>
      </Canvas>
    </div>
  )
}


