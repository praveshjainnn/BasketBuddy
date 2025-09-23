"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"

export default function HeroParticles() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
      </Suspense>
    </Canvas>
  )
}


