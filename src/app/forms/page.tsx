'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'react-hot-toast'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'
import { FileText, MapPin, Compass, Recycle, TrendingUp } from 'lucide-react'

export default function FormsPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    wasteType: '',
    difficulty: 'Easy',
    points: '20'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      toast.success('We Will Review the Submission, and Update If Needed. Thanks!')
      router.push('/collect')
    } catch (error) {
      toast.error('Failed to submit task')
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push('/api/auth/login')
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-12">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Submit New Waste Collection Task
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field (no icon) */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 placeholder-black"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-700" />
                <span>Description</span>
              </div>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the waste collection task"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 placeholder-black"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Latitude Field */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-700" />
                  <span>Latitude</span>
                </div>
              </label>
              <Input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="Enter latitude"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 placeholder-black"
                required
              />
            </div>
            {/* Longitude Field */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-gray-700" />
                  <span>Longitude</span>
                </div>
              </label>
              <Input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="Enter longitude"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700 placeholder-black"
                required
              />
            </div>
          </div>

          {/* Waste Type Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <Recycle className="h-5 w-5 text-gray-700" />
                <span>Waste Type</span>
              </div>
            </label>
            <select
              value={formData.wasteType}
              onChange={(e) => setFormData({ ...formData, wasteType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select waste type</option>
              <option value="Plastic">Plastic</option>
              <option value="Paper">Paper</option>
              <option value="Glass">Glass</option>
              <option value="Metal">Metal</option>
              <option value="Organic">Organic</option>
              <option value="Electronic">Electronic</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          {/* Difficulty Field */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-700" />
                <span>Difficulty</span>
              </div>
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Easy">Easy (20 points)</option>
              <option value="Medium">Medium (30 points)</option>
              <option value="Hard">Hard (50 points)</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl transition-all duration-300"
          >
            Submit Task
          </Button>
        </form>
      </div>
    </div>
  )
}
