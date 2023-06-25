import jwt  from "jsonwebtoken";
import User from "../models/user.js";


export const requireSignin = (req, res, next)=>{

    // console.log("REQUIRED HEADERS => ", req.headers);

    try{
        const decoded = jwt.verify(
            req.headers.authorization,
            process.env.JWT_SECRET
        );
        
        // console.log('Decoded => ',decoded);

        req.user = decoded;
        next();

    }
    catch(err){
        // console.log('Error=>', err);
        return res.status(401).json(err);
    }
    
}

export const isAdmin = async(req, res, next)=>{
    // console.log("REQUIRED HEADERS => ", req.headers);
    try{
        const user = await User.findById(req.user._id);
        if(user.role !== 1){
            // return res.status(401).send('unauthorised');
            return res.status(401).json(req.user);
        }
        else{
            next();
        }
    }
    catch(err){
        return res.status(401).json(err);
    }
    
}

