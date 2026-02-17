'use client'

import Particles from "react-tsparticles"
import { loadFull } from "tsparticles"
import { useCallback } from "react"

export default function ParticleBackground() {

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine)
  }, [])

  return (
    <Particles
      init={particlesInit}
      options={{
        fullScreen: false,
        background: { color: "transparent" },
        particles: {
          number: { value: 40 },
          size: { value: 2 },
          move: { enable: true, speed: 0.3 },
          opacity: { value: 0.3 },
          color: { value: "#d4af37" }
        }
      }}
      className="absolute inset-0"
    />
  )
}
