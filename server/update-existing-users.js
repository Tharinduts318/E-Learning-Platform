import mongoose from "mongoose";
import { User } from "./models/User.js";
import { connectDb } from "./database/db.js";
import dotenv from "dotenv";

dotenv.config();

const updateExistingUsers = async () => {
  try {
    await connectDb();
    
    // Update all existing users to have isActive: true if the field doesn't exist
    const result = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} users with isActive field`);
    
    // Also check current users
    const users = await User.find({}, 'name email isActive');
    console.log('Current users:', users);
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating users:", error);
    process.exit(1);
  }
};

updateExistingUsers();