import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./models/User.js";
import { connectDb } from "./database/db.js";
import dotenv from "dotenv";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDb();
    
    const email = "tharinduts531v@gmail.com";
    const password = "12345678";
    const name = "Super Admin";
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log("User already exists, updating to superadmin...");
      existingUser.role = "admin";
      existingUser.mainrole = "superadmin";
      await existingUser.save();
      console.log("User updated to superadmin successfully!");
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      
      await User.create({
        name,
        email,
        password: hashPassword,
        role: "admin",
        mainrole: "superadmin"
      });
      
      console.log("Superadmin created successfully!");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating superadmin:", error);
    process.exit(1);
  }
};

createSuperAdmin();