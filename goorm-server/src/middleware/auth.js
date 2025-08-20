import { jwtVerify } from "jose"

export async function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || ""
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null
  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] })
    req.user = payload   // { sub, email, name }
    next()
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}
