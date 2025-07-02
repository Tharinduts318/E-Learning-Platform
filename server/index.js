import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import cors from "cors";
import setupRoute from "./routes/setup.js";
import makeAdminRoute from "./routes/makeAdmin.js";
import courseRoute from "./routes/course.js";
import userRoute from "./routes/user.js";
import adminRoute from "./routes/admin.js";
import paymentRoute from "./routes/payment.js";
import stripeRoute from "./routes/stripe.js";

dotenv.config();

const app = express();

// using middlewares
app.use(express.json());
app.use(cors());
app.use(express.static("uploads")); // Add this line to serve uploaded files

// Add routes
app.use("/api/setup", setupRoute);
app.use("/api/admin", makeAdminRoute);
app.use("/api", courseRoute);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/stripe", stripeRoute);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});
