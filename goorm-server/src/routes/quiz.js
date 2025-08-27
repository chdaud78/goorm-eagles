import express from "express";
import {Category} from "../models/Category.js";
import {Quiz} from "../models/Quiz.js";
import {QuizAttempt} from "../models/QuizAttempt.js";
import mongoose from "mongoose";
import {requireAuth} from "../middleware/auth.js";

const router = express.Router()

/* =========================
          카테고리
========================= */

// 등록
router.post("/category", async (req, res) => {
  try {
    const { name, description } = req.body
    const exists = await Category.findOne({ name })
    if (exists) return res.status(409).json({ error: "Category already exists" })

    const category = await Category.create({ name, description })
    res.status(201).json(category)
  } catch (e) {
    res.status(500).json({ error: "Server error" })
  }
})

// 조회
router.get("/categories", async (req, res) => {
    const categories = await Category.find()
    if (!categories) return res.status(404).json({ message: "Not found" });
    res.json(categories)
})

/* =========================
          퀴즈
========================= */

// 퀴즈 생성
router.post("/quiz", async (req, res) => {
  try {
    const { category, type, context, answer, options, maxScore } = req.body

    const quiz = await Quiz.create({
      category,
      type,
      context,
      answer : type === "subjective" ? answer : undefined,
      options : type === "multiple" ? options : [],
      maxScore : maxScore || 10,
    })

    res.status(201).json(quiz)
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: "Server error" })
  }
})

// 카테고리 내 랜덤 퀴즈 제공
router.get("/quiz/random/:categoryId", async (req, res) => {
  const { categoryId } = req.params
  const { userId } = req.user

  const attempts = await QuizAttempt.find({ user: userId }).select("quiz")
  const attemptedIds = attempts.map(a => a.quiz.toString())

  const quiz = await Quiz.aggregate([
    { $match: { category: new mongoose.Types.ObjectId(categoryId), _id: { $nin: attemptedIds.map(id => new mongoose.Types.ObjectId(id)) } } },
    { $sample: { size: 1 } }
  ])

  res.json(quiz[0] || null)
})

/* =========================
          유저 통계
========================= */
router.get("/user/stats", requireAuth,async (req, res) => {
  try {
    const userId  = req.user.sub
    console.log(req.user)
    if (!userId) return res.status(401).json({ error: "Unauthorized" })

    const attempts = await QuizAttempt.find({ user: userId })
    const totalAttempts = attempts.length
    const correct = attempts.filter(a => a.isCorrect).length
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0)
    const avgCorrectRate = totalAttempts > 0 ? (correct / totalAttempts) * 100 : 0

    res.json({
      totalAttempts,
      correct,
      totalScore,
      avgCorrectRate,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Server error" })
  }
})

export default router