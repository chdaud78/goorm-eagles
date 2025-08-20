export function setRefreshCookie(res, token) {
  res.cookie("rt", token, {
    httpOnly: true,
    sameSite: "lax",                   // SPA면 'lax', 크로스도메인 쿠키면 'none' + secure 필요
    secure: process.env.COOKIE_SECURE === "true",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 서버 만료와 일치(대략)
  })
}
export function clearRefreshCookie(res) {
  res.clearCookie("rt", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/auth/refresh",
  })
}
