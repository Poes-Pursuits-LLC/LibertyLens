import { handle } from 'hono/aws-lambda'
import { main } from './main'

export const handler = handle(main)
