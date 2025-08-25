import { Entity } from 'electrodb'
import { nanoid } from 'nanoid'
import { Resource } from 'sst'
import { getDynamoClient, createFormattedDate } from '../utils'

export const DynamoNewsSource = () => {
    const client = getDynamoClient()
    const table = process.env.TABLE_NAME || Resource.Table.name

    return new Entity(
        {
            model: {
                entity: 'newsSource',
                version: '1',
                service: 'newsSource',
            },
            attributes: {
                sourceId: {
                    type: 'string',
                    required: true,
                    default: () => nanoid().toLowerCase(),
                },
                name: {
                    type: 'string',
                    required: true,
                },
                description: {
                    type: 'string',
                    required: false,
                },
                url: {
                    type: 'string',
                    required: true,
                },
                type: {
                    type: ['rss', 'api', 'scraper'] as const,
                    required: true,
                },
                category: {
                    type: ['mainstream', 'alternative', 'libertarian', 'financial', 'tech', 'international'] as const,
                    required: true,
                },
                logoUrl: {
                    type: 'string',
                    required: false,
                },
                isActive: {
                    type: 'boolean',
                    required: true,
                    default: true,
                },
                isPublic: {
                    type: 'boolean',
                    required: true,
                    default: false,
                },
                addedByUserId: {
                    type: 'string',
                    required: false,
                },
                fetchConfig: {
                    type: 'map',
                    required: false,
                    properties: {
                        headers: {
                            type: 'map',
                            required: false,
                            properties: {
                                '*': {
                                    type: 'string',
                                    required: false,
                                },
                            },
                        },
                        apiKey: {
                            type: 'string',
                            required: false,
                        },
                        rateLimit: {
                            type: 'number',
                            required: false,
                        },
                        selector: {
                            type: 'string',
                            required: false,
                        },
                    },
                },
                reliability: {
                    type: 'map',
                    required: true,
                    default: () => ({
                        score: 100,
                        failureCount: 0,
                    }),
                    properties: {
                        score: {
                            type: 'number',
                            required: true,
                        },
                        lastSuccessfulFetch: {
                            type: 'string',
                            required: false,
                        },
                        lastFailedFetch: {
                            type: 'string',
                            required: false,
                        },
                        failureCount: {
                            type: 'number',
                            required: true,
                        },
                    },
                },
                tags: {
                    type: 'list',
                    required: true,
                    default: [],
                    items: {
                        type: 'string',
                    },
                },
                createdAt: {
                    type: 'string',
                    required: true,
                    default: () => createFormattedDate(),
                },
                updatedAt: {
                    type: 'string',
                    required: true,
                    default: () => createFormattedDate(),
                    set: () => createFormattedDate(),
                },
                entityType: {
                    type: 'string',
                    required: true,
                    default: () => 'news-source',
                },
            },
            indexes: {
                primary: {
                    pk: { field: 'pk', composite: ['sourceId'] },
                    sk: { field: 'sk', composite: ['entityType'] },
                },
                byCategory: {
                    index: 'gsi1pk-gsi1sk-index',
                    pk: { field: 'gsi1pk', composite: ['category'] },
                    sk: { field: 'gsi1sk', composite: ['reliability.score'] },
                },
                byUser: {
                    index: 'gsi2pk-gsi2sk-index',
                    pk: { field: 'gsi2pk', composite: ['addedByUserId'] },
                    sk: { field: 'gsi2sk', composite: ['createdAt'] },
                },
                publicSources: {
                    index: 'gsi3pk-gsi3sk-index',
                    pk: { field: 'gsi3pk', composite: ['isPublic'] },
                    sk: { field: 'gsi3sk', composite: ['category', 'name'] },
                },
                activeSources: {
                    index: 'gsi4pk-gsi4sk-index',
                    pk: { field: 'gsi4pk', composite: ['isActive'] },
                    sk: { field: 'gsi4sk', composite: ['type', 'updatedAt'] },
                },
            },
        },
        {
            client,
            table,
        },
    )
}
