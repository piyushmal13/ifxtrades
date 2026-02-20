"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"

export function GlobeHero({ minimal = false }: { minimal?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = canvas.width = canvas.offsetWidth
    let height = canvas.height = canvas.offsetHeight
    
    // Globe Configuration
    const GLOBE_RADIUS = width < 600 ? 140 : 280
    const DOT_RADIUS = 1.5
    const DOT_COUNT = 1000
    const ROTATION_SPEED = 0.0015
    const PROJECTION_CENTER_X = width / 2
    const PROJECTION_CENTER_Y = height / 2
    const FIELD_OF_VIEW = width * 0.8

    // Generate 3D Points on a Sphere
    const dots: { x: number; y: number; z: number }[] = []
    for (let i = 0; i < DOT_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / DOT_COUNT)
      const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi
      
      dots.push({
        x: GLOBE_RADIUS * Math.cos(theta) * Math.sin(phi),
        y: GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi),
        z: GLOBE_RADIUS * Math.cos(phi)
      })
    }

    let rotation = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      rotation += ROTATION_SPEED
      
      dots.forEach(dot => {
        // Rotate around Y axis
        const rotatedX = dot.x * Math.cos(rotation) - dot.z * Math.sin(rotation)
        const rotatedZ = dot.x * Math.sin(rotation) + dot.z * Math.cos(rotation)
        
        // 3D to 2D Projection
        const scale = FIELD_OF_VIEW / (FIELD_OF_VIEW + rotatedZ + GLOBE_RADIUS)
        const x2d = (rotatedX * scale) + PROJECTION_CENTER_X
        const y2d = (dot.y * scale) + PROJECTION_CENTER_Y
        
        // Depth-based Opacity
        const alpha = Math.max(0.1, (scale - 0.5) * 1.2)
        
        ctx.beginPath()
        ctx.arc(x2d, y2d, DOT_RADIUS * scale, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(198, 162, 58, ${alpha})` // #C6A23A Gold
        ctx.fill()
      })

      requestAnimationFrame(render)
    }

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    window.addEventListener('resize', handleResize)
    render()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={`relative w-full ${minimal ? 'h-full' : 'h-[600px] md:h-[750px]'} bg-[#0E1A2B] overflow-hidden flex items-center justify-center`}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0E1A2B] via-transparent to-[#0E1A2B] z-10"></div>
      
      {/* Content Overlay */}
      {!minimal && (
        <div className="relative z-20 text-center space-y-8 max-w-5xl px-6 mt-[-50px]">
        <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight leading-tight">
          Global <span className="text-[#C6A23A]">Institutional</span><br /> Liquidity
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Access high-frequency algorithmic strategies and deep liquidity pools across 40+ countries.
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center pt-4">
            <Link href="/signup" className="bg-[#C6A23A] text-white px-10 py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-[#b08d2b] transition shadow-[0_0_20px_rgba(198,162,58,0.3)]">
                Start Trading
            </Link>
            <Link href="/algos" className="border border-gray-700 text-white px-10 py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-white/5 transition hover:border-[#C6A23A]">
                View Algorithms
            </Link>
        </div>
        </div>
      )}

      {/* The Globe Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
        style={{ width: '100%', height: '100%', maxWidth: '1200px' }}
      />
    </div>
  )
}