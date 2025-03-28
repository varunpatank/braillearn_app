import { useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingSpinner } from './LoadingSpinner'
import { VerificationResult } from './VerificationResult'

interface WasteVerificationProps {
  onVerify: (file: File) => Promise<void>
  verificationStatus: 'idle' | 'verifying' | 'success' | 'failure'
  verificationResult: any
  isCollect?: boolean
  difficulty?: string
  points?: number
}

export function WasteVerification({
  onVerify,
  verificationStatus,
  verificationResult,
  isCollect = false,
  difficulty,
  points
}: WasteVerificationProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-green-500 transition-colors duration-300"
        >
          <div className="space-y-1 text-center">
            {preview ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative inline-block"
              >
                <img src={preview} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
                <button
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </motion.div>
            ) : (
              <>
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500">
                    <span>Upload a photo</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {verificationStatus === 'verifying' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center"
            >
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <LoadingSpinner size="lg" />
                <p className="mt-2 text-sm font-medium text-gray-600">Verifying waste...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {verificationStatus !== 'idle' && verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <VerificationResult
              status={verificationStatus}
              result={verificationResult}
              isCollect={isCollect}
              difficulty={difficulty}
              points={points}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}