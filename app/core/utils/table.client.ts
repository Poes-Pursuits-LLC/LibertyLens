import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

let dynamoClient: DynamoDBClient | null = null

export const getDynamoClient = (): DynamoDBClient => {
    if (!dynamoClient) {
        dynamoClient = new DynamoDBClient({
            region: process.env.AWS_REGION || 'us-east-1',
        })
    }
    return dynamoClient
}
