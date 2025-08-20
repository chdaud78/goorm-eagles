import mongoose from "mongoose"

const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    tokenId: { type: String, unique: true, index: true, required: true }, // jti
    revoked: { type: Boolean, default: false, index: true },
    replacedBy: { type: String, default: null }, // 새 jti
    expiresAt: { type: Date, required: true, index: true },
    ua: { type: String, default: "" },      // (선택) User-Agent 추적
    ip: { type: String, default: "" }       // (선택) IP 추적
  },
  { timestamps: true }
)

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)
