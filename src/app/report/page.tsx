'use client'
import { useState, useEffect } from 'react'
import { MapPin, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LocationSearch } from '@/components/LocationSearch'
import {
  createUser,
  getUserByEmail,
  createReport,
  getRecentReports,
  createTransaction,
  getRewardTransactions
} from '@/utils/db/actions'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { verifyWasteImage } from '@/utils/gemini'
import { VerificationResult } from '@/components/VerificationResult'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useUser } from '@auth0/nextjs-auth0/client'

export default function ReportPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [dbUser, setDbUser] = useState<any>(null)
  const [reports, setReports] = useState<Array<{
    id: number
    location: string
    wasteType: string
    amount: string
    createdAt: string
    latitude: number
    longitude: number
  }>>([])
  const [newReport, setNewReport] = useState({
    location: '',
    type: '',
    amount: '',
    latitude: 0,
    longitude: 0
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | undefined>(undefined)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failure'>('idle')
  const [verificationResult, setVerificationResult] = useState<{
    wasteType: string
    quantity: string
    confidence: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  // Initialize user data, recent reports, and current balance
  useEffect(() => {
    const initializeUser = async () => {
      if (user?.email) {
        let fetchedUser = await getUserByEmail(user.email)
        if (!fetchedUser) {
          fetchedUser = await createUser(user.email, user.name || 'Anonymous User')
        }
        setDbUser(fetchedUser)

        const recentReports = await getRecentReports()
        setReports(recentReports)

        const transactions = await getRewardTransactions(fetchedUser.id)
        const calculatedBalance = transactions.reduce((acc, transaction) => {
          return transaction.type.startsWith('earned')
            ? acc + transaction.amount
            : acc - transaction.amount
        }, 0)
        setBalance(Math.max(calculatedBalance, 0))
      }
      setLoading(false)
    }
    initializeUser()
  }, [user])

  // Refresh reward transactions and update balance
  const refreshTransactions = async () => {
    if (dbUser) {
      const transactions = await getRewardTransactions(dbUser.id)
      const calculatedBalance = transactions.reduce((acc, transaction) => {
        return transaction.type.startsWith('earned')
          ? acc + transaction.amount
          : acc - transaction.amount
      }, 0)
      setBalance(Math.max(calculatedBalance, 0))
    }
  }

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setNewReport(prev => ({
      ...prev,
      location: location.address,
      latitude: location.lat,
      longitude: location.lng
    }))
  }

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

  const handleVerify = async () => {
    if (!file || !preview) return
    setVerificationStatus('verifying')
    try {
      const result = await verifyWasteImage(preview, file.type)
      setVerificationResult(result)
      setVerificationStatus('success')
      // Save verified waste type and quantity for use in transaction
      setNewReport(prev => ({
        ...prev,
        type: result.wasteType,
        amount: result.quantity
      }))
    } catch (error) {
      setVerificationStatus('failure')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReport.location || !newReport.latitude || !newReport.longitude) return
    if (verificationStatus !== 'success' || !dbUser) return

    setLoading(true)
    try {
      // Calculate points earned (assume the verified quantity is numeric)
      const pointsEarned = parseFloat(verificationResult?.quantity ?? newReport.amount)

      // Create report and transaction concurrently (task-like behavior)
      await Promise.all([
        createReport(
          dbUser.id,
          newReport.location,
          newReport.latitude,
          newReport.longitude,
          verificationResult?.wasteType || '',
          verificationResult?.quantity || '',
          preview
        ),
        createTransaction(
          dbUser.id,
          'earned_report',
          pointsEarned,
          `Report completed for ${newReport.location}`
        )
      ])

      // Refresh transactions so that the updated balance is available immediately
      await refreshTransactions()

      // Brief delay to ensure backend consistency (if needed)
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast.success('Report submitted successfully! Redirecting to Rewards...', {
        duration: 2000,
        position: 'bottom-right',
        icon: '🎉'
      })

      // Redirect to Rewards page
      router.push('/rewards')
    } catch (error) {
      // No error notifications as requested; simply redirect
      router.push('/rewards')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  if (!user) {
    router.push('/api/auth/login')
    return null
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Report Waste</h1>
      
      {/* Display current total points */}
      <div className="mb-6 bg-green-50 p-4 rounded-xl shadow border-l-4 border-blue-700">
        <h2 className="text-xl font-semibold text-gray-800">Your Total Points</h2>
        <p className="text-2xl font-bold text-blue-700">{balance}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg mb-12">
        <div className="mb-8">
          <label htmlFor="waste-image" className="block text-lg font-medium text-gray-700 mb-2">
            Upload Waste Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-700 transition-colors duration-300">
            <div className="space-y-1 text-center">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      setPreview(undefined)
                      setVerificationStatus('idle')
                      setVerificationResult(null)
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-700 hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-700">
                      <span>Upload a photo</span>
                      <input
                        id="waste-image"
                        name="waste-image"
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
          </div>
        </div>

        <Button 
          type="button" 
          onClick={handleVerify} 
          className="w-full mb-8 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-xl transition-colors duration-300" 
          disabled={!file || verificationStatus === 'verifying'}
        >
          {verificationStatus === 'verifying' ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Verifying...</span>
            </>
          ) : 'Verify Waste'}
        </Button>

        {verificationStatus !== 'idle' && verificationResult && (
          <VerificationResult
            status={verificationStatus}
            result={verificationResult}
          />
        )}

        <div className="grid grid-cols-1 gap-8 mb-8">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <LocationSearch onLocationSelect={handleLocationSelect} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
              <input
                type="text"
                id="type"
                name="type"
                value={newReport.type}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700transition-all duration-300 bg-gray-50"
                placeholder="Verified waste type"
                readOnly
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount</label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={newReport.amount}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all duration-300 bg-gray-50"
                placeholder="Verified amount"
                readOnly
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-blue-700 hover:bg-blue-700 text-white py-3 text-lg rounded-xl transition-colors duration-300 flex items-center justify-center"
          disabled={loading || verificationStatus !== 'success'}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Submitting...</span>
            </>
          ) : 'Submit Report'}
        </Button>
      </form>

      <h2 className="text-3xl font-semibold mb-6 text-gray-800">Recent Reports</h2>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <MapPin className="inline-block w-4 h-4 mr-2 text-green-500" />
                    {report.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.wasteType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {`${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
