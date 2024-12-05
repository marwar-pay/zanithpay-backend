import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import requestIp from "request-ip";
import userDB from "../models/user.model.js";
import ipWhiteListDB from "../models/ipWhiteList.model.js"

export const apiValidate = asyncHandler(async (req, res, next) => {
    try {
        const clientIp = requestIp.getClientIp(req);
        let user = await userDB.aggregate([{ $match: { $and: [{ userName: req?.body?.userName }, { trxAuthToken: req?.body?.authToken }, { isActive: true }] } }])
        if (user.length === 0) {
            return res.status(400).json({ message: "Failed", data: "Invalid User or InActive user Please Try again !" })
        }

        let getUserIpList = await ipWhiteListDB.findOne({ memberId: user[0]._id });

        if (!getUserIpList) {
            return res.status(400).json({ message: "Failed", data: `Please required IP Whitelist Your Current IP : ${clientIp}` })
        }
        if (getUserIpList?.ipUserDev == "*") {
            next()
        }
        else if (getUserIpList?.ipUser == clientIp || getUserIpList?.ipUserDev == clientIp) {
            next()
        } else {
            return res.status(400).json({ message: "Failed", data: `Please required IP Whitelist Your Current IP : ${clientIp}` })
        }

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Request !");
    }
});