import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import userDB from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const userVerify = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await userDB.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export const userAuthAdmin = asyncHandler((req, res, next) => {
    const isAdmin = req.user?.memberType
    try {    
        if (isAdmin === "SuperAdmin" || isAdmin === "Admin") {
            next();
        } else {
            return res.status(401).json({ message: "User have not Right to Access the Resource" });
        }
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access to Resource");
    }
});

