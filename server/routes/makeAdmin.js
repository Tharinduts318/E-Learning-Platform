import express from "express";
import { makeAdmin } from "../controllers/makeAdmin.js";

const router = express.Router();

router.post("/make-admin", makeAdmin);

export default router;
