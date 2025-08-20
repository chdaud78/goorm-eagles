import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },
    tags: { type: [String], default: [], index: true }, // 간단 검색용
    isDeleted: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
)

// 가벼운 텍스트 검색 인덱스(옵션)
postSchema.index({ title: "text", body: "text" })

export const Post = mongoose.model("Post", postSchema)
