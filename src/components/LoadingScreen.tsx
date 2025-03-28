'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot as Bottle, Apple, Package2, Trash2 } from 'lucide-react';

const wasteIcons = [
  { Icon: Bottle, color: '#60A5FA', label: 'Plastic Bottle' },
  { Icon: Apple, color: '#34D399', label: 'Organic Waste' },
  { Icon: Package2, color: '#F59E0B', label: 'Package' }
];

const xOffsets = [-40, 0, 40];

export default function LoadingScreen() {
  const iconOffsets = useMemo(() => xOffsets, []);
  const [particlePositions, setParticlePositions] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const particles = Array.from({ length: 30 }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }));
      setParticlePositions(particles);
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-800 to-blue-800 overflow-hidden">
      {/* Wrapper moved higher */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%] w-full max-w-[40rem]">
        {/* Animation container */}
        <div className="relative w-[40rem] h-[40rem] mx-auto">
          {wasteIcons.map(({ Icon, color, label }, index) => (
            <motion.div
              key={index}
              className="absolute left-1/2 transform -translate-x-1/2"
              initial={{
                x: iconOffsets[index],
                y: -200,
                opacity: 0,
                scale: 1,
              }}
              animate={{
                y: [-200, 320],
                opacity: [0, 1, 1, 0],
                scale: [1, 0.95],
                rotate: [0, 15, -15, 0],
              }}
              transition={{
                duration: 1,
                delay: index * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.75, 0.9, 1],
              }}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))',
                }}
              >
                <Icon
                  size={72}
                  color={color}
                  strokeWidth={1.5}
                  aria-label={label}
                  className="backdrop-blur-sm"
                />
              </motion.div>
            </motion.div>
          ))}

          {/* Garbage bin with animated lid */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              animate={{
                filter: [
                  'drop-shadow(0 0 30px rgba(96,165,250,0.5))',
                  'drop-shadow(0 0 50px rgba(168,85,247,0.5))',
                  'drop-shadow(0 0 30px rgba(96,165,250,0.5))',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Lid */}
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 origin-left"
                animate={{
                  rotateZ: [0, -45, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.3, 0.9],
                  ease: 'easeInOut',
                }}
              >
                <div className="h-3 w-36 bg-gray-200 rounded-t-lg backdrop-blur-sm" />
              </motion.div>

              {/* Bin */}
              <Trash2
                size={144}
                className="text-gray-200"
                strokeWidth={1.5}
                aria-label="Trash Bin"
              />
            </motion.div>
          </div>
        </div>

        {/* Title and description below the bin */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 5 }}
        >
          <div className="relative">
            <h1 className="text-7xl font-bold mb-4 text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              WasteHero
            </h1>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                maskImage: 'linear-gradient(to right, transparent, white, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, white, transparent)',
              }}
            />
          </div>
          <p className="text-blue-100 text-2xl font-light tracking-wide backdrop-blur-sm">
            Loading your eco-friendly experience...
          </p>
        </motion.div>
      </div>

      {/* Floating particles */}
      {particlePositions.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{
            x: pos.x,
            y: pos.y,
          }}
          animate={{
            y: [pos.y, pos.y - 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
