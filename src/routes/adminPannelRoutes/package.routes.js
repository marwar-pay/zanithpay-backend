import express from "express";
import { addPackage, addPayInPackage, addPayOutPackage, deletePackage, deletePayInPackage, deletePayOutPackage, getPackage, getPayInPackage, getPayOutPackage, getSinglePackage, getSinglePayInPackage, getSinglePayOutPackage, updatePackage, updatePayInPackage, updatePayOutPackage } from "../../controllers/adminPannelControllers/package.controller.js";
import { userVerify } from "../../middlewares/userAuth.js";
const router = express.Router();
import { celebrate, Joi } from "celebrate";

const payoutCharge = Joi.object().keys({
    lowerLimit: Joi.number().required(),
    upperLimit: Joi.number().required(),
    chargeType: Joi.string().valid("Flat", "Percentage").required(),
    charge: Joi.number().required(),
})

const payInCharge = Joi.object().keys({
    lowerLimit: Joi.number().required(),
    upperLimit: Joi.number().required(),
    chargeType: Joi.string().valid("Flat", "Percentage").required(),
    charge: Joi.number().required(),
})

router.get("/allPackage", userVerify, getPackage);

router.get("/getSinglePackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, getSinglePackage);

router.post("/addPackage", celebrate({
    body: Joi.object({
        packageName: Joi.string().required(),
        packageInfo: Joi.string().optional(),
        packagePayOutCharge: Joi.string().trim().length(24).required(),
        packagePayInCharge: Joi.string().trim().length(24).required(),
        isActive: Joi.boolean().optional(),
    })
}), userVerify, addPackage);

router.post("/updatePackage/:id", celebrate({
    body: Joi.object({
        packageName: Joi.string().optional(),
        packageInfo: Joi.string().optional(),
        packagePayOutCharge: Joi.string().trim().length(24).optional(),
        packagePayInCharge: Joi.string().trim().length(24).optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updatePackage);

router.delete("/deletePackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, deletePackage);

router.get("/getPayInPackage", userVerify, getPayInPackage);

router.get("/getSinglePayInPackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, getSinglePayInPackage);

router.post("/addPayInPackage", celebrate({
    body: Joi.object({
        payInPackageName: Joi.string().required(),
        payInChargeRange: Joi.array().items(payInCharge).required(),
        isActive: Joi.boolean().default(true),
    })
}), userVerify, addPayInPackage);

router.post("/deletePayInPackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, deletePayInPackage);

router.post("/updatePayInPackage/:id", celebrate({
    body: Joi.object({
        payInPackageName: Joi.string().optional(),
        payInChargeRange: Joi.array().items(payInCharge).optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updatePayInPackage);

router.get("/getPayOutPackage", userVerify, getPayOutPackage);

router.get("/getSinglePayOutPackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, getSinglePayOutPackage);

router.post("/addPayOutPackage", celebrate({
    body: Joi.object({
        payOutPackageName: Joi.string().required(),
        payOutChargeRange: Joi.array().items(payoutCharge).required(),
        isActive: Joi.boolean().default(true),
    })
}), userVerify, addPayOutPackage);

router.post("/deletePayOutPackage/:id", celebrate({
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, deletePayOutPackage);

router.post("/updatePayOutPackage/:id", celebrate({
    body: Joi.object({
        payOutPackageName: Joi.string().optional(),
        payOutChargeRange: Joi.array().items(payoutCharge).optional(),
        isActive: Joi.boolean().optional(),
    }),
    params: Joi.object({
        id: Joi.string().trim().length(24).required(),
    })
}), userVerify, updatePayOutPackage);

export default router;