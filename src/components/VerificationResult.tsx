import { CheckCircle, XCircle, Award } from 'lucide-react'

interface VerificationResultProps {
  status: 'verifying' | 'success' | 'failure'
  result: any
  isCollect?: boolean
  difficulty?: string
  points?: number
}

export function VerificationResult({ status, result, isCollect = false, difficulty, points }: VerificationResultProps) {
  if (status === 'success') {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200 animate-in fade-in slide-in-from-bottom-4 mb-8">
        <div className="flex items-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
          <h3 className="text-xl text-green-800 font-medium">Verification Successful</h3>
        </div>
        <div className="space-y-3 text-sm text-green-700">
          {isCollect ? (
            <>
              <div className="flex items-center">
                <span className="font-medium w-24">Quantity:</span>
                <span>{result.quantity}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-24">Confidence:</span>
                <span>{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-24">Assessment:</span>
                <span>{result.assessment}</span>
              </div>
              {result.matchesDifficulty && (
                <div className="mt-4 flex items-center text-green-600">
                  <Award className="h-5 w-5 mr-2" />
                  <span className="font-medium">Matches {difficulty} difficulty level</span>
                </div>
              )}
              {points && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600 mr-2" />
                  <span className="font-bold text-green-800">You'll earn {points} points!</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center">
                <span className="font-medium w-24">Waste Type:</span>
                <span>{result.wasteType}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-24">Quantity:</span>
                <span>{result.quantity}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-24">Confidence:</span>
                <span>{(result.confidence * 100).toFixed(1)}%</span>
              </div>
              {difficulty && (
                <div className="mt-4 flex items-center">
                  <span className="font-medium w-24">Difficulty:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {difficulty}
                  </span>
                </div>
              )}
              {points && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600 mr-2" />
                  <span className="font-bold text-green-800">You'll earn {points} points!</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  if (status === 'verifying') {
    return (
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-bottom-4 mb-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-blue-800">Verifying waste...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-50 p-6 rounded-lg border border-red-200 animate-in fade-in slide-in-from-bottom-4 mb-8">
      <div className="flex items-center mb-4">
        <XCircle className="h-8 w-8 text-red-500 mr-3" />
        <h3 className="text-xl text-red-800 font-medium">Verification Failed</h3>
      </div>
      <div className="space-y-3 text-sm text-red-700">
        <p className="leading-relaxed">{result?.assessment || 'Could not verify the waste image. Please try again with a clearer image.'}</p>
        {result?.confidence && (
          <div className="mt-2 p-3 bg-red-100 rounded-lg">
            <p className="font-medium">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
            <p className="text-xs mt-1">A higher confidence level is required for verification.</p>
          </div>
        )}
      </div>
    </div>
  )
}