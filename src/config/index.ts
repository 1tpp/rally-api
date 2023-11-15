export const config = {
  port: process.env.PORT || 3000,
  jwtSecretKey: process.env.JWT_SECRET_KEY as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN as string,
  mongoUri: process.env.MONGO_URI as string,
}
