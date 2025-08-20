import express from "express"
import { SignJWT } from "jose"
import { User } from "../models/User.js"
import { RefreshToken } from "../models/RefreshToken.js"
import { signAccess, signRefresh, newId, verify } from "../lib/tokens.js"
import { setRefreshCookie, clearRefreshCookie } from "../middleware/cookies.js"

const router = express.Router()

// 회원가입
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: "email & password required" })

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ error: "Email already in use" })

    const user = new User({ email, name })
    await user.setPassword(password)
    await user.save()
    return res.status(201).json(user.toSafe());
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// 로그인: Access(Bearer) + Refresh(HttpOnly 쿠키)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const payload = { sub: String(user._id), email: user.email, name: user.name }
    const accessToken = await signAccess(payload)

    // refresh token + 저장
    const jti = newId()
    const refreshToken = await signRefresh(payload, jti)
    await RefreshToken.create({
      user: user._id,
      tokenId: jti,
      expiresAt: new Date(Date.now() + ms(process.env.JWT_REFRESH_EXPIRES || "7d")),
      ua: req.headers["user-agent"] || "",
      ip: req.ip
    })
    setRefreshCookie(res, refreshToken)

    return res.json({ token: accessToken,  user: user.toSafe() })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: "Server error" })
  }
})

// 토큰 재발급(회전): rt 쿠키 → 검증 → 기존 jti revoke → 새 rt 발급
router.post("/refresh", async (req, res) => {
  const token = req.cookies?.rt
  if (!token) return res.status(401).json({ error: "No refresh token" })
  try {
    const payload = await verify(token) // { sub, email, name, jti, iat, exp }
    const record = await RefreshToken.findOne({ tokenId: payload.jti })
    if (!record || record.revoked) return res.status(401).json({ error: "Refresh revoked" })

    // 회전: 이전 토큰 취소
    record.revoked = true
    const newJti = newId()
    record.replacedBy = newJti
    await record.save()

    // 새 토큰들 발급
    const userPayload = { sub: payload.sub, email: payload.email, name: payload.name }
    const accessToken = await signAccess(userPayload)
    const newRefreshToken = await signRefresh(userPayload, newJti)
    await RefreshToken.create({
      user: payload.sub,
      tokenId: newJti,
      expiresAt: new Date(Date.now() + ms(process.env.JWT_REFRESH_EXPIRES || "7d")),
      ua: req.headers["user-agent"] || "",
      ip: req.ip
    })

    setRefreshCookie(res, newRefreshToken)
    return res.json({ token: accessToken })
  } catch (e) {
    return res.status(401).json({ error: "Invalid/expired refresh" })
  }
})

// 로그아웃: 현 세션의 refresh revoke + 쿠키 삭제
router.post("/logout", async (req, res) => {
  const token = req.cookies?.rt
  if (token) {
    try {
      const payload = await verify(token)
      await RefreshToken.updateOne({ tokenId: payload.jti }, { $set: { revoked: true } })
    } catch {}
  }
  clearRefreshCookie(res)
  res.json({ ok: true })
})

// 유틸: "1h" → ms
function ms(s) {
  // 매우 간단한 파서(분/시/일)
  const n = parseInt(s, 10)
  if (s.endsWith("m")) return n * 60 * 1000
  if (s.endsWith("h")) return n * 60 * 60 * 1000
  if (s.endsWith("d")) return n * 24 * 60 * 60 * 1000
  return n
}


export default router