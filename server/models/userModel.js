import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    verifyOTP:{
        type:String,
        default:''
    },
    verifyOTPExpirAt:{
        type:Number,
        default:0
    },
    isAccountVerified:{
        type:Boolean,
        default:false
    },
    resetOTP:{
        type:String,
        default:''  
    },
    resetOTPExpirAt:{
        type:Number,
        default:0
    }
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;