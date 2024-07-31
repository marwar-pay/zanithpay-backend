import dotenv from "dotenv";
import connectionDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: "./env",
  });

console.log(process.env.MONGODB_URI)

  connectionDB().then(()=>{
    app.listen(process.env.SERVER_PORT,()=>{
        console.log(`Server Running At PORT:${process.env.SERVER_PORT}`);
    })
  }).catch((error)=>{
    console.log("some issue on database connection",error)
  })