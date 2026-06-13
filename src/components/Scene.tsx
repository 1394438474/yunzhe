import { useEffect, useRef } from 'react'

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
    alpha: number
    color: string
  }>>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    const particles = []
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        alpha: Math.random(),
        color: Math.random() > 0.5 ? '#00f0ff' : '#ff00ff'
      })
    }
    particlesRef.current = particles

    let time = 0

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.016

      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        const alphaHex = Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
        ctx.fillStyle = p.color + alphaHex
        ctx.fill()

        // Draw trail
        ctx.beginPath()
        ctx.arc(p.x + p.vx * 5, p.y + p.vy * 5, p.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.floor(p.alpha * 0.5 * 255).toString(16).padStart(2, '0')
        ctx.fill()

        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        gradient.addColorStop(0, `rgba(${p.color === '#00f0ff' ? '0, 240, 255' : '255, 0, 255'}, ${p.alpha * 0.3})`)
        gradient.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)'
      ctx.lineWidth = 1
      const gridSize = 50
      const offsetY = (time * 20) % gridSize
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = -gridSize + offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  )
}
