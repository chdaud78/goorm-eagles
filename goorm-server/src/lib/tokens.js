import { SignJWT, jwtVerify } from "jose"
import crypto from "node:crypto"

const enc = (s) => new TextEncoder().encode(s)

const accessExp = process.env.JWT_ACCESS_EXPIRES || "15m"
const refreshExp = process.env.JWT_REFRESH_EXPIRES || "7d"

export function newId() {
  return crypto.randomUUID()
}

export async function signAccess(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(accessExp)
    .sign(enc(process.env.JWT_SECRET))
}

export async function signRefresh(payload, jti) {
  return await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(refreshExp)
    .sign(enc(process.env.JWT_SECRET))
}

export async function verify(token) {
  const { payload } = await jwtVerify(token, enc(process.env.JWT_SECRET), { algorithms: ["HS256"] })
  return payload
}
