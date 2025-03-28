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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-12">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-lg">
            <Leaf className="h-14 w-14 text-green-600" />
          </div>
          <h2 className="mt-8 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome to Zero2Hero
          </h2>
          <p className="mt-4 text-center text-xl text-gray-600 max-w-sm">
            Join our community in making waste management more efficient and rewarding
          </p>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-6 px-4 border border-transparent rounded-xl shadow-lg text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in with Auth0'}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-base text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}