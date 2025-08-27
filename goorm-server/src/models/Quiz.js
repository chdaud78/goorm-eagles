import mongoose from "mongoose"

const quizSchema = new mongoose.Schema(
  {
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true},
    type: {type: String, enum: ["subjective", "multiple"], required: true},
    context: {type: String, required: true},
    answer: {type:String},
    options: [{text: String, isCorrect: Boolean}],
    maxScore: {type:Number, default: 10},
  }, {timestamps: true}
)

export const Quiz = mongoose.model("Quiz", quizSchema)