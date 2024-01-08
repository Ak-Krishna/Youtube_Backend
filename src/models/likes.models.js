import mongoose,{Schema} from "mongoose";

const likesSchema=new Schema({
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comments"
    },
    likeBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweets"
    }
},{timestamps:true})

export const Likes=mongoose.model("likes",likesSchema);