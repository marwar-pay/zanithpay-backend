import dotenv from "dotenv";
import connectionDB from "./db/index.js";

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("uncaughtException Accured ! Shutting Down Server !");
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("unhandledRejection Accured ! Shutting Down Server !");
  process.exit(1);
});

import app from "./app.js";

dotenv.config({
  path: "./env",
});

console.log(process.env.MONGODB_URI)

connectionDB().then(() => {
  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server Running At PORT:${process.env.SERVER_PORT}`);
  })
}).catch((error) => {
  console.log("some issue on database connection", error)
})