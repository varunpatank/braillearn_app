'use client'
import { useState, useEffect } from 'react'
import {
  getAllRewards,
  getUserByEmail,
  getRewardTransactions
} from '@/utils/db/actions'
import { Loader, Award, User, Trophy, Crown } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'

/** If your DB row also has other fields (description, collectionInfo, etc.)
 *  add them here as optional or required. */
type RewardRow = {
  id: number
  userId: number
  points: number // might be stored in DB, but we’ll re-compute from transactions
  level: number
  userName: string | null
  createdAt?: string
}

export default function LeaderboardPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()

  // The array we’ll display
  const [rewards, setRewards] = useState<RewardRow[]>([])
  // The DB user record for the currently logged-in user
  const [dbUser, setDbUser] = useState<{ id: number; email: string; name: string } | null>(null)
  // For a loading spinner
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run once Auth0 is done checking if a user is logged in
    if (isLoading) return

    // If Auth0 says "no user" -> push to login (avoid loops)
    if (!user) {
      router.push('/api/auth/login')
      return
    }

    // Otherwise, fetch data now and (optionally) poll every X seconds
    fetchLeaderboardData()
    const intervalId = setInterval(fetchLeaderboardData, 10000) // 10s refresh
    return () => clearInterval(intervalId)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]) 
  // ^ NO other dependencies (like dbUser or rewards) to avoid infinite loops.

  async function fetchLeaderboardData() {
    setLoading(true)
    try {
      // 1) Find this user in the DB
      const fetchedUser = await getUserByEmail(user!.email!)
      if (!fetchedUser) {
        toast.error('User not found in DB. Please log in again.')
        return
      }
      setDbUser(fetchedUser)

      // 2) Get all “rewards” rows – if your DB or “rewards” table tracks each user
      const dbRewards = await getAllRewards()

      // 3) If the current user has no row in that table, let's add a placeholder so they appear.
      //    (You can also insert into DB, or do nothing if your app auto-creates them.)
      const existsForCurrent = dbRewards.some((row: any) => row.userId === fetchedUser.id)
      if (!existsForCurrent) {
        dbRewards.push({
          id: -1,
          userId: fetchedUser.id,
          points: 0,
          level: 1,
          userName: fetchedUser.name ?? 'Anonymous',
          createdAt: new Date().toISOString()
        })
      }

      // 4) Re-compute “points” from transactions for each user, so it’s always correct
      //    (Ignore the `points` column in DB if you want to rely purely on transactions.)
      const updated: RewardRow[] = await Promise.all(
        dbRewards.map(async (row: any) => {
          const transactions = await getRewardTransactions(row.userId)
          const total = transactions.reduce((acc: number, tx: any) => {
            return tx.type.startsWith('earned') ? acc + tx.amount : acc - tx.amount
          }, 0)

          return {
            ...row,
            points: total < 0 ? 0 : total, // ensure it never goes below 0
            userName: row.userName || row.name || 'Anonymous',
            createdAt: row.createdAt
              ? new Date(row.createdAt).toLocaleDateString()
              : undefined
          }
        })
      )

      // 5) Sort by descending points
      updated.sort((a, b) => b.points - a.points)
      setRewards(updated)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      toast.error('Failed to load leaderboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // While we’re fetching
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    )
  }

  // If we have no data or no user, show fallback
  if (!dbUser || rewards.length === 0) {
    return (
      <div className="text-center mt-16">
        <p className="text-gray-500">No leaderboard data available.</p>
      </div>
    )
  }

  // Normal leaderboard
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Leaderboard</h1>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-purple-800 p-6">
          <div className="flex justify-between items-center text-white">
            <Trophy className="h-10 w-10" />
            <span className="text-2xl font-bold">Top Performers</span>
            <Award className="h-10 w-10" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Level
                </th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((row, index) => {
                const rank = index + 1
                const isCurrentUser = row.userId === dbUser.id
                return (
                  <tr
                    key={row.id === -1 ? `temp-${dbUser.id}` : row.id}
                    className={`${
                      isCurrentUser ? 'bg-indigo-50' : ''
                    } hover:bg-gray-50 transition-colors duration-150 ease-in-out`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {rank <= 3 ? (
                          <Crown
                            className={`h-6 w-6 ${
                              rank === 1
                                ? 'text-yellow-400'
                                : rank === 2
                                ? 'text-gray-400'
                                : 'text-yellow-600'
                            }`}
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-10 w-10 rounded-full bg-gray-200 text-gray-500 p-2" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {row.userName}
                          </div>
                          {/* If you want to display the row.createdAt: 
                          <div className="text-xs text-gray-500">
                            {row.createdAt}
                          </div> */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-indigo-500 mr-2" />
                        <div className="text-sm font-semibold text-gray-900">
                          {row.points.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        Level {row.level}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
