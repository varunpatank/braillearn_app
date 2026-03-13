import React from 'react'
import { motion } from 'framer-motion'

type LevelNode = {
  level: number
  title?: string
  completed?: boolean
  locked?: boolean
}

type Props = {
  levels: LevelNode[]
  currentLevel?: number
  onSelect?: (level: number) => void
  className?: string
}

export const ProgressPath: React.FC<Props> = ({ levels, currentLevel = 1, onSelect, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto py-4 ${className}`} role="navigation" aria-label="Learning path">
      <div className="min-w-[720px] flex items-center gap-6 px-4">
        {levels.map((node, idx) => {
          const isCurrent = node.level === currentLevel
          const isCompleted = !!node.completed || node.level < currentLevel
          const isLocked = !!node.locked || node.level > currentLevel + 3

          return (
            <div key={node.level} className="flex items-center gap-4">
              {idx > 0 && (
                <div className="w-12 h-1 bg-gradient-to-r from-gray-200 to-gray-300" aria-hidden />
              )}

              <motion.button
                whileHover={{ scale: isLocked ? 1 : 1.06 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                onClick={() => !isLocked && onSelect && onSelect(node.level)}
                className={`relative flex flex-col items-center text-center focus:outline-none ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-current={isCurrent ? 'step' : undefined}
                aria-disabled={isLocked}
                aria-label={`Level ${node.level} ${node.title ?? ''} ${isCompleted ? 'completed' : isCurrent ? 'current' : ''}`}
              >
                <motion.div
                  layout
                  className={`flex items-center justify-center rounded-full w-14 h-14 border-2 ${isCompleted ? 'bg-green-500 border-green-600 text-white' : isCurrent ? 'bg-white border-indigo-500 text-indigo-600 shadow-md' : 'bg-white border-gray-200 text-gray-700'}`}>
                  {isCompleted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className={`font-semibold ${isCurrent ? 'text-indigo-600' : ''}`}>{node.level}</span>
                  )}
                </motion.div>

                <div className="mt-2 w-28 text-xs text-gray-600">
                  <div className={`truncate ${isCurrent ? 'font-semibold text-indigo-600' : ''}`}>{node.title || `Level ${node.level}`}</div>
                </div>
              </motion.button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressPath