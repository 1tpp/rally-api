import { Elysia } from 'elysia'
import { bearer } from '@elysiajs/bearer'

import { authRoute } from './auth.route'
import { usersRoute } from './users.route'

export const routers = new Elysia()
  .use(authRoute)
  .use(bearer())
  .use(usersRoute)
