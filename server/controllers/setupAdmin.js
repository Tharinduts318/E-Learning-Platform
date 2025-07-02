import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import TryCatch from "../middlewares/TryCatch.js";

export const createAdmin = TryCatch(async (req, res) => {
    const { email, password, name } = req.body;
    
    // Check if admin already exists
    let admin = await User.findOne({ email });
    
    if (admin) {
        return res.status(400).json({
            message: "Admin already exists",
        });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    admin = await User.create({
        name,
        email,
        password: hashPassword,
        role: "admin",
        mainrole: "admin"
    });

    res.status(201).json({
        message: "Admin created successfully",
    });
});
