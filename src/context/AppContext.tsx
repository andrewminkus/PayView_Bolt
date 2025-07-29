import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'

interface AppContextType {
  user: ReturnType<typeof useAuth>['user']
  loading: boolean
  profile: ReturnType<typeof useProfile>['profile']
  profileLoading: ReturnType<typeof useProfile>['loading']
  signUp: ReturnType<typeof useAuth>['signUp']
  signIn: ReturnType<typeof useAuth>['signIn']
  signOut: ReturnType<typeof useAuth>['signOut']
  updateProfile: ReturnType<typeof useProfile>['updateProfile']
  refetchProfile: ReturnType<typeof useProfile>['refetch']
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const profile = useProfile()

  const value: AppContextType = {
    user: auth.user,
    loading: auth.loading,
    profile: profile.profile,
    profileLoading: profile.loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    updateProfile: profile.updateProfile,
    refetchProfile: profile.refetch,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}