import dotenv from "dotenv";
import { dbconnect } from "./db/dbconnect.js";
import app from './app.js'

dotenv.config({
  path: "../.env",
});

const port = process.env.PORT || 3000;

//database connection
dbconnect()
  .then(() => {
    app.listen(port, () => {
        console.log("app running")
    });
  })
  .catch((error)=>{
    console.log('app crash due to Err',error.message)
  });
