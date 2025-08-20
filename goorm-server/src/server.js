import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import morgan from "morgan"
import { connectDB } from "./db.js"
import authRoutes from "./routes/auth.js"
import meRoutes from "./routes/me.js"
import postRoutes from "./routes/posts.js"
import cookieParser from "cookie-parser"

const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(morgan("dev"))
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }))

app.use("/auth", authRoutes)
app.use("/", meRoutes)

app.get("/health", (_, res) => res.json({ ok: true }))

app.use("/posts", postRoutes)

app.use(cookieParser())

const port = process.env.PORT || 4000
connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`🚀 http://localhost:${port}`)))
  .catch((e) => {
    console.error("DB connect error", e)
    process.exit(1)
  })
