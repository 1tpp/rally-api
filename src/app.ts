import { config } from './config'
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from '@elysiajs/swagger'
import { jwt } from '@elysiajs/jwt'

import { routers } from './routes';

import './database'

export const app = new Elysia()
  .use(cors({
    origin: /\*.1tpp.dev$/,
    credentials: true
  }))
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Rally API Documentation',
        version: '0.0.1',
      }
    }
  }))
  .use(
    jwt({
      name: 'jwt',
      secret: config.jwtSecretKey,
      exp: config.jwtExpiresIn,
    })
  )
  .use(routers)

