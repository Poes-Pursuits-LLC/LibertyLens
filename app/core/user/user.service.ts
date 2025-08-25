import { getTTL, handleAsync } from '../utils'
import { DynamoCache } from '../cache/cache.dynamo'
import { DynamoUser } from './user.dynamo'
import type { User, UserPreferences, SubscriptionTier } from './user.model'

const getUserById = async (userId: string): Promise<User | null> => {
    const cacheKey = `user:${userId}`
    const { data: cached } = await DynamoCache().get({ cacheKey }).go()
    if (cached?.cached) return cached.cached as User

    const { data: user } = await DynamoUser()
        .get({ userId, type: 'user' })
        .go()

    if (user) {
        await DynamoCache()
            .put({
                cacheKey,
                cached: user,
                expireAt: getTTL(1), // Cache for 1 hour
            })
            .go()
    }

    return user || null
}

const getUserByEmail = async (email: string): Promise<User | null> => {
    const { data } = await DynamoUser()
        .query.byEmail({ email, type: 'user' })
        .go()

    return data?.[0] || null
}

const getUserByUsername = async (username: string): Promise<User | null> => {
    const { data } = await DynamoUser()
        .query.byUsername({ username, type: 'user' })
        .go()

    return data?.[0] || null
}

const createUser = async (
    userData: Pick<User, 'email' | 'username'> & {
        preferences?: Partial<UserPreferences>
    },
) => {
    const [existingEmail] = await handleAsync(getUserByEmail(userData.email))
    if (existingEmail) {
        return [null, new Error('User with this email already exists')]
    }

    const [existingUsername] = await handleAsync(getUserByUsername(userData.username))
    if (existingUsername) {
        return [null, new Error('User with this username already exists')]
    }

    const [user, error] = await handleAsync(
        DynamoUser()
            .put({
                email: userData.email,
                username: userData.username,
                preferences: {
                    analysisIntensity: userData.preferences?.analysisIntensity || 'moderate',
                    topics: userData.preferences?.topics || [],
                    emailNotifications: userData.preferences?.emailNotifications ?? true,
                    timezone: userData.preferences?.timezone || 'UTC',
                },
            })
            .go(),
    )

    return [user?.data || null, error]
}

const updateUser = async (
    userId: string,
    updates: Partial<Pick<User, 'username' | 'preferences' | 'subscription' | 'isActive'>>,
) => {
    // Clear cache for this user
    await DynamoCache().delete({ cacheKey: `user:${userId}` }).go()

    const [user, error] = await handleAsync(
        DynamoUser()
            .update({ userId, type: 'user' })
            .set(updates)
            .go({ response: 'all_new' }),
    )

    return [user?.data || null, error]
}

const updateLastLogin = async (userId: string) => {
    await DynamoCache().delete({ cacheKey: `user:${userId}` }).go()

    const [user, error] = await handleAsync(
        DynamoUser()
            .update({ userId, type: 'user' })
            .set({ lastLoginAt: new Date().toISOString() })
            .go({ response: 'all_new' }),
    )

    return [user?.data || null, error]
}

const updateSubscription = async (userId: string, subscription: SubscriptionTier) => {
    await DynamoCache().delete({ cacheKey: `user:${userId}` }).go()

    const [user, error] = await handleAsync(
        DynamoUser()
            .update({ userId, type: 'user' })
            .set({ subscription })
            .go({ response: 'all_new' }),
    )

    return [user?.data || null, error]
}

const getUsersBySubscription = async (
    subscription: SubscriptionTier,
    cursor?: string,
    limit = 20,
) => {
    const params: any = { subscription }
    const query = DynamoUser().query.bySubscription(params)

    if (cursor) {
        query.cursor(cursor)
    }

    const [result, error] = await handleAsync(query.limit(limit).go())

    return [
        {
            users: result?.data || [],
            cursor: result?.cursor || null,
        },
        error,
    ]
}

const deactivateUser = async (userId: string) => {
    return updateUser(userId, { isActive: false })
}

const reactivateUser = async (userId: string) => {
    return updateUser(userId, { isActive: true })
}

export const userService = {
    getUserById,
    getUserByEmail,
    getUserByUsername,
    createUser,
    updateUser,
    updateLastLogin,
    updateSubscription,
    getUsersBySubscription,
    deactivateUser,
    reactivateUser,
}
