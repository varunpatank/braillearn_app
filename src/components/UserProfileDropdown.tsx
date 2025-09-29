import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Edit2, LogOut, Save, X } from 'lucide-react'
import { useMockAuth } from '../context/MockAuthContext'

export const UserProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, signOut, updateProfile } = useMockAuth()

  useEffect(() => {
    if (user) {
      setEditUsername(user.username)
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsEditing(false)
        if (user) setEditUsername(user.username)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [user])

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false)
      if (user) setEditUsername(user.username)
    } else {
      // Start editing
      setIsEditing(true)
    }
  }

  const handleSaveUsername = async () => {
    if (editUsername.trim() && editUsername !== user?.username) {
      await updateProfile({ username: editUsername.trim() })
    }
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border-2 border-gray-300 shadow-sm bg-white"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-gray-900">
          <User size={16} className="text-blue-600" />
        </div>
        <span className="font-medium text-gray-900">{user.username}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border-2 border-gray-900 z-50"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border-2 border-gray-900">
                  <User size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveUsername()
                          if (e.key === 'Escape') handleEditToggle()
                        }}
                      />
                      <button
                        onClick={handleSaveUsername}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <button
                        onClick={handleEditToggle}
                        className="p-1 text-gray-500 hover:bg-white hover:text-gray-700 rounded transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-xl font-bold text-blue-600">{user.total_points}</div>
                  <div className="text-xs text-blue-600 font-medium">Points</div>
                </div>
                <div className="text-center bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="text-xl font-bold text-purple-600">{user.level}</div>
                  <div className="text-xs text-purple-600 font-medium">Level</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}