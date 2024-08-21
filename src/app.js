import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import packageRoutes from "./routes/package.routes.js";
import payinRoutes from "./routes/payIn.routes.js";
import payOutRoutes from "./routes/payOut.routes.js";
import apiSwitchRoutes from "./routes/apiSwitch.routes.js";
import callBackRoutes from "./routes/callBack.routes.js";
import { errors } from "celebrate";

// for use body data
app.use(
    express.json({
        limit: "16kb",
    })
);

// for use urlencoded with different
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// for use static file serve
app.use(express.static("public"));

// for use secure cookies manuplation
app.use(cookieParser());

// api Route for user Setup
app.use("/api/v1/user/", userRoutes);

// api Route for package setup
app.use("/api/v1/package/", packageRoutes);

// api Route for Payin routes setup
app.use("/api/v1/payin/", payinRoutes);

// api Route for PayOut routes setup
app.use("/api/v1/payout/", payOutRoutes);

// api Switch Route for setup
app.use("/api/v1/apiswitch/", apiSwitchRoutes);

// api Switch Route for setup
app.use("/api/v1/callBack/", callBackRoutes);

// Joi Vaidator error middlewares setup
app.use(errors());

export default app;