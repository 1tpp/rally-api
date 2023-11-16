import * as mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    username: { type: String, unique: true, require },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    birthday: { type: Date, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export type User = mongoose.InferSchemaType<typeof userSchema>;
export const User = mongoose.model('user', userSchema);

