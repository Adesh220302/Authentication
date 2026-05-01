import jwt from "jsonwebtoken";


const userAuth  = async (req,res,next) => {

    const {token} = req.cookies;   
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized login again" });
    }   

    try{
        const tookenDecode = jwt.verify (token,process.env.JWT_SECRET);

        if (tookenDecode.id){
            if (!req.body) {
                req.body = {};
            }
            req.body.userId = tookenDecode.id;
            next();
        }else{
            return res.status(401).json({ success: false, message: "Unauthorized login again" });
        }

    }catch(error){
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

}


export default userAuth;