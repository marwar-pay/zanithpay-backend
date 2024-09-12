import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import userDB from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const userPannelAuth = asyncHandler(async (req, res, next) => {
    try {
        const userToken = req.cookies?.accessTokenUser || req.header("Authorization")?.replace("Bearer ", "")
        if (!userToken) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET);

        const user = await userDB.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        if(user?.memberType!=="Users"){
            throw new ApiError(404, error?.message || "User Not Right Access !");
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});