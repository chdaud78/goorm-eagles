import express from "express";
import {Category} from "../models/Category.js";

const router = express.Router()

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

router.get("/categories", async (req, res) => {
    const categories = await Category.find()
    if (!categories) return res.status(404).json({ message: "Not found" });
    res.json(categories)
})

export default router