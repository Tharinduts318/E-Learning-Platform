import express from "express";
import {
  getAllCourses,
  getSingleCourse,
  fetchLectures,
  fetchLecture,
  getMyCourses,
  checkout,
  paymentVerification,
} from "../controllers/course.js";
import { createCourse } from "../controllers/admin.js";
import { isAuth, isAdmin } from "../middlewares/isAuth.js";
import { uploadFiles } from "../middlewares/multer.js";

const router = express.Router();

router.post("/course/new", isAuth, isAdmin, uploadFiles, createCourse);
// Course listing routes
router.get("/course/all", getAllCourses);
router.get("/course/:id", getSingleCourse);
router.get("/mycourse", isAuth, getMyCourses);

// Course content routes
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/lecture/:id", isAuth, fetchLecture);

// Payment routes
router.post("/course/checkout/:id", isAuth, checkout);
router.post("/verification/:id", isAuth, paymentVerification);

export default router;
