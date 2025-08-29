import express from "express"
import { z } from "zod"
import { requireAuth } from "../middleware/auth.js"
import { Post } from "../models/Post.js"

const router = express.Router()

// ===== 스키마 =====
const CreateSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().max(10_000).optional().default(""),
  tags: z.array(z.string().trim().min(1)).max(20).optional().default([])
})

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(10_000).optional(),
  tags: z.array(z.string().trim().min(1)).max(20).optional()
})

const ListQuerySchema = z.object({
  q: z.string().max(200).optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10)
})

// ===== 유틸 =====
function ownerGuard(userId, doc) {
  return doc.author?.toString?.() === userId
}

// ===== Create =====
router.post("/", requireAuth, async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() })
  }

  const post = await Post.create({
    ...parsed.data,
    author: req.user.sub
  })
  res.status(201).json({ post })
})

// ===== Read (단건) =====
router.get("/:id", async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).lean()
  if (!post) return res.status(404).json({ error: "NotFound" })
  res.json({ post })
})

// ===== List (검색/페이지네이션) =====
router.get("/", async (req, res) => {
  const parsed = ListQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() })
  }

  const { q, tag, page, limit } = parsed.data
  const filter = { isDeleted: false }
  if (q) filter.$text = { $search: q }
  if (tag) filter.tags = tag

  try {
    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })   // ✅ 문제 있던 부분 수정 (NaN 제거)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Post.countDocuments(filter)
    ])

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    console.error("[GET /posts] error:", err)
    res.status(500).json({ error: "InternalServerError" })
  }
})

// ===== Update =====
router.patch("/:id", requireAuth, async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() })
  }

  const post = await Post.findById(req.params.id)
  if (!post || post.isDeleted) return res.status(404).json({ error: "NotFound" })
  if (!ownerGuard(req.user.sub, post)) return res.status(403).json({ error: "Forbidden" })

  Object.assign(post, parsed.data)
  await post.save()
  res.json({ post })
})

// ===== Soft Delete =====
router.delete("/:id", requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post || post.isDeleted) return res.status(404).json({ error: "NotFound" })
  if (!ownerGuard(req.user.sub, post)) return res.status(403).json({ error: "Forbidden" })

  post.isDeleted = true
  await post.save()
  res.json({ ok: true })
})

export default router
