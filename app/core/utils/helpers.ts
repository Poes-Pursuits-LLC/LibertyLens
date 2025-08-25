import { format } from 'date-fns'

export const createFormattedDate = (): string => {
    return new Date().toISOString()
}

export const formatDate = (date: Date | string, formatString = 'yyyy-MM-dd HH:mm:ss'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, formatString)
}

export const getTTL = (hours: number): number => {
    const ttl = Math.floor(Date.now() / 1000) + hours * 60 * 60
    return ttl
}

export const handleAsync = async <T>(
    promise: Promise<T>,
): Promise<[T | null, Error | null]> => {
    try {
        const data = await promise
        return [data, null]
    } catch (error) {
        return [null, error as Error]
    }
}

export const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}
