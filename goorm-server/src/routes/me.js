import express from "express"
import { requireAuth } from "../middleware/auth.js"

const router = express.Router()

router.get("/me", requireAuth, async (req, res) => {
  // req.user = { sub: userId, email, name }
  res.json({ user: req.user })
})

export default router
