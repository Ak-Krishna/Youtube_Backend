import { Jwt } from "jsonwebtoken";
import {User} from "../models/user.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJwt=asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(403,"Unauthorized request")
        }
        const decodeToken=Jwt.verify(token,process.env.ACCESS)
        
    } catch (error) {
        throw new ApiError(403,error?.message|| "invalid access token")
    }

})