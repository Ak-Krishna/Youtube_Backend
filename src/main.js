import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb", }));
app.use(express.urlencoded({limit: "16kb", }));
app.use(express.static('public'));
app.use(cookieParser())


export {main}
