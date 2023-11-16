import { Elysia, t, NotFoundError } from "elysia";
import { User } from "../models";

export const authRoute = new Elysia()
  .group("/auth", (app) => {
    return app
      .model({
        'auth.sign-in': t.Object({
          email: t.String({
            format: 'email',
            error: 'Email is required'
          }),
          password: t.String({
            minLength: 8,
            error: 'Password is required'
          })
        }, {
          description: 'Sign in',
          tags: ['authentication'],
        }),
        'auth.sign-up': t.Object({
          email: t.String({
            format: 'email',
            error: 'Email is required'
          }),
          username: t.String({
            error: 'Username is required'
          }),
          password: t.String({
            minLength: 8,
            error: 'Password is required'
          }),
          firstName: t.String({
            error: 'First name is required'
          }),
          lastName: t.String({
            error: 'Last name is required'
          }),
          birthday: t.String({
            format: 'date',
            error: 'Birthday is required'
          }),
        }, {
          description: 'Sign up',
          tags: ['authentication'],
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
      const token = await jwt.sign({
        sub: userExists._id.toString(),
        role: userExists.role,
      })
      set.headers['Authorization'] = `Bearer ${token}`

      return {
        message: 'Sign in successfully'
      }
    } catch (err) {
      throw err
    }
  }, {
    body: 'auth.sign-in',
    detail: {
      summary: 'Sign in',
      tags: ['authentication'],
    }
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

      const token = await jwt.sign({
        sub: newUser._id.toString(),
        role: newUser.role,
      })
      set.headers['Authorization'] = `Bearer ${token}`

      return {
        message: 'Sign up successfully'
      }
    } catch (err) {
      throw err
    }
  }, {
    body: 'auth.sign-up',
    detail: {
      summary: 'Sign up',
      tags: ['authentication'],
    }
  })
