import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { Profile, profilesApi } from '@/services/profiles'
import { useAuth } from './AuthContext'

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  error: string | null
  imageVersion: number
  getProfile: () => Promise<Profile | null>
  updateProfile: (data: {
    name?: string | null
    nickname?: string | null
    img_url?: string | null
  }) => Promise<Profile | null>
  refreshProfile: () => Promise<void>
  clearProfile: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

interface ProfileProviderProps {
  children: ReactNode
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageVersion, setImageVersion] = useState<number>(Date.now()) // For cache busting
  const { user, loading: authLoading } = useAuth()

  // Clear profile when user logs out
  const clearProfile = useCallback(() => {
    setProfile(null)
    setError(null)
    setLoading(false)
    setImageVersion(Date.now()) // Reset image version
  }, [])

  // Get profile from API
  const getProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user) {
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const profileData = await profilesApi.getCurrentProfile()
      setProfile(profileData)
      return profileData
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error fetching profile'
      setError(errorMessage)
      console.error('Error fetching profile:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  // Update profile
  const updateProfile = useCallback(
    async (data: {
      name?: string | null
      nickname?: string | null
      img_url?: string | null
    }): Promise<Profile | null> => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      try {
        setLoading(true)
        setError(null)
        const updatedProfile = await profilesApi.updateProfile(data)

        // If we're updating the image, update the image version for cache busting
        if (data.img_url) {
          setImageVersion(Date.now())
        }

        setProfile(updatedProfile)
        return updatedProfile
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error updating profile'
        setError(errorMessage)
        console.error('Error updating profile:', err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  // Refresh profile (re-fetch from API)
  const refreshProfile = useCallback(async (): Promise<void> => {
    await getProfile()
  }, [getProfile])

  // Effect to handle auth state changes
  useEffect(() => {
    if (authLoading) {
      // Auth is still loading, don't do anything yet
      return
    }

    if (!user) {
      // User logged out, clear profile
      clearProfile()
      return
    }

    // User is authenticated and we don't have a profile yet, fetch it
    if (user && !profile && !loading) {
      getProfile()
    }
  }, [user, authLoading, profile, loading, getProfile, clearProfile])

  const contextValue: ProfileContextType = {
    profile,
    loading,
    error,
    imageVersion,
    getProfile,
    updateProfile,
    refreshProfile,
    clearProfile,
  }

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  )
}
