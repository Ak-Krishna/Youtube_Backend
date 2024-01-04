import dotenv from 'dotenv'
import mongoose from 'mongoose'
import {DB_NAME} from '../constants.js'


dotenv.config({
    path:'.././.env'
});
export const dbconnect=async()=>{
    try {
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
       console.log('\n database connected successfully :',connectionInstance.connection.host);

    } catch (error) {
        console.log('Database Connection Failed ERR : ',error)
    }
}