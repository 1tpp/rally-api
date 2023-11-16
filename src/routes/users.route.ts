import { Elysia, t } from "elysia";
import { User } from "../models";

export const usersRoute = new Elysia()
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

