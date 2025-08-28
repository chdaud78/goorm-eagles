import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  quizIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }], // 랜덤으로 뽑힌 10문제
  currentIndex: { type: Number, default: 0 }, // 현재 문제 위치
  attempts: [{
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
    isCorrect: Boolean,
    score: Number,
    timeTaken: Number
  }],
  finished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

export const QuizSession = mongoose.model("QuizSession", quizSessionSchema)