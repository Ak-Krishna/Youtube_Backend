import dotenv from 'dotenv'
import {dbconnect} from './db/dbconnect.js'
import  express from 'express';

dotenv.config({
    path:'../.env'
})

const app=express();
const port=process.env.PORT || 3000;

app.get(port,(req,res)=>{
    res.send('Hello express backend is working');
    console.log(port)
})

app.listen(process.env.PORT,()=>{
    console.log('app is listening  on port :', `localhost:${process.env.PORT}`)
})


dbconnect();