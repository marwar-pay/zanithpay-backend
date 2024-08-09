import express from "express";
import { getUser, addUser, registerUser, loginUser, logOut, getSingleUser, updateUser } from "../controllers/user.controller.js";
import { celebrate, Joi } from "celebrate";
import { userVerify } from "../middlewares/userAuth.js";
const router = express.Router();

router.get("/getUsers",userVerify, getUser);

router.get("/userProfile/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().required(),
    })
}),userVerify, getSingleUser);

router.post("/addUser", celebrate({
    body: Joi.object({
        userName: Joi.string().required(),
        memberId: Joi.string().required(),
        memberType: Joi.string().valid("Admin", "SuperAdmin", "ApiUser", "MasterDistributor", "Distributor", "Retailer", "Users").required(),
        fullName: Joi.string().required(),
        email: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        password: Joi.string().required(),
        payInApi: Joi.string().required(),
        payOutApi: Joi.string().required(),
        trxPassword: Joi.string().required(),
        package: Joi.string().required(),
        addresh: Joi.object({
            country: Joi.string().required(),
            state: Joi.string().required(),
            city: Joi.string().required(),
            addresh: Joi.string().required(),
            pincode: Joi.number().required()
        }),
        minWalletBalance: Joi.number().required(),
        walletBalance: Joi.number().required(),
        isActive: Joi.boolean().required(),
    })
}),userVerify, addUser)

router.post("/updateUser/:id", celebrate({
    body: Joi.object({
        userName: Joi.string().optional(),
        memberId: Joi.string().optional(),
        memberType: Joi.string().valid("Admin", "SuperAdmin", "ApiUser", "MasterDistributor", "Distributor", "Retailer", "Users").optional(),
        fullName: Joi.string().optional(),
        email: Joi.string().optional(),
        mobileNumber: Joi.string().optional(),
        password: Joi.string().optional(),
        payInApi: Joi.string().optional(),
        payOutApi: Joi.string().optional(),
        trxPassword: Joi.string().optional(),
        addresh: Joi.string().optional(),
        package: Joi.object({
            country: Joi.string().optional(),
            state: Joi.string().optional(),
            city: Joi.string().optional(),
            addresh: Joi.string().optional()
        }),
        minWalletBalance: Joi.string().optional(),
        walletBalance: Joi.string().optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().required(),
    })
}), userVerify,updateUser)

router.post("/login", celebrate({
    body: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    })
}), loginUser)

router.post("/register", celebrate({
    body: Joi.object({
        userName: Joi.string().required(),
        memberId: Joi.string().required(),
        memberType: Joi.string().required(),
        fullName: Joi.string().required(),
        email: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        password: Joi.string().required(),
        trxPassword: Joi.string().required(),
        addresh: Joi.string().required(),
        package: Joi.object({
            country: Joi.string().required(),
            state: Joi.string().required(),
            city: Joi.string().required(),
            addresh: Joi.string().required()
        }),
        minWalletBalance: Joi.string().required(),
        walletBalance: Joi.string().required(),
        isActive: Joi.string().required(),
    })
}), registerUser)

router.get("/logout", logOut)

export default router;