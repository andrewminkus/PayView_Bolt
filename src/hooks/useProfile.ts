import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { db, type Profile } from '../lib/supabase'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      let profile = await db.getProfile(user.id)
      
      // Create profile if it doesn't exist
      if (!profile) {
        const newProfile = {
          user_id: user.id,
          email: user.email || '',
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          is_creator: false,
          stripe_onboarding_complete: false,
          total_earnings_cents: 0,
          total_sales_count: 0,
        }

        profile = await db.updateProfile(user.id, newProfile)
      }
      
      setProfile(profile)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return null

    try {
      setError(null)
      const updatedProfile = await db.updateProfile(user.id, updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    }
  }

  const refreshProfile = () => {
    fetchProfile()
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: refreshProfile,
  }
}