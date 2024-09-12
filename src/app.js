import express from "express";
import cors from "cors";
const app = express();
import cookieParser from "cookie-parser";
import userRoutes from "./routes/adminPannelRoutes/user.routes.js";
import packageRoutes from "./routes/adminPannelRoutes/package.routes.js";
import payinRoutes from "./routes/adminPannelRoutes/payIn.routes.js";
import payOutRoutes from "./routes/adminPannelRoutes/payOut.routes.js";
import apiSwitchRoutes from "./routes/adminPannelRoutes/apiSwitch.routes.js";
import callBackRoutes from "./routes/adminPannelRoutes/callBack.routes.js";
import walletRoutes from "./routes/adminPannelRoutes/wallet.routes.js";
import utilityRoutes from "./routes/adminPannelRoutes/utility.routes.js";
import userHandleUser from "./routes/userPannelRoutes/userHandleUser.routes.js";
import payInUserPannel from "./routes/userPannelRoutes/payInUser.routes.js";
import payOutUserPannel from "./routes/userPannelRoutes/payOutUser.routes.js";
import walletUserPannel from "./routes/userPannelRoutes/walletUser.routes.js";
import { errors } from "celebrate";

// for use body data
app.use(
    express.json({
        limit: "16kb",
    })
);

const corsOptions = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
};

// Use CORS middleware
app.use(cors(corsOptions));

// for use urlencoded with different
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// for use static file serve
app.use(express.static("public"));

// for use secure cookies manuplation
app.use(cookieParser());

// api Route for user -- Admin
app.use("/apiAdmin/v1/user/", userRoutes);

// api Route for package -- Admin
app.use("/apiAdmin/v1/package/", packageRoutes);

// api Route for Payin -- Admin
app.use("/apiAdmin/v1/payin/", payinRoutes);

// api Route for PayOut -- Admin
app.use("/apiAdmin/v1/payout/", payOutRoutes);

// api Switch Route -- Admin
app.use("/apiAdmin/v1/apiswitch/", apiSwitchRoutes);

// api callback Route -- Admin
app.use("/apiAdmin/v1/callBack/", callBackRoutes);

// api wallet Route -- Admin
app.use("/apiAdmin/v1/wallet/", walletRoutes);

// api utility Route -- Admin
app.use("/apiAdmin/v1/utility/", utilityRoutes);

// api userHandle Route -- User
app.use("/apiUser/v1/userRoute/", userHandleUser);

// api payin Route -- User
app.use("/apiUser/v1/payin/", payInUserPannel);

// api payin Route -- User
app.use("/apiUser/v1/payout/", payOutUserPannel);

// api payin Route -- User
app.use("/apiUser/v1/wallet/", walletUserPannel);

// Joi Vaidator error middlewares setup
app.use(errors());

export default app;