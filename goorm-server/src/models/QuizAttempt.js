import mongoose from "mongoose"

const quizAttemptSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  isCorrect: { type: Boolean, required: true },
  score: { type: Number, required: true },
  timeTaken: { type: Number, default: 0 }, // 초 단위
  createdAt: { type: Date, default: Date.now }
})

export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema)