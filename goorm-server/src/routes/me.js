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

/** 간단 URL 유효성 검사 (http/https만 허용) */
function isValidHttpUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────
// 프로필 수정: name / bio / avatarUrl
router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const uid = getUserId(req);
    if (!isValidObjectId(uid)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const { name, bio, avatarUrl } = req.body || {};
    const $set = {};

    // name (선택) — 공백 제거 후 길이 1~50
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0 || name.trim().length > 50) {
        return res.status(400).json({ message: "Valid name (1~50 chars) required" });
      }
      $set.name = name.trim();
    }

    // bio (선택) — 문자열, 최대 1000자
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 1000) {
        return res.status(400).json({ message: "Valid bio (<= 1000 chars) required" });
      }
      $set.bio = bio;
    }

    // avatarUrl (선택) — http/https URL
    if (avatarUrl !== undefined) {
      if (avatarUrl !== "" && !isValidHttpUrl(avatarUrl)) {
        return res.status(400).json({ message: "Valid avatarUrl (http/https) required" });
      }
      $set.avatarUrl = avatarUrl;
    }

    if (Object.keys($set).length === 0) {
      return res.status(400).json({ message: "No updatable fields (name, bio, avatarUrl)" });
    }

    const user = await User.findByIdAndUpdate(uid, { $set }, { new: true });
    if (!user) return res.status(404).json({ message: "Not found" });

    res.json(user.toSafe());
  })
);

// ──────────────────────────────────────────────────────────────
// 비밀번호 변경 (프론트 호환용: PATCH /me/password)
const changePasswordHandler = asyncHandler(async (req, res) => {
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

  user.passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
  await user.save();

  res.json({ ok: true });
});

// 기존 엔드포인트 유지
router.post("/me/change-password", requireAuth, changePasswordHandler);
// 프론트 코드 호환(예: api.patch('/me/password', payload))
router.patch("/me/password", requireAuth, changePasswordHandler);

export default router;
