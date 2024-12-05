import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import userDB from "../models/user.model.js";
import ipWhiteListDB from "../models/ipWhiteList.model.js"

export const apiValidate = asyncHandler(async (req, res, next) => {
    try {
        const clientId = req.headers['x-client-id'];  // Get client ID from request header (or other method)
        const clientIp = req.ip || req.connection.remoteAddress;
        const formattedIp = clientIp.includes('::ffff:') ? clientIp.split(':').pop() : clientIp;

        let user = await userDB.aggregate([{ $match: { $and: [{ userName: req?.body?.userName }, { trxAuthToken: req?.body?.authToken }, { isActive: true }] } }])

        if (user.length === 0) {
            return res.status(400).json({ message: "Failed", data: "Invalid User or InActive user Please Try again !" })
        }

        let getUserIpList = await ipWhiteListDB.findOne({ memberId: user[0]._id });

        if (!getUserIpList) {
            return res.status(400).json({ message: "Failed", data: `Please required IP Whitelist Your Current IP : ${formattedIp}` })
        }

        if (getUserIpList?.ipUserDev === "*") {
            next()
        }
        else if (getUserIpList?.ipUser === formattedIp || getUserIpList?.ipUserDev === formattedIp) {
            next()
        }

        return res.status(400).json({ message: "Failed", data: `Please required IP Whitelist Your Current IP : ${formattedIp}` })
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Request !");
    }
});