'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const wasteIcons = [
  {
    src: 'https://img.icons8.com/color/96/000000/recycle-bin.png',
    color: '#34D399' // Green
  },
  
  {
    src: 'https://img.icons8.com/color/96/000000/paper-waste.png',
    color: '#FBBF24' // Amber
  },
  
  {
    src: 'https://img.icons8.com/color/96/000000/tin-can.png',
    color: '#EF4444' // Red
  },
  {
    src: 'https://img.icons8.com/color/96/000000/cardboard-box.png',
    color: '#F97316' // Orange
  }
]

export default function FloatingWaste() {
  const [icons, setIcons] = useState<Array<{
    id: number
    icon: typeof wasteIcons[0]
    position: { x: number; y: number }
    direction: { dx: number; dy: number }
    delay: number
    duration: number
  }>>([])

  useEffect(() => {
    const newIcons = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      icon: wasteIcons[Math.floor(Math.random() * wasteIcons.length)],
      position: {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight
      },
      direction: {
        dx: (Math.random() - 0.5) * 600, // Bigger movement
        dy: (Math.random() - 0.5) * 400
      },
      delay: Math.random() * 2,
      duration: 10 + Math.random() * 8
    }))
    setIcons(newIcons)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {icons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          initial={{
            x: item.position.x,
            y: item.position.y,
            opacity: 0.3,
            scale: 0.5
          }}
          animate={{
            x: [item.position.x, item.position.x + item.direction.dx, item.position.x],
            y: [item.position.y, item.position.y + item.direction.dy, item.position.y],
            opacity: [0.3, 0.9, 0.3],
            scale: [0.5, 0.6, 0.5],
            rotate: [0, 360]
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut'
          }}
        >
          <div
            className="w-36 h-36 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            style={{
              backgroundColor: `${item.icon.color}40`,
              boxShadow: `
                0 6px 24px ${item.icon.color}60,
                0 0 18px ${item.icon.color}80,
                inset 0 0 20px ${item.icon.color}50
              `,
              border: `1px solid ${item.icon.color}70`,
              animation: 'glow 3s ease-in-out infinite'
            }}
          >
            <motion.img
              src={item.icon.src}
              alt="Waste Icon"
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = '/fallback-icon.png'
              }}
              className="w-28 h-28"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                filter: `drop-shadow(0 0 16px ${item.icon.color})`
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
