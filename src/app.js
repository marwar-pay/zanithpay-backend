import express from "express";
import cors from "cors";
const app = express();
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import packageRoutes from "./routes/package.routes.js";
import payinRoutes from "./routes/payIn.routes.js";
import payOutRoutes from "./routes/payOut.routes.js";
import apiSwitchRoutes from "./routes/apiSwitch.routes.js";
import callBackRoutes from "./routes/callBack.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import utilityRoutes from "./routes/utility.routes.js";
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

// api Route for user
app.use("/api/v1/user/", userRoutes);

// api Route for package
app.use("/api/v1/package/", packageRoutes);

// api Route for Payin
app.use("/api/v1/payin/", payinRoutes);

// api Route for PayOut 
app.use("/api/v1/payout/", payOutRoutes);

// api Switch Route
app.use("/api/v1/apiswitch/", apiSwitchRoutes);

// api callback Route
app.use("/api/v1/callBack/", callBackRoutes);

// api wallet Route
app.use("/api/v1/wallet/", walletRoutes);

// api utility Route
app.use("/api/v1/utility/", utilityRoutes);

// Joi Vaidator error middlewares setup
app.use(errors());

export default app;