import { User } from "../models/User.js";
import TryCatch from "../middlewares/TryCatch.js";

export const makeAdmin = TryCatch(async (req, res) => {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    user.role = "admin";
    user.mainrole = "admin";
    await user.save();

    res.status(200).json({
        message: "User role updated to admin successfully",
    });
});
