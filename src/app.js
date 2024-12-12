import express from "express";
import cors from "cors";
const app = express();
import cookieParser from "cookie-parser";
import userRoutes from "./routes/adminPannelRoutes/user.routes.js";
import packageRoutes from "./routes/adminPannelRoutes/package.routes.js";
import payinRoutes from "./routes/adminPannelRoutes/payIn.routes.js";
import payOutRoutes from "./routes/adminPannelRoutes/payOut.routes.js";
import onFinished from 'on-finished';
import apiSwitchRoutes from "./routes/adminPannelRoutes/apiSwitch.routes.js";
import callBackRoutes from "./routes/adminPannelRoutes/callBack.routes.js";
import walletRoutes from "./routes/adminPannelRoutes/wallet.routes.js";
import utilityRoutes from "./routes/adminPannelRoutes/utility.routes.js";
import supportRoutes from "./routes/adminPannelRoutes/support.routes.js";
import ipWhiteListRoutes from "./routes/adminPannelRoutes/ipwhitelist.routes.js";
import userHandleUser from "./routes/userPannelRoutes/userHandleUser.routes.js";
import payInUserPannel from "./routes/userPannelRoutes/payInUser.routes.js";
import payOutUserPannel from "./routes/userPannelRoutes/payOutUser.routes.js";
import walletUserPannel from "./routes/userPannelRoutes/walletUser.routes.js";
import supportUserPannel from "./routes/userPannelRoutes/supportPannel.routes.js";
import callBackUrl from "./routes/userPannelRoutes/callBackUser.routes.js";
import { errors } from "celebrate";
import { ApiError } from "./utils/ApiError.js";
import ErrorMiddleware from "./middlewares/ErrorMiddleware.js";
import scheduleTask from "./utils/scheduleTask.js";
import Log from "./models/Logs.model.js";
import morgan from "morgan";

// for use body data
app.use(
    express.json({
        limit: "16kb",
    })
);

// auto schedule Task
scheduleTask();

morgan.token('custom', (req, res) => {
    return JSON.stringify({
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode || 500,
        requestBody: req.body,
        responseBody: res.body,
        timestamp: new Date().toISOString(),
    });
});

app.use((req, res, next) => {
    const originalSend = res.send;

    // Override res.send to capture the response body
    res.send = function (body) {
        res.body = body; // Store the response body in res.body
        return originalSend.call(this, body); // Call the original send method
    };

    next();
});

const postRequestLogger = morgan(':custom', {
    stream: {
        write: async (message) => {
            try {
                const logEntry = JSON.parse(message);
                await Log.create(logEntry);
            } catch (error) {
                console.error('Failed to save log:', error);
            }
        },
    },
});



app.use('/apiAdmin/v1/payin/', (req, res, next) => {
    if (req.method === 'POST') {
        postRequestLogger(req, res, next);
    } else {
        next();
    }
});

app.use('/apiAdmin/v1/payout/', (req, res, next) => {
    if (req.method === 'POST') {
        postRequestLogger(req, res, next);
    } else {
        next();
    }
});

app.use("/apiAdmin/v1/wallet/", (req, res, next) => {
    if (req.method === 'POST') {
        postRequestLogger(req, res, next);
    } else {
        next();
    }
})

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

// api support Route -- Admin
app.use("/apiAdmin/v1/support/", supportRoutes);


// api support Route -- Admin
app.use("/apiAdmin/v1/ipWhitelist/", ipWhiteListRoutes);

// api userHandle Route -- User
app.use("/apiUser/v1/userRoute/", userHandleUser);

// api payin Route -- User
app.use("/apiUser/v1/payin/", payInUserPannel);

// api payout Route -- User
app.use("/apiUser/v1/payout/", payOutUserPannel);

// api wallet Route -- User
app.use("/apiUser/v1/wallet/", walletUserPannel);

// api support Route -- User
app.use("/apiUser/v1/support/", supportUserPannel);

// api callbackurls Route -- User
app.use("/apiUser/v1/callBackUrl/", callBackUrl);

// api callbackurls Route -- User
app.all("*", (req, res, next) => {
    next(new ApiError(404, `Not Available Path ${req.baseUrl} !`))
});

// Joi Vaidator error middlewares setup
app.use(errors());

// Custom error middlewares setup
app.use(ErrorMiddleware);

export default app;