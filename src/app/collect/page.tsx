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

// Import useMap hook to access the map instance.
import { useMap } from 'react-leaflet'

const geminiApiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY

// 50 real-life waste collection challenge locations with added countryCode.
const realLocations = [
  {
    id: 1,
    latitude: 40.785091,
    longitude: -73.968285,
    title: "Cleanup Challenge: Central Park, New York",
    description: "Join the cleanup in Central Park, one of New York's iconic green spaces.",
    address: "Central Park, New York, USA",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "us"
  },
  {
    id: 2,
    latitude: 40.700292,
    longitude: -73.996287,
    title: "Cleanup Challenge: Brooklyn Bridge Park, New York",
    description: "Help keep Brooklyn Bridge Park pristine.",
    address: "334 Furman St, Brooklyn, NY, USA",
    wasteType: "Plastic",
    difficulty: "Easy",
    points: 20,
    countryCode: "us"
  },
  {
    id: 3,
    latitude: 51.507268,
    longitude: -0.165730,
    title: "Cleanup Challenge: Hyde Park, London",
    description: "Help clean up Hyde Park, a historic landmark in London.",
    address: "Hyde Park, London, UK",
    wasteType: "Plastic",
    difficulty: "Easy",
    points: 20,
    countryCode: "gb"
  },
  {
    id: 4,
    latitude: 51.531270,
    longitude: -0.156969,
    title: "Cleanup Challenge: Regent's Park, London",
    description: "Join the cleanup effort in Regent's Park.",
    address: "Regent's Park, London, UK",
    wasteType: "Mixed",
    difficulty: "Medium",
    points: 30,
    countryCode: "gb"
  },
  {
    id: 5,
    latitude: 35.685175,
    longitude: 139.710052,
    title: "Cleanup Challenge: Shinjuku Gyoen, Tokyo",
    description: "Contribute to the upkeep of Shinjuku Gyoen, a stunning garden in Tokyo.",
    address: "11 Naitomachi, Shinjuku, Tokyo, Japan",
    wasteType: "Electronic",
    difficulty: "Hard",
    points: 50,
    countryCode: "jp"
  },
  {
    id: 6,
    latitude: 35.715298,
    longitude: 139.773057,
    title: "Cleanup Challenge: Ueno Park, Tokyo",
    description: "Help maintain Ueno Park in Tokyo.",
    address: "Uenokoen, Taito City, Tokyo, Japan",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "jp"
  },
  {
    id: 7,
    latitude: -33.890842,
    longitude: 151.274292,
    title: "Cleanup Challenge: Bondi Beach, Sydney",
    description: "Join the cleanup at Bondi Beach in Sydney.",
    address: "Bondi Beach, NSW, Australia",
    wasteType: "Mixed",
    difficulty: "Medium",
    points: 30,
    countryCode: "au"
  },
  {
    id: 8,
    latitude: -33.7982,
    longitude: 151.2870,
    title: "Cleanup Challenge: Manly Beach, Sydney",
    description: "Help keep Manly Beach clean.",
    address: "Manly, NSW, Australia",
    wasteType: "Plastic",
    difficulty: "Easy",
    points: 20,
    countryCode: "au"
  },
  {
    id: 9,
    latitude: 48.858370,
    longitude: 2.294481,
    title: "Cleanup Challenge: Eiffel Tower Area, Paris",
    description: "Help keep the area around the Eiffel Tower pristine.",
    address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    wasteType: "Organic",
    difficulty: "Hard",
    points: 50,
    countryCode: "fr"
  },
  {
    id: 10,
    latitude: 48.8698,
    longitude: 2.3078,
    title: "Cleanup Challenge: Champs-Élysées, Paris",
    description: "Join the cleanup along the famed Champs-Élysées.",
    address: "Champs-Élysées, Paris, France",
    wasteType: "Plastic",
    difficulty: "Medium",
    points: 30,
    countryCode: "fr"
  },
  {
    id: 11,
    latitude: 30.044420,
    longitude: 31.235712,
    title: "Cleanup Challenge: Tahrir Square, Cairo",
    description: "Join a cleanup challenge at Tahrir Square.",
    address: "Tahrir Square, Cairo, Egypt",
    wasteType: "Plastic",
    difficulty: "Easy",
    points: 20,
    countryCode: "eg"
  },
  {
    id: 12,
    latitude: 30.0459,
    longitude: 31.2243,
    title: "Cleanup Challenge: Al-Azhar Park, Cairo",
    description: "Help maintain the beauty of Al-Azhar Park.",
    address: "Al-Azhar Park, Cairo, Egypt",
    wasteType: "Mixed",
    difficulty: "Medium",
    points: 30,
    countryCode: "eg"
  },
  {
    id: 13,
    latitude: 19.432608,
    longitude: -99.133209,
    title: "Cleanup Challenge: Zócalo, Mexico City",
    description: "Help clean up Zócalo, the historic center of Mexico City.",
    address: "Plaza de la Constitución, Mexico City, Mexico",
    wasteType: "Mixed",
    difficulty: "Medium",
    points: 30,
    countryCode: "mx"
  },
  {
    id: 14,
    latitude: 19.4205,
    longitude: -99.1815,
    title: "Cleanup Challenge: Chapultepec Park, Mexico City",
    description: "Join the cleanup in Chapultepec Park.",
    address: "Chapultepec Park, Mexico City, Mexico",
    wasteType: "Electronic",
    difficulty: "Hard",
    points: 50,
    countryCode: "mx"
  },
  {
    id: 15,
    latitude: 52.516274,
    longitude: 13.377704,
    title: "Cleanup Challenge: Brandenburg Gate, Berlin",
    description: "Help clean up the area around the Brandenburg Gate.",
    address: "Pariser Platz, 10117 Berlin, Germany",
    wasteType: "Electronic",
    difficulty: "Hard",
    points: 50,
    countryCode: "de"
  },
  {
    id: 16,
    latitude: 52.5145,
    longitude: 13.3501,
    title: "Cleanup Challenge: Tiergarten, Berlin",
    description: "Contribute to keeping Tiergarten beautiful.",
    address: "Tiergarten, Berlin, Germany",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "de"
  },
  {
    id: 17,
    latitude: 41.890210,
    longitude: 12.492231,
    title: "Cleanup Challenge: Colosseum Area, Rome",
    description: "Help maintain the historic surroundings of the Colosseum.",
    address: "Piazza del Colosseo, Rome, Italy",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "it"
  },
  {
    id: 18,
    latitude: 41.9109,
    longitude: 12.4923,
    title: "Cleanup Challenge: Villa Borghese, Rome",
    description: "Join the cleanup at Villa Borghese.",
    address: "Villa Borghese, Rome, Italy",
    wasteType: "Plastic",
    difficulty: "Easy",
    points: 20,
    countryCode: "it"
  },
  {
    id: 19,
    latitude: 55.753930,
    longitude: 37.620795,
    title: "Cleanup Challenge: Red Square, Moscow",
    description: "Contribute to cleaning Red Square.",
    address: "Red Square, Moscow, Russia",
    wasteType: "Plastic",
    difficulty: "Hard",
    points: 50,
    countryCode: "ru"
  },
  {
    id: 20,
    latitude: 55.7299,
    longitude: 37.6060,
    title: "Cleanup Challenge: Gorky Park, Moscow",
    description: "Help keep Gorky Park clean and green.",
    address: "Gorky Park, Moscow, Russia",
    wasteType: "Mixed",
    difficulty: "Medium",
    points: 30,
    countryCode: "ru"
  },
  {
    id: 21,
    latitude: 18.9220,
    longitude: 72.8347,
    title: "Cleanup Challenge: Gateway of India, Mumbai",
    description: "Help clean up the area around the Gateway of India.",
    address: "Apollo Bandar, Colaba, Mumbai, India",
    wasteType: "Mixed",
    difficulty: "Easy",
    points: 20,
    countryCode: "in"
  },
  {
    id: 22,
    latitude: 18.9437,
    longitude: 72.8239,
    title: "Cleanup Challenge: Marine Drive, Mumbai",
    description: "Join the cleanup along Marine Drive.",
    address: "Marine Drive, Mumbai, India",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "in"
  },
  {
    id: 23,
    latitude: -23.587416,
    longitude: -46.657633,
    title: "Cleanup Challenge: Ibirapuera Park, São Paulo",
    description: "Help keep Ibirapuera Park in São Paulo clean.",
    address: "Ibirapuera Park, São Paulo, Brazil",
    wasteType: "Electronic",
    difficulty: "Medium",
    points: 30,
    countryCode: "br"
  },
  {
    id: 24,
    latitude: -23.561414,
    longitude: -46.655881,
    title: "Cleanup Challenge: Paulista Avenue, São Paulo",
    description: "Join the effort to clean up Paulista Avenue.",
    address: "Paulista Ave, São Paulo, Brazil",
    wasteType: "Plastic",
    difficulty: "Hard",
    points: 50,
    countryCode: "br"
  },
  {
    id: 25,
    latitude: -33.962,
    longitude: 18.410,
    title: "Cleanup Challenge: Table Mountain, Cape Town",
    description: "Help preserve the beauty of Table Mountain.",
    address: "Table Mountain, Cape Town, South Africa",
    wasteType: "Organic",
    difficulty: "Hard",
    points: 50,
    countryCode: "za"
  },
  {
    id: 26,
    latitude: -33.9036,
    longitude: 18.4161,
    title: "Cleanup Challenge: V&A Waterfront, Cape Town",
    description: "Assist in cleaning up the V&A Waterfront.",
    address: "V&A Waterfront, Cape Town, South Africa",
    wasteType: "Mixed",
    difficulty: "Medium",
    points: 30,
    countryCode: "za"
  },
  {
    id: 27,
    latitude: 43.642566,
    longitude: -79.387057,
    title: "Cleanup Challenge: CN Tower Area, Toronto",
    description: "Help clean up the area around the CN Tower.",
    address: "301 Front St W, Toronto, ON, Canada",
    wasteType: "Plastic",
    difficulty: "Medium",
    points: 30,
    countryCode: "ca"
  },
  {
    id: 28,
    latitude: 43.6465,
    longitude: -79.4637,
    title: "Cleanup Challenge: High Park, Toronto",
    description: "Join the cleanup in High Park.",
    address: "High Park, Toronto, ON, Canada",
    wasteType: "Organic",
    difficulty: "Easy",
    points: 20,
    countryCode: "ca"
  },
  {
    id: 29,
    latitude: 1.2834,
    longitude: 103.8607,
    title: "Cleanup Challenge: Marina Bay Sands, Singapore",
    description: "Help keep the Marina Bay area pristine.",
    address: "10 Bayfront Ave, Singapore 018956",
    wasteType: "Mixed",
    difficulty: "Hard",
    points: 50,
    countryCode: "sg"
  },
  {
    id: 30,
    latitude: 1.2816,
    longitude: 103.8636,
    title: "Cleanup Challenge: Gardens by the Bay, Singapore",
    description: "Join the cleanup at Gardens by the Bay.",
    address: "18 Marina Gardens Dr, Singapore 018953",
    wasteType: "Electronic",
    difficulty: "Medium",
    points: 30,
    countryCode: "sg"
  },
  {
    id: 31,
    latitude: 37.769420,
    longitude: -122.486214,
    title: "Cleanup Challenge: Golden Gate Park, San Francisco",
    description: "Help keep Golden Gate Park beautiful.",
    address: "501 Stanyan St, San Francisco, CA, USA",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "us"
  },
  {
    id: 32,
    latitude: 37.8080,
    longitude: -122.4177,
    title: "Cleanup Challenge: Fisherman's Wharf, San Francisco",
    description: "Assist in cleaning Fisherman's Wharf.",
    address: "Fisherman's Wharf, San Francisco, CA, USA",
    wasteType: "Plastic",
    difficulty: "Hard",
    points: 50,
    countryCode: "us"
  },
  {
    id: 33,
    latitude: 41.882702,
    longitude: -87.619392,
    title: "Cleanup Challenge: Millennium Park, Chicago",
    description: "Join the cleanup at Chicago's Millennium Park.",
    address: "201 E Randolph St, Chicago, IL, USA",
    wasteType: "Mixed",
    difficulty: "Medium",
    points: 30,
    countryCode: "us"
  },
  {
    id: 34,
    latitude: 41.8916,
    longitude: -87.6079,
    title: "Cleanup Challenge: Navy Pier, Chicago",
    description: "Help clean up around Navy Pier.",
    address: "600 E Grand Ave, Chicago, IL, USA",
    wasteType: "Electronic",
    difficulty: "Easy",
    points: 20,
    countryCode: "us"
  },
  {
    id: 35,
    latitude: 40.7480,
    longitude: -74.0048,
    title: "Cleanup Challenge: The High Line, New York",
    description: "Assist in cleaning New York's elevated park, The High Line.",
    address: "New York, NY, USA",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "us"
  },
  {
    id: 36,
    latitude: 34.1367,
    longitude: -118.2942,
    title: "Cleanup Challenge: Griffith Park, Los Angeles",
    description: "Help maintain the expansive Griffith Park.",
    address: "4730 Crystal Springs Dr, Los Angeles, CA, USA",
    wasteType: "Mixed",
    difficulty: "Hard",
    points: 50,
    countryCode: "us"
  },
  {
    id: 37,
    latitude: 33.9850,
    longitude: -118.4695,
    title: "Cleanup Challenge: Venice Beach, Los Angeles",
    description: "Join the cleanup at Venice Beach.",
    address: "Venice Beach, Los Angeles, CA, USA",
    wasteType: "Plastic",
    difficulty: "Easy",
    points: 20,
    countryCode: "us"
  },
  {
    id: 38,
    latitude: 51.4995,
    longitude: -0.1248,
    title: "Cleanup Challenge: Palace of Westminster, London",
    description: "Help clean up around the Palace of Westminster.",
    address: "Westminster, London SW1A 0AA, UK",
    wasteType: "Electronic",
    difficulty: "Hard",
    points: 50,
    countryCode: "gb"
  },
  {
    id: 39,
    latitude: 51.5045,
    longitude: -0.0865,
    title: "Cleanup Challenge: The Shard, London",
    description: "Assist in cleaning up the area around The Shard.",
    address: "32 London Bridge St, London SE1 9SG, UK",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "gb"
  },
  {
    id: 40,
    latitude: 35.6586,
    longitude: 139.7454,
    title: "Cleanup Challenge: Tokyo Tower, Tokyo",
    description: "Help keep the area around Tokyo Tower clean.",
    address: "4 Chome-2-8 Shibakoen, Minato City, Tokyo, Japan",
    wasteType: "Plastic",
    difficulty: "Medium",
    points: 30,
    countryCode: "jp"
  },
  {
    id: 41,
    latitude: 35.6852,
    longitude: 139.7530,
    title: "Cleanup Challenge: Imperial Palace, Tokyo",
    description: "Join the effort to clean around the Imperial Palace.",
    address: "1-1 Chiyoda, Chiyoda City, Tokyo, Japan",
    wasteType: "Mixed",
    difficulty: "Hard",
    points: 50,
    countryCode: "jp"
  },
  {
    id: 42,
    latitude: -33.8568,
    longitude: 151.2153,
    title: "Cleanup Challenge: Sydney Opera House, Sydney",
    description: "Help maintain the iconic Sydney Opera House area.",
    address: "Bennelong Point, Sydney NSW 2000, Australia",
    wasteType: "Electronic",
    difficulty: "Hard",
    points: 50,
    countryCode: "au"
  },
  {
    id: 43,
    latitude: -33.8718,
    longitude: 151.1989,
    title: "Cleanup Challenge: Darling Harbour, Sydney",
    description: "Join the cleanup at Darling Harbour.",
    address: "1-15 Wheat Rd, Sydney NSW 2000, Australia",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "au"
  },
  {
    id: 44,
    latitude: 48.8606,
    longitude: 2.3376,
    title: "Cleanup Challenge: Louvre Museum Area, Paris",
    description: "Help keep the area around the Louvre Museum clean.",
    address: "Rue de Rivoli, 75001 Paris, France",
    wasteType: "Plastic",
    difficulty: "Easy",
    points: 20,
    countryCode: "fr"
  },
  {
    id: 45,
    latitude: 48.8867,
    longitude: 2.3431,
    title: "Cleanup Challenge: Montmartre, Paris",
    description: "Assist in cleaning up Montmartre.",
    address: "Montmartre, 75018 Paris, France",
    wasteType: "Mixed",
    difficulty: "Medium",
    points: 30,
    countryCode: "fr"
  },
  {
    id: 46,
    latitude: 30.0478,
    longitude: 31.2620,
    title: "Cleanup Challenge: Khan el-Khalili, Cairo",
    description: "Help clean the bustling Khan el-Khalili market area.",
    address: "El-Gamaleya, Cairo, Egypt",
    wasteType: "Plastic",
    difficulty: "Hard",
    points: 50,
    countryCode: "eg"
  },
  {
    id: 47,
    latitude: 19.2636,
    longitude: -99.0910,
    title: "Cleanup Challenge: Xochimilco, Mexico City",
    description: "Join the cleanup in the historic canals of Xochimilco.",
    address: "Xochimilco, Mexico City, Mexico",
    wasteType: "Organic",
    difficulty: "Medium",
    points: 30,
    countryCode: "mx"
  },
  {
    id: 48,
    latitude: 52.5096,
    longitude: 13.3762,
    title: "Cleanup Challenge: Potsdamer Platz, Berlin",
    description: "Help keep Potsdamer Platz clean and vibrant.",
    address: "Potsdamer Platz, 10785 Berlin, Germany",
    wasteType: "Electronic",
    difficulty: "Hard",
    points: 50,
    countryCode: "de"
  },
  {
    id: 49,
    latitude: 41.9029,
    longitude: 12.4534,
    title: "Cleanup Challenge: Vatican City, Rome",
    description: "Assist in cleaning up the Vatican City area.",
    address: "Vatican City",
    wasteType: "Mixed",
    difficulty: "Medium",
    points: 30,
    countryCode: "it"
  },
  {
    id: 50,
    latitude: 55.7520,
    longitude: 37.5836,
    title: "Cleanup Challenge: Arbat Street, Moscow",
    description: "Join the cleanup along Moscow's historic Arbat Street.",
    address: "Arbat St, Moscow, Russia",
    wasteType: "Plastic",
    difficulty: "Easy",
    points: 20,
    countryCode: "ru"
  }
]

// Use these real-life locations as our waste collection challenges.
const wasteLocations = [...realLocations]

// Helper function to return a custom icon based on difficulty.
// Only call require('leaflet') on the client.
function getIconForDifficulty(difficulty: string) {
  if (typeof window === 'undefined') return null
  const L = require('leaflet')
  let color = 'green'
  if (difficulty === 'Medium') {
    color = 'orange'
  } else if (difficulty === 'Hard') {
    color = 'red'
  }
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

// Custom component for a zoomable marker. When clicked, it zooms the map to the marker's location and selects it.
function ZoomableMarker({ location, onSelect }: { location: any, onSelect: (location: any) => void }) {
  const map = useMap()
  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={getIconForDifficulty(location.difficulty)}
      eventHandlers={{
        click: () => {
          map.setView([location.latitude, location.longitude], 14)
          onSelect(location)
        }
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold">{location.title}</h3>
          <p className="text-sm text-gray-600">{location.description}</p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>Address:</strong> {location.address}
          </p>
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
          <Button
            onClick={() =>
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`,
                '_blank'
              )
            }
            className="mt-2"
          >
            Get Directions
          </Button>
        </div>
      </Popup>
    </Marker>
  )
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

      // Strict prompt: The response must verify that the image shows the exact location (matching the address)
      // and that the waste type exactly matches the expected waste type.
      const prompt = `You are a waste verification expert. Analyze the attached image and verify the following:
1. The image shows waste collection or cleanup at the location: "${selectedLocation.address}".
2. The waste type present in the image somewhat matches the expected waste type: "${selectedLocation.wasteType}".
3. Provide an estimate of the quantity of waste, only in kilograms (e.g., "2.5 kg").
4. Confirm that the cleanup effort aligns with the challenge difficulty: "${selectedLocation.difficulty}".
Respond ONLY with a JSON object in the exact format below (with no additional text):
{
  "verified": true/false,
  "confidence": number between 0 and 1,
  "quantity": "string indicating quantity (e.g., '2.5 kg')",
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
        <Loader className="animate-spin h-8 w-8 text-blue-700" />
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

  // Dynamically set the detail box color based on difficulty.
  const detailBoxClasses = selectedLocation 
    ? selectedLocation.difficulty === 'Easy' 
      ? 'bg-green-50 text-green-800'
      : selectedLocation.difficulty === 'Medium'
      ? 'bg-yellow-50 text-yellow-800'
      : 'bg-red-50 text-red-800'
    : ''

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
              <ZoomableMarker key={location.id} location={location} onSelect={setSelectedLocation} />
            ))}
          </MapContainer>
        </div>

        <div className="p-4 bg-white rounded-lg shadow overflow-y-auto">
          {selectedLocation ? (
            <div className="space-y-6">
              {/* Display the flag of the country using FlagCDN */}
              <img
                src={`https://flagcdn.com/w320/${selectedLocation.countryCode.toLowerCase()}.png`}
                alt={`Flag of ${selectedLocation.address}`}
                className="w-full h-64 object-contain rounded-lg mb-4"
              />
              <div className={`${detailBoxClasses} p-4 rounded-xl`}>
                <h2 className="text-xl font-semibold mb-2">{selectedLocation.title}</h2>
                <p className="mb-4">{selectedLocation.description}</p>
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
                    <p className="font-semibold">{selectedLocation.difficulty}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Verification Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-700 transition-colors">
                    <div className="space-y-1 text-center">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-700">
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
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-blue-700 mr-2" />
                      <h3 className="text-blue-800 font-medium">Verification Successful</h3>
                    </div>
                    <div className="mt-2 text-sm">
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
                    <div className="mt-2 text-sm">
                      <p>Assessment: {verificationResult.assessment}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  className="w-full bg-blue-600 hover:bg-green-700 text-white"
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
