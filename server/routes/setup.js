import express from "express";
import { createAdmin } from "../controllers/setupAdmin.js";

const router = express.Router();

router.post("/create-admin", createAdmin);

export default router;
