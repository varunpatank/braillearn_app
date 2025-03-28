'use client'
import dynamic from 'next/dynamic'
import { useEffect, useState, useCallback } from 'react'
import { Trash2, MapPin, CheckCircle, Loader, Camera, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import {
  getUserByEmail,
  updateWasteLocationStatus,
  createTransaction
} from '@/utils/db/actions'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'

// Dynamically load react-leaflet components; these will only render on the client.
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const geminiApiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY

// Extended waste locations: two original ones plus 70 extra custom ones.
// Original two waste locations (on land)

// List of known cities (on land) to base extra locations around
const cities = [
  { name: "New York, USA", lat: 40.7128, lon: -74.0060 },
  { name: "London, UK", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo, Japan", lat: 35.6895, lon: 139.6917 },
  { name: "Sydney, Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Paris, France", lat: 48.8566, lon: 2.3522 },
  { name: "Cairo, Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "Mexico City, Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "Berlin, Germany", lat: 52.5200, lon: 13.4050 },
  { name: "Rome, Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Moscow, Russia", lat: 55.7558, lon: 37.6173 },
  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777 },
  { name: "São Paulo, Brazil", lat: -23.5505, lon: -46.6333 },
  { name: "Cape Town, South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Toronto, Canada", lat: 43.6532, lon: -79.3832 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 }
]

// Helper arrays for generating unique text
const adjectives = ["Sunny", "Misty", "Quiet", "Vibrant", "Lively", "Charming", "Bustling", "Serene", "Modern", "Historic"]
const placeTypes = ["Park", "Square", "Market", "Boulevard", "Street", "District", "Neighborhood", "Plaza", "Campus", "Center"]
const wasteTypes = ["Plastic", "Organic", "Mixed", "Electronic"]

// Generate 70 extra waste locations by picking a random city and adding a small random offset
const extraLocations = Array.from({ length: 70 }, (_, i) => {
  const id = i + 3
  // Pick a random city from our list
  const randomCity = cities[Math.floor(Math.random() * cities.length)]
  // Add a small offset (±0.5°) to ensure variety while remaining near the city center
  const latitude = randomCity.lat + (Math.random() - 0.5)
  const longitude = randomCity.lon + (Math.random() - 0.5)
  // Randomly pick an adjective and place type for unique titles
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const placeType = placeTypes[Math.floor(Math.random() * placeTypes.length)]
  // Create a title and description including the city name
  const title = `Cleanup Task #${id}: ${adjective} ${placeType} in ${randomCity.name}`
  const description = `Join the cleanup in ${randomCity.name} at the ${adjective.toLowerCase()} ${placeType.toLowerCase()}. Your effort will help protect local communities and the environment.`
  // Cycle difficulty among Easy, Medium, Hard (or randomize if you prefer)
  const difficulty = (id % 3 === 0) ? "Easy" : (id % 3 === 1 ? "Medium" : "Hard")
  const points = difficulty === "Easy" ? 20 : (difficulty === "Medium" ? 30 : 50)
  // Randomly pick a waste type
  const wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)]
  return {
    id,
    latitude: parseFloat(latitude.toFixed(4)),
    longitude: parseFloat(longitude.toFixed(4)),
    title,
    description,
    wasteType,
    difficulty,
    points
  }
})




const wasteLocations = [...extraLocations]

// Helper function to return a custom icon based on difficulty.
// Make sure to only call require('leaflet') when window is defined.
function getIconForDifficulty(difficulty: string) {
  if (typeof window === 'undefined') return null;
  // Dynamically require leaflet only on the client.
  const L = require('leaflet');
  let color = 'green';
  if (difficulty === 'Medium') {
    color = 'orange';
  } else if (difficulty === 'Hard') {
    color = 'red';
  }
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

export default function CollectPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [verificationImage, setVerificationImage] = useState<string | undefined>(undefined)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failure'>('idle')
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean
    confidence: number
    quantity: string
    matchesDifficulty: boolean
    assessment: string
  } | null>(null)
  const [dbUser, setDbUser] = useState<{ id: number; email: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Import Leaflet CSS only on the client.
    if (typeof window !== 'undefined') {
      import('leaflet/dist/leaflet.css')
    }
    setMapLoaded(true)
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      if (user?.email) {
        try {
          const fetchedUser = await getUserByEmail(user.email)
          if (fetchedUser) {
            setDbUser(fetchedUser)
          } else {
            toast.error('User not found')
            router.push('/api/auth/login')
          }
        } catch (error) {
          console.error('Error fetching user:', error)
          toast.error('Failed to load user data')
        }
      }
      setLoading(false)
    }
    checkUser()
  }, [user, router])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setVerificationImage(e.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }, [])

  const handleVerify = async () => {
    if (!verificationImage || !selectedLocation || !dbUser) {
      toast.error('Please select a location and upload an image')
      return
    }

    setVerificationStatus('verifying')
    
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey!)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const base64Data = verificationImage.split(',')[1]
      const imageParts = [{ inlineData: { data: base64Data, mimeType: 'image/jpeg' } }]

      const prompt = `You are a waste verification expert. Analyze this image and verify:
        1. If it shows collection/cleanup of waste (be lenient in verification)
        2. Estimate the quantity of waste
        3. Assess if the cleanup effort matches the difficulty level: ${selectedLocation.difficulty}
        
        Respond with only a JSON object in this format:
        {
          "verified": true/false,
          "confidence": 0.95,
          "quantity": "2.5 kg",
          "matchesDifficulty": true/false,
          "assessment": "brief explanation"
        }`

      const result = await model.generateContent([prompt, ...imageParts])
      const response = await result.response
      const text = response.text()
      
      try {
        const cleanJson = text.replace(/```json\s*|\s*```/g, '').trim()
        const parsedResult = JSON.parse(cleanJson)

        setVerificationResult(parsedResult)
        
        if (parsedResult.verified && parsedResult.confidence > 0.6) {
          await updateWasteLocationStatus(selectedLocation.id, dbUser.id, 'completed', parsedResult)
          
          await createTransaction(
            dbUser.id,
            'earned_collect',
            selectedLocation.points, 
            `Collected waste at ${selectedLocation.title}`
          )

          setVerificationStatus('success')
          toast.success(`Verification successful! You've earned ${selectedLocation.points} points!`, {
            duration: 5000,
            icon: '🎉'
          })
          
          setSelectedLocation(null)
          setVerificationImage(undefined)
        } else {
          setVerificationStatus('failure')
          toast.error(`Verification failed: ${parsedResult.assessment}`, {
            duration: 5000,
            icon: '❌'
          })
        }
      } catch (error) {
        console.error('Failed to parse verification result:', error)
        setVerificationStatus('failure')
        toast.error('Failed to verify waste. Please try again with a clearer image.')
      }
    } catch (error) {
      console.error('Error verifying waste:', error)
      setVerificationStatus('failure')
      toast.error('Failed to verify waste collection. Please try again.')
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-8 w-8 text-green-500" />
      </div>
    )
  }

  if (!user) {
    router.push('/api/auth/login')
    return null
  }

  if (!mapLoaded) {
    return null
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full gap-4">
        <div className="lg:col-span-2 relative h-full rounded-lg overflow-hidden">
          <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {wasteLocations.map(location => (
              <Marker
                key={location.id}
                position={[location.latitude, location.longitude]}
                icon={getIconForDifficulty(location.difficulty)}
                eventHandlers={{
                  click: () => setSelectedLocation(location),
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{location.title}</h3>
                    <p className="text-sm text-gray-600">{location.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{location.points} points</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        location.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        location.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {location.difficulty}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="p-4 bg-white rounded-lg shadow overflow-y-auto">
          {selectedLocation ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                <h2 className="text-xl font-semibold mb-2">{selectedLocation.title}</h2>
                <p className="text-gray-600 mb-4">{selectedLocation.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-sm text-gray-500">Type</span>
                    <p className="font-semibold">{selectedLocation.wasteType}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-sm text-gray-500">Points</span>
                    <p className="font-semibold">{selectedLocation.points}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="text-sm text-gray-500">Difficulty</span>
                    <p className={`font-semibold ${
                      selectedLocation.difficulty === 'Easy' ? 'text-green-600' :
                      selectedLocation.difficulty === 'Medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>{selectedLocation.difficulty}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Verification Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 transition-colors">
                    <div className="space-y-1 text-center">
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
                      </div>
                    </div>
                  </div>
                </div>

                {verificationImage && (
                  <div className="mt-4">
                    <img src={verificationImage} alt="Verification" className="w-full h-48 object-cover rounded-lg" />
                  </div>
                )}

                {verificationStatus === 'success' && verificationResult && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                      <h3 className="text-green-800 font-medium">Verification Successful</h3>
                    </div>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Quantity: {verificationResult.quantity}</p>
                      <p>Confidence: {(verificationResult.confidence * 100).toFixed(1)}%</p>
                      <p>Assessment: {verificationResult.assessment}</p>
                    </div>
                  </div>
                )}

                {verificationStatus === 'failure' && verificationResult && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <XCircle className="h-6 w-6 text-red-500 mr-2" />
                      <h3 className="text-red-800 font-medium">Verification Failed</h3>
                    </div>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Assessment: {verificationResult.assessment}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!verificationImage || verificationStatus === 'verifying'}
                >
                  {verificationStatus === 'verifying' ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Verifying...
                    </>
                  ) : 'Verify Collection'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No location selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click on a marker on the map to view waste collection details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
