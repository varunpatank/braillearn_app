'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Menu, Coins, Search, User, ChevronDown } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { getUserByEmail, getRewardTransactions } from "@/utils/db/actions"
import { useUser } from '@auth0/nextjs-auth0/client'

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, isLoading } = useUser()
  const [totalPoints, setTotalPoints] = useState(0)
  const pathname = usePathname()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        try {
          const userData = await getUserByEmail(user.email)
          if (userData) {
            const transactions = await getRewardTransactions(userData.id)
            const calculatedPoints = transactions.reduce((acc: number, transaction: any) => {
              return transaction.type.startsWith('earned')
                ? acc + transaction.amount
                : acc - transaction.amount
            }, 0)
            setTotalPoints(calculatedPoints)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }
    }

    if (user) {
      fetchUserData()
      const updateInterval = setInterval(fetchUserData, 5000)
      return () => clearInterval(updateInterval)
    }
  }, [user])

  const handleLogout = () => {
    window.location.href = '/api/auth/logout'
  }

  return (
    <header className="bg-gradient-to-r from-white via-blue-50 to-white border-b border-blue-100 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2 md:mr-4 text-blue-600 hover:bg-blue-50" 
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center">
            <img
              src="https://img.icons8.com/fluency/96/trash.png"
              alt="WasteHero Logo"
              className="h-8 w-8 md:h-10 md:w-10 mr-2"
            />
            <div className="flex flex-col">
              <span className="font-bold text-base md:text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                WasteHero
              </span>
              <span className="text-[8px] md:text-[10px] text-blue-500">
                Making waste management heroic
              </span>
            </div>
          </Link>
        </div>

        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Tasks"
                className="w-full px-4 py-2 bg-white border border-blue-200 rounded-full text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <Search 
                onClick={() => router.push('/collect')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 cursor-pointer" 
              />
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => router.push('/collect')}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {user && (
            <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-500 rounded-full px-3 py-1.5 shadow-lg">
              <Coins className="h-4 w-4 md:h-5 md:w-5 mr-2 text-white" />
              <span className="font-semibold text-sm md:text-base text-white">
                {totalPoints.toLocaleString()}
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="h-10 w-10 rounded-full bg-blue-100 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon" className="flex items-center text-blue-600 hover:bg-blue-50">
      <User className="h-5 w-5 mr-1" />
      <ChevronDown className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuItem>
      <span>{user.name || user.email}</span>
    </DropdownMenuItem>
    <DropdownMenuItem
      onClick={handleLogout}
      className="border border-red-500 rounded px-2 py-1 text-red-500 hover:bg-red-100"
    >
      Sign Out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

          ) : (
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
