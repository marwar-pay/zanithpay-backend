import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import userDB from "../models/user.model.js";
import ipWhiteListDB from "../models/ipWhiteList.model.js"

export const apiValidate = asyncHandler(async (req, res, next) => {
    try {
        // const clientId = req.headers['x-client-id'];  // Get client ID from request header (or other method)
        // const clientIp = req.ip || req.connection.remoteAddress;
        // const formattedIp = clientIp.includes('::ffff:') ? clientIp.split(':').pop() : clientIp;

        // let user = await userDB.aggregate([{ $match: { $and: [{ userName: userName }, { trxAuthToken: authToken }, { isActive: true }] } }])

        // if (user.length === 0) {
        //     return res.status(400).json({ message: "Failed", data: "Invalid User or InActive user Please Try again !" })
        // }

        next()

        // let ipWhiteListGet = await ipWhiteListDB.aggregate([$match:{}])

        // Check if clientId exists and IP is in the whitelist
        // if (clientIpWhitelist[clientId] && clientIpWhitelist[clientId].includes(formattedIp)) {
        //     next();  // Allow request
        // } else {
        //     res.status(403).json({ error: 'Access denied. Your IP is not whitelisted.' });
        // }

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});