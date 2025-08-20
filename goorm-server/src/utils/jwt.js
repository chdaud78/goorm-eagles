import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

const alg = "HS256";
const defaultExp = process.env.JWT_EXPIRES || "15m";

export async function signAccessToken(payload, expiresIn = defaultExp) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encoder.encode(process.env.JWT_SECRET));
}

export async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, encoder.encode(process.env.JWT_SECRET));
  return payload;
}
