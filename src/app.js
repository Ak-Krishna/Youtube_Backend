import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//all middleware used here
app.use(express.json({ limit: "16kb", }));
app.use(express.urlencoded({limit: "16kb", }));
app.use(express.static('public'));
app.use(cookieParser())

//import routes middlwware
import router from './routes/user.route.js'

//declared routes
app.use('/api/v1/users',router)




export default app
