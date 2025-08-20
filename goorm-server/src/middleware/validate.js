export function validate(schema) {
  return (req, res, next) => {
    const data = ["GET", "DELETE"].includes(req.method) ? req.query : req.body
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
      return res.status(400).json({ error: "ValidationError", details: parsed.error.format() })
    }
    // 검증 통과 데이터는 req.valid에 담아 사용
    req.valid = parsed.data
    next()
  }
}
