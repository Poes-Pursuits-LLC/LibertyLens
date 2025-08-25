export type SubscriptionTier = 'free' | 'premium' | 'professional'
export type AnalysisIntensity = 'light' | 'moderate' | 'deep'

export interface UserPreferences {
    analysisIntensity: AnalysisIntensity
    topics: string[]
    emailNotifications: boolean
    timezone: string
}

export interface User {
    userId: string
    email: string
    username: string
    createdAt: string
    updatedAt: string
    preferences: UserPreferences
    subscription: SubscriptionTier
    isActive: boolean
    lastLoginAt?: string
    type: 'user'
}
