import { Elysia } from 'elysia'
import { bearer } from '@elysiajs/bearer'

import { authRoute } from './auth.route'

export const routers = new Elysia()
  .use(authRoute)
  .use(bearer())
