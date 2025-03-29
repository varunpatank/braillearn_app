'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Leaf } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    window.location.href = '/api/auth/login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-10 bg-white rounded-3xl shadow-xl p-10">
        {/* Logo & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 shadow-md">
            <Leaf className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent tracking-tight">
            WasteHero
          </h1>
          <p className="mt-4 text-gray-600 text-lg leading-relaxed">
            Join our mission to make waste management smarter, cleaner, and more rewarding.
          </p>
        </div>

        {/* Sign In Button */}
        <div>
          <Button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-5 px-4 border border-transparent rounded-xl shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Auth0'}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
