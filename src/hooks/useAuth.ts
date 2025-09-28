import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type User = {
  id: string
  email: string | undefined
  isAuthenticated: boolean
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)