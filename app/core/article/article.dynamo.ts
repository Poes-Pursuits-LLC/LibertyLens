import { Entity } from 'electrodb'
import { nanoid } from 'nanoid'
import { Resource } from 'sst'
import { getDynamoClient, createFormattedDate } from '../utils'

export const DynamoArticle = () => {
    const client = getDynamoClient()
    const table = process.env.TABLE_NAME || Resource.Table.name

    return new Entity(
        {
            model: {
                entity: 'article',
                version: '1',
                service: 'article',
            },
            attributes: {
                articleId: {
                    type: 'string',
                    required: true,
                    default: () => nanoid().toLowerCase(),
                },
                sourceId: {
                    type: 'string',
                    required: true,
                },
                sourceName: {
                    type: 'string',
                    required: true,
                },
                originalUrl: {
                    type: 'string',
                    required: true,
                },
                title: {
                    type: 'string',
                    required: true,
                },
                summary: {
                    type: 'string',
                    required: true,
                },
                content: {
                    type: 'string',
                    required: true,
                },
                author: {
                    type: 'string',
                    required: false,
                },
                publishedAt: {
                    type: 'string',
                    required: true,
                },
                fetchedAt: {
                    type: 'string',
                    required: true,
                    default: () => createFormattedDate(),
                },
                tags: {
                    type: 'list',
                    required: true,
                    default: [],
                    items: {
                        type: 'string',
                    },
                },
                imageUrl: {
                    type: 'string',
                    required: false,
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
                type: {
                    type: 'string',
                    required: true,
                    default: () => 'article',
                },
            },
            indexes: {
                primary: {
                    pk: { field: 'pk', composite: ['articleId'] },
                    sk: { field: 'sk', composite: ['type'] },
                },
                bySource: {
                    index: 'gsi1pk-gsi1sk-index',
                    pk: { field: 'gsi1pk', composite: ['sourceId'] },
                    sk: { field: 'gsi1sk', composite: ['publishedAt'] },
                },
                byPublishedDate: {
                    index: 'gsi2pk-gsi2sk-index',
                    pk: { field: 'gsi2pk', composite: ['type'] },
                    sk: { field: 'gsi2sk', composite: ['publishedAt'] },
                },
                byUrl: {
                    index: 'gsi3pk-gsi3sk-index',
                    pk: { field: 'gsi3pk', composite: ['originalUrl'] },
                    sk: { field: 'gsi3sk', composite: ['type'] },
                },
            },
        },
        {
            client,
            table,
        },
    )
}
