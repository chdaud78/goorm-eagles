// src/routes/me.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import argon2 from "argon2";
import mongoose from "mongoose";

const router = Router();

/** req.user에서 사용자 ID 추출 (id 또는 sub 모두 대응) */
function getUserId(req) {
  return req.user?.id || req.user?.sub;
}

/** Mongo ObjectId 유효성 검사 (잘못된 값으로 인한 CastError 방지) */
function isValidObjectId(id) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

// 내 정보 조회
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const uid = getUserId(req);
    if (!isValidObjectId(uid)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ message: "Not found" });

    res.json(user.toSafe());
  })
);

// 프로필 수정
router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const uid = getUserId(req);
    if (!isValidObjectId(uid)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { name } = req.body || {};
    // (선택) 간단 검증
    if (typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ message: "Valid name required" });
    }

    const user = await User.findByIdAndUpdate(
      uid,
      { $set: { name: name.trim() } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Not found" });

    res.json(user.toSafe());
  })
);

// 비밀번호 변경
router.post(
  "/me/change-password",
  requireAuth,
  asyncHandler(async (req, res) => {
    const uid = getUserId(req);
    if (!isValidObjectId(uid)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "currentPassword & newPassword required" });
    }

    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ message: "Not found" });

    const ok = await argon2.verify(user.passwordHash, currentPassword);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    user.passwordHash = await argon2.hash(newPassword);
    await user.save();

    res.json({ ok: true });
  })
);

export default router;
