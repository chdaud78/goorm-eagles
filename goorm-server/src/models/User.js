import mongoose from "mongoose"
import argon2 from "argon2"

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" }
  },
  { timestamps: true }
)

// 비밀번호 설정/검증 헬퍼
userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await argon2.hash(plain, { type: argon2.argon2id })
}
userSchema.methods.verifyPassword = async function (plain) {
  return argon2.verify(this.passwordHash, plain)
}
userSchema.methods.toSafe = function () {
  const { _id, email, name, role, createdAt, updatedAt } = this;
  return { id: String(_id), email, name, role, createdAt, updatedAt };
};
export const User = mongoose.model("User", userSchema)
