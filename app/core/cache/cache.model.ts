export interface Cache {
    cacheKey: string
    cached: unknown
    expireAt: number
    createdAt: string
    type: 'cache'
}
