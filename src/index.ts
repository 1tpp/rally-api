import { config } from './config'
import * as mongoose from 'mongoose'

import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { jwt } from '@elysiajs/jwt'
import { bearer } from '@elysiajs/bearer'

import { User } from './schemas/user.schema'

await mongoose.connect(config.mongoUri).then(() => {
  const app = new Elysia()
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
    .get("/ping", () => "pong")
    .group("/auth", (app) => {
      return app
        .get("/", () => "Authentication")
        .model({
          'auth.sign-in': t.Object({
            email: t.String({
              format: 'email',
            }),
            password: t.String({
              minLength: 8,
            })
          }),
          'auth.sign-up': t.Object({
            email: t.String({
              format: 'email'
            }),
            username: t.String(),
            password: t.String({
              minLength: 8,
            }),
            firstName: t.String(),
            lastName: t.String(),
            birthday: t.String({
              format: 'date',
            }),
          })
        })
        .post('/sign-in', async ({ body, set, jwt }) => {
          try {
            const userExists = await User.findOne({
              email: body.email
            }).select('+password')

            if (!userExists) {
              throw new Error('User not found')
            }

            const passwordMatch = await Bun.password.verify(body.password, userExists.password)
            if (!passwordMatch) {
              throw new Error('Password is incorrect')
            }

            set.headers['Authorization'] = 'Bearer ' + await jwt.sign({
              sub: userExists._id.toString(),
              role: userExists.role,
            })

            return {
              message: 'Sign in successfully'
            }
          } catch (err) {
            throw err
          }
        }, {
          body: 'auth.sign-in',
        })
        .post("/sign-up", async ({ body, set, jwt }) => {
          try {
            const userExists = await User.findOne({
              $or: [
                { email: body.email },
                { username: body.username },
              ],
            })

            if (userExists) {
              throw new Error('Email or username already exists')
            }

            const newUser = new User({
              email: body.email,
              password: await Bun.password.hash(body.password, {
                algorithm: 'bcrypt',
                cost: 10,
              }),
              firstName: body.firstName,
              lastName: body.lastName,
              birthday: body.birthday,
            })

            await newUser.save()

            set.headers['Authorization'] = 'Bearer ' + await jwt.sign({
              sub: newUser._id.toString(),
              role: newUser.role,
            })

            return {
              message: 'Sign up successfully'
            }
          } catch (err) {
            throw err
          }
        }, {
          body: 'auth.sign-up',
        })
    })
    .use(bearer())
    .group("/users", (app) => {
      return app
        .get("/", async () => {
          const users = await User.find()
          return users
        })
        .get("/me", async ({ bearer, jwt }) => {
          const payload = await jwt.verify(bearer?.split(' ')[1])
          if (!payload) {
            throw new Error('Unauthorized')
          }
          const user = await User.findById(payload.sub)
          if (!user) {
            throw new Error('User not found')
          }

          return user
        }, {
          beforeHandle({ bearer, set }) {
            if (!bearer) {
              set.status = 400
              set.headers[
                'WWW-Authenticate'
              ] = `Bearer realm='sign', error="invalid_request"`

              return 'Unauthorized'
            }
          }
        })
        .get("/:id", async ({ params }) => {
          const user = await User.findById(params.id)
          return user
        })
        .delete("/:id", async ({ params }) => {
          const user = await User.findByIdAndDelete(params.id)
          return user
        })
    })
    .listen(config.port)

  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  )

}).catch((err) => {
  console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err)
})
