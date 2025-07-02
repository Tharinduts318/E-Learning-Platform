import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  addLectures,
  createCourse,
  updateCourse,
  deleteCourse,
  deleteLecture,
  getAllStats,
  getAllUser,
  updateRole,
  deleteUser,
  toggleUserStatus,
} from "../controllers/admin.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

router.post("/course/new", isAuth, isAdmin, uploadFiles, createCourse);
router.post("/course/:id", isAuth, isAdmin, uploadFiles, addLectures);
router.put("/course/:id", isAuth, isAdmin, updateCourse);
router.delete("/course/:id", isAuth, isAdmin, deleteCourse);
router.delete("/lecture/:id", isAuth, isAdmin, deleteLecture);
router.get("/stats", isAuth, isAdmin, getAllStats);
router.get("/users", isAuth, isAdmin, getAllUser);
router.patch("/user/:id/status", isAuth, toggleUserStatus);
router.put("/user/:id", isAuth, updateRole);
router.delete("/user/:id", isAuth, deleteUser);

export default router;
