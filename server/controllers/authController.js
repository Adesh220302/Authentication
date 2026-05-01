import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';




export const register = async (req,res) =>  {
    const {name,email,password} = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({success:false,message:"All fields are required"});
    }

    try{

        const existingUser = await userModel.findOne({email});

        if(existingUser){
            return res.status(400).json({success:false,message:"User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({
            name,
            email,
            password:hashedPassword
        });

        await user.save();


        const token =jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict", 
            maxAge:7*24*60*60*1000
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Welcome to our app",
            text: `Hi ${user.name},\n\nThank you for registering on our app.\n\nBest regards,\nTeam`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully to:", user.email);
        } catch(emailError) {
            console.error("Email sending failed:", emailError.message);
        }

        return res.status(201).json({success:true,message:"User registered successfully"});

    }catch(error){

        return res.status(500).json({success:false,message:error.message});
    }
    

}


export const login = async (req,res) =>  {
    const {email,password} = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try{
        const user = await userModel.findOne({email});

        if(!user){
            return res.status(400).json({success:false,message:"Invalid email"});
        }

        const isPasswordMatch = await bcrypt.compare(password,user.password);

        if(!isPasswordMatch){
            return res.status(400).json({success:false,message:"Invalid password"});
        }

        const token =jwt.sign({id: user._id},process.env.JWT_SECRET,{expiresIn:"7d"});
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict", 
            maxAge:7*24*60*60*1000
        });


        return res.status(200).json({success:true,message:"User logged in successfully"});


    }catch(error){
        return res.status(500).json({success:false,message:error.message});
    }


}


export const logout =async (req,res) =>{

    try{
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict"
        });
        return res.status(200).json({success:true,message:"User logged out successfully"});

    }catch(error){
        return res.status(500).json({success:false,message:error.message});
    }
}


export const sendVerifyOtp = async(req,res) =>{

    try{

        const {userId} = req.body;

        const user = await userModel.findById(userId);

        if(!user){
            return res.status(400).json({success:false,message:"User not found"});
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: "Account already verified" });
        }

        const OTP = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOTP = OTP;
        user.verifyOTPExpirAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Hi ${user.name},\n\nYour OTP for account verification is: ${OTP}\n\nThis OTP is valid for 24 hours.\n\nBest regards,\nTeam`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("OTP email sent successfully to:", user.email);
        } catch(emailError) {
            console.error("OTP email sending failed:", emailError.message);
        }

        return res.status(200).json({success:true,message:"OTP sent to email successfully"});


    }catch(error){
        return res.status(500).json({success:false,message:error.message});
    }
}



export const verifyEmail = async(req,res) =>{

    const {userId,OTP} = req.body;

    if(!userId || !OTP){
        return res.status(400).json({success:false,message:"All fields are required"});
    }

    try{

        const user = await userModel.findById(userId);

        if(!user){
            return res.status(400).json({success:false,message:"User not found"});
        }   

        if (user.verifyOTP === '' || user.verifyOTP !== OTP || user.verifyOTPExpirAt < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }


        user.isAccountVerified = true;
        user.verifyOTP = '';
        user.verifyOTPExpirAt = 0;

        await user.save();

        return res.status(200).json({success:true,message:"Email verified successfully"});


    }catch(error){
        return res.status(500).json({success:false,message:error.message});
    }

}



export const isAuthenticated = async(req,res) =>{


    try{

        return res.status(200).json({success:true,message:"User is authenticated"});

    }catch(error){
        return res.status(500).json({success:false,message:error.message});
    }

}



export const sendResetPasswordOtp = async(req,res) =>{

    const {email} = req.body;

    if(!email){
        return res.status(400).json({success:false,message:"Email is required"});
    }

    try{

        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({success:false,message:"User not found"});
        }
        const OTP = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOTP = OTP;
        user.resetOTPExpirAt = Date.now() + 15  * 60 * 1000;    
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Hi ${user.name},\n\nYour OTP for password reset is: ${OTP}\n\nThis OTP is valid for 15 minutes.\n\nBest regards,\nTeam`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({success:true,message:"OTP sent to email successfully"});

        

    }catch(error){
        return res.status(500).json({success:false,message:error.message});
    }
}



export const resetPassword = async(req,res) =>{

    const {email,OTP,newPassword} = req.body;

    if(!email || !OTP || !newPassword){
            return res.status(400).json({success:false,message:"All fields email, newpassword and OTP are required"});
        };


    try{

        const user =await userModel.findOne({email});
        if(!user){
            return res.status(400).json({success:false,message:"User not found"});
        };

        if (user.resetOTP === '' || user.resetOTP !== OTP || user.resetOTPExpirAt < Date.now()) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        };

        const hashedPassword = await bcrypt.hash(newPassword,10);
        user.password = hashedPassword;
        user.resetOTP = '';
        user.resetOTPExpirAt = 0;

        await user.save();

        return res.status(200).json({success:true,message:"Password reset successfully"});
        


    }catch(error){
        return res.status(500).json({success:false,message:error.message});
    }

}