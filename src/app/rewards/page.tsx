'use client'
import { useState, useEffect } from 'react'
import { Coins, ArrowUpRight, ArrowDownRight, Gift, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getUserByEmail,
  getRewardTransactions,
  createTransaction,
  redeemReward
} from '@/utils/db/actions'
import { toast } from 'react-hot-toast'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useRouter } from 'next/navigation'

/* Custom Preset Rewards – each reward has its own unique name, description (including location), cost, and website */
const presetRewards = [
  {
    id: 1,
    name: '20% Off Eco-Friendly Products - NYC',
    cost: 100,
    description: 'Enjoy 20% off eco-friendly products at EcoStore in New York City.',
    website: 'https://ecostore.com'
  },
  {
    id: 2,
    name: '$10 Off Zero-Waste Items - London',
    cost: 50,
    description: 'Save $10 on zero-waste products available at ZeroWaste Shop in London.',
    website: 'https://zerowaste.com'
  },
  {
    id: 3,
    name: 'Free Shipping on Sustainable Products - Tokyo',
    cost: 75,
    description: 'Get free shipping on orders over $50 at GreenLife in Tokyo.',
    website: 'https://greenlife.com'
  },
  {
    id: 4,
    name: '15% Off Reusable Items - Paris',
    cost: 60,
    description: 'Save 15% on all reusable products at ReusableWorld in Paris.',
    website: 'https://reusableworld.com'
  },
  {
    id: 5,
    name: 'Buy 1 Get 1 Free Eco Accessories - Sydney',
    cost: 120,
    description: 'Enjoy a BOGO offer on selected eco accessories at EcoMart in Sydney.',
    website: 'https://ecomart.com'
  },
  {
    id: 6,
    name: '$5 Off Organic Foods - Toronto',
    cost: 40,
    description: 'Get $5 off organic groceries at OrganicMarket in Toronto.',
    website: 'https://organicmarket.com'
  },
  {
    id: 7,
    name: '10% Off Recycled Fashion - Berlin',
    cost: 80,
    description: 'Save 10% on sustainable fashion at RecycleStyle in Berlin.',
    website: 'https://recyclestyle.com'
  },
  {
    id: 8,
    name: 'Free Eco-Friendly Tote Bag - Singapore',
    cost: 30,
    description: 'Receive a free eco-friendly tote bag from GreenCarry in Singapore with your purchase.',
    website: 'https://greencarry.com'
  },
  {
    id: 9,
    name: '25% Off Solar Gadgets - Mumbai',
    cost: 150,
    description: 'Enjoy 25% off on solar-powered gadgets at SunTech in Mumbai.',
    website: 'https://suntech.com'
  },
  {
    id: 10,
    name: 'Exclusive Access to Green Workshops - Cape Town',
    cost: 200,
    description: 'Gain exclusive access to eco-friendly workshops and events at GreenLearn in Cape Town.',
    website: 'https://greenlearn.com'
  }
]

type Transaction = {
  id: number
  type: 'earned_report' | 'earned_collect' | 'redeemed'
  amount: number
  description: string
  createdAt: Date
}

export default function RewardsPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [dbUser, setDbUser] = useState<{ id: number; email: string; name: string } | null>(null)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserDataAndTransactions = async () => {
      setLoading(true)
      try {
        if (user?.email) {
          const fetchedUser = await getUserByEmail(user.email)
          if (fetchedUser) {
            setDbUser(fetchedUser)
            const fetchedTransactions = await getRewardTransactions(fetchedUser.id)
            setTransactions(fetchedTransactions as Transaction[])
            const calculatedBalance = fetchedTransactions.reduce((acc, transaction) => {
              return transaction.type.startsWith('earned')
                ? acc + transaction.amount
                : acc - transaction.amount
            }, 0)
            setBalance(Math.max(calculatedBalance, 0))
          } else {
            toast.error('User not found. Please log in again.')
            router.push('/api/auth/login')
          }
        }
      } catch (error) {
        console.error('Error fetching user data and transactions:', error)
        toast.error('Failed to load rewards data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchUserDataAndTransactions()
  }, [user, router])

  const handleRedeemReward = async (coupon: {
    id: number;
    name: string;
    cost: number;
    description: string;
    website: string;
  }) => {
    if (!dbUser) {
      toast.error("Please log in to redeem rewards.");
      return;
    }
  
    if (balance >= coupon.cost) {
      try {
        // Step 1: Redeem reward (deducts points)
        
  
        
  
        // Step 2: Log transaction (but DO NOT deduct points again)
        await createTransaction(
          dbUser.id,
          "redeemed",
          coupon.cost,
          `Redeemed ${coupon.name}`
        );
  
        // Step 3: Refresh transactions to fetch correct balance
        await refreshTransactions();
  
        // Step 4: Show success toast
        toast.success(
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-lg">
              🎉 Successfully Redeemed!
            </div>
            <div className="text-gray-900 text-base font-medium">{coupon.name}</div>
  
            {coupon.website && (
              <div className="text-sm">
                <span className="text-gray-700">🌐 Visit website: </span>
                <a
                  href={coupon.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-700 transition"
                >
                  {coupon.website}
                </a>
              </div>
            )}
          </div>,
          {
            position: "bottom-right",
            icon: "✅",
            style: {
              borderRadius: "12px",
              background: "#f0f5ff",               // soft light blue background
              color: "#1e3a8a",                    // deep blue text
              borderLeft: "5px solid #3b82f6",     // blue-500 left border
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.05)", // softer shadow
            },
            
          }
        );
      } catch (error) {
        console.error("Error redeeming reward:", error);
        toast.error("Failed to redeem reward. Please try again.", {
          position: "bottom-right",
        });
      }
    } else {
      toast.error("Insufficient balance to redeem this reward", {
        position: "bottom-right",
      });
    }
  };
  
  

  const refreshTransactions = async () => {
    if (!dbUser) return;
    const fetchedTransactions = await getRewardTransactions(dbUser.id);
  
    setTransactions(fetchedTransactions as Transaction[]);
  
    const calculatedBalance = fetchedTransactions.reduce((acc, transaction) => {
      return transaction.type.startsWith("earned")
        ? acc + transaction.amount
        : acc - transaction.amount;
    }, 0);
  
    // Ensure balance does not go negatives
    setBalance(Math.max(calculatedBalance, 0));
  };
  

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    )
  }

  if (!user) {
    router.push('/api/auth/login')
    return null
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Rewards</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full border-l-4 border-blue-700 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Reward Balance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Coins className="w-10 h-10 mr-3 text-blue-700" />
            <div>
              <span className="text-4xl font-bold text-blue-700">{balance}</span>
              <p className="text-sm text-gray-500">Available Points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Transactions</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {transactions.length > 0 ? (
              transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center">
                    {transaction.type.startsWith('earned') ? (
                      <ArrowUpRight className="w-5 h-5 text-blue-700 mr-3" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${transaction.type.startsWith('earned') ? 'text-blue-700' : 'text-red-500'}`}>
                    {transaction.type.startsWith('earned') ? '+' : '-'}
                    {transaction.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No transactions yet</div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Available Rewards</h2>
          <div className="space-y-4">
            {presetRewards.map((coupon) => (
              <div key={coupon.id} className="bg-white p-4 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{coupon.name}</h3>
                  <span className="text-blue-700 font-semibold">{coupon.cost} points</span>
                </div>
                <p className="text-gray-600 mb-2">{coupon.description}</p>
                {coupon.website && (
                  <p className="text-sm text-blue-600 mb-2">
                    <a href={coupon.website} target="_blank" rel="noopener noreferrer">
                      Visit website
                    </a>
                  </p>
                )}
                <Button
                  onClick={() => handleRedeemReward(coupon)}
                  className="w-full bg-blue-700 hover:bg-blue-700 text-white"
                  disabled={balance < coupon.cost}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Redeem Reward
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}