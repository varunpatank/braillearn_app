import { motion } from 'framer-motion'
import { Award, Scale, CheckCircle } from 'lucide-react'

interface ImpactStatsProps {
  totalPoints: number
  totalWaste: number
  successRate: number
}

export function ImpactStats({ totalPoints, totalWaste, successRate }: ImpactStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center">
          <Award className="h-8 w-8 text-green-600" />
          <h3 className="ml-3 text-lg font-semibold text-green-800">Total Points</h3>
        </div>
        <p className="mt-4 text-3xl font-bold text-green-700">{totalPoints.toLocaleString()}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center">
          <Scale className="h-8 w-8 text-blue-600" />
          <h3 className="ml-3 text-lg font-semibold text-blue-800">Total Waste</h3>
        </div>
        <p className="mt-4 text-3xl font-bold text-blue-700">{totalWaste.toLocaleString()} kg</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm"
      >
        <div className="flex items-center">
          <CheckCircle className="h-8 w-8 text-purple-600" />
          <h3 className="ml-3 text-lg font-semibold text-purple-800">Success Rate</h3>
        </div>
        <p className="mt-4 text-3xl font-bold text-purple-700">{successRate}%</p>
      </motion.div>
    </div>
  )
}