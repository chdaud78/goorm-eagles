import mongoose from "mongoose"
import argon2 from "argon2"

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    
    // 추가된 필드
    bio: { type: String, default: "" },                // 자기소개
    avatarUrl: { type: String, default: "" },          // 아바타 이미지 URL

    role: { type: String, default: "user" },           // 기본 권한 (옵션)
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
  const { _id, email, name, role, bio, avatarUrl, createdAt, updatedAt } = this;
  return { id: String(_id), email, name, role, bio, avatarUrl, createdAt, updatedAt };
};
export const User = mongoose.model("User", userSchema)
