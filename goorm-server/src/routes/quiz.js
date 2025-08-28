import express from "express";
import {Category} from "../models/Category.js";
import {Quiz} from "../models/Quiz.js";
import {QuizAttempt} from "../models/QuizAttempt.js";
import mongoose from "mongoose";
import {requireAuth} from "../middleware/auth.js";
import {QuizSession} from "../models/QuizSession.js";

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

// 퀴즈 시작
router.post("/quiz/session/start", requireAuth, async (req, res) => {
  try {
    const {categoryId} = req.body;
    const {sub: userId} = req.user;

    // 카테고리 내 문제 10개 랜덤 추출
    const quizzes = await Quiz.aggregate([
      {$match: {category: new mongoose.Types.ObjectId(categoryId)}},
      {$sample: {size: 10}}
    ]);

    const session = await QuizSession.create({
      user: userId,
      category: categoryId,
      quizIds: quizzes.map(q => q._id)
    });

    res.status(201).json(session);
  }
  catch (e) {
      console.log(e)
      res.status(500).json({ error: "Server error" })
  }
});

// 퀴즈 세션 가져오기
router.get("/quiz/session/:sessionId", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sub: userId } = req.user;

    const session = await QuizSession.findOne({ _id: sessionId, user: userId })
    .populate("quizIds"); // quizIds가 Quiz ObjectId 배열이라 populate해서 문제 정보 가져오기

    if (!session) return res.status(404).json({ error: "Session not found" });

    res.json({
      _id: session._id,
      category: session.category,
      quizzes: session.quizIds,
      createdAt: session.createdAt,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 다음 문제
router.get("/quiz/session/:sessionId/next", requireAuth, async (req, res) => {
  const { sessionId } = req.params;
  const session = await QuizSession.findById(sessionId).populate("quizIds");

  if (!session || session.finished) return res.json(null);

  const quiz = session.quizIds[session.currentIndex];
  res.json(quiz);
});

// 퀴즈 제출
router.post("/quiz/session/:sessionId/submit", requireAuth, async (req, res) => {
  const { sessionId } = req.params;
  const { answer, timeTaken } = req.body;
  const { sub: userId } = req.user;

  const session = await QuizSession.findById(sessionId).populate("quizIds");
  if (!session || session.finished) return res.status(400).json({ error: "Invalid session" });

  const quiz = session.quizIds[session.currentIndex];
  let isCorrect = false;

  if (quiz.type === "subjective") {
    isCorrect = answer.trim().toLowerCase() === quiz.answer.trim().toLowerCase();
  } else if (quiz.type === "multiple") {
    const correctIds = quiz.options
    .filter(o => o.isCorrect)
    .map(o => o._id.toString());

    // answer는 문자열 배열이어야 함
    const answerIds = answer.map(a => a.toString());

    // 순서 상관없이 비교
    isCorrect =
      correctIds.length === answerIds.length &&
      correctIds.every((id) => answerIds.includes(id));
  }
  const score = isCorrect ? quiz.maxScore : 0;
  // 1️⃣ 세션 기록
  session.attempts.push({
    quiz: quiz._id,
    isCorrect,
    score,
    timeTaken, // 시간 저장
  });
  session.currentIndex += 1;
  if (session.currentIndex >= session.quizIds.length) session.finished = true;
  await session.save();

  // 2️⃣ QuizAttempt 컬렉션에도 저장
  await QuizAttempt.create({
    user: userId,
    quiz: quiz._id,
    isCorrect,
    score,
    timeTaken,
    session: sessionId, // 선택사항: 어떤 세션에서 푼 건지
  });


  res.json({ quiz, isCorrect, score, finished: session.finished });
});

// 퀴즈 결과 가져오기
router.get("/quiz/session/:sessionId/result", requireAuth, async (req, res) => {
  const { sessionId } = req.params;
  const session = await QuizSession.findById(sessionId).populate("quizIds");

  if (!session || !session.finished) return res.status(400).json({ error: "Session not finished" });

  const totalScore = session.attempts.reduce((sum, a) => sum + a.score, 0);
  const correct = session.attempts.filter(a => a.isCorrect).length;
  const totalTime = session.attempts.reduce((sum, a) => sum + a.timeTaken, 0);

  res.json({ totalScore, correct, totalTime, attempts: session.attempts });
});

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