import express from 'express';
import { hashPassword, comparePassword } from '../helpers/auth.js';
import User from '../models/user.js'
import jwt from 'jsonwebtoken';

import Order from '../models/order.js'
import {requireSignin} from '../middlewares/auth.js'

//to send email using email-js api
import emailjs from 'emailjs-com'
//import emailjs from 'email-js'

import dotenv from 'dotenv';
dotenv.config();



//const Sib = require('sib-api-v3-sdk')
import Sib from 'sib-api-v3-sdk'
//require('dotenv').config()
const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY

// const router =  express.Router();

// export const users = async(req, res) => {
//     res.json({
//         msg : 'the express server running',
//         srn : 24,
//         appno: 20,
//     })
// }



export const register = async(req, res) => {
    // console.log(req.body);

    try{


        // 1. destruct password, name, email from req.body

        const {name, email, password} = req.body;

        if(!name){
            return res.json({error : "Name is required"});
        }

        if(!email){
            return res.json({error : "Email is required"});
        }

        

        // 2. all fields requires password

        if(!password || password.length < 6){
            return res.json({error : "password should be of length atleast 6"});
        }

        // const existingUser = await User.findOne({email : email})
        


        // 3. check if email is taken or naot
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json({error: 'email is already taken'});
        }


        // 4. hash password

        const hashedPassword = await hashPassword(password);


        // 5. register user

        const user = await new User({name, email, password : hashedPassword}).save();

        // 6. jwt token implementation 

        const token = jwt.sign(
            {_id : user._id},                      //data
             process.env.JWT_SECRET,     //
            {expiresIn : '9d',
        });


        // 7. send response

        res.json({
            user : {
                name : user.name,
                email : user.email,
                role: user.role,
                address: user.address,
            }, token,
        });

        console.log(res);

        // const user = await new User(req.body).save();
        // user.save();
        // res.json(user);

    }
    catch(err){
        console.log("error =>" , err);
    }
}

//==================================================================
//==========All Admin
//=================================================================

export const allAdmin = async (req, res)=>{
    try{
        const admins = await User.find({role:1})
        return res.json(admins)
    }
    catch(err){
        console.log(err);
        return res.json(err);
    }
}

//==================================================================
//==========All Users
//=================================================================

export const users = async (req, res)=>{
    try{
        const users = await User.find({})
        return res.json(users)
    }
    catch(err){
        console.log(err);
        return res.json(err);
    }
}


//==================================================================
//==========Update Admin // complete later
//=================================================================

export const updateAdmin = async (req, res)=>{
    try{
        const admins = await User.find({role:1})
        return res.json(admins)
    }
    catch(err){
        console.log(err);
        return res.json(err);
    }
}




//==================================================================
//==========Admin update and Delete
//=================================================================


export const updateUser = async (req, res) => {
    try{

        //
        const {name, email, password, role, address} = req.body;

        if(!name){
            return res.json({error : "Name is required"});
        }

        if(!email){
            return res.json({error : "Email is required"});
        }

        

        // 2. all fields requires password

        if(!password || password.length < 6){
            return res.json({error : "password should be of length atleast 6"});
        }

        

        // const existingUser = await User.findOne({email : email})
        


        // 3. check if email is taken or naot
        // const existingUser = await User.findOne({email});
        // if(existingUser){
        //     return res.json({error: 'email is already taken'});
        // }


        // 4. hash password

        const hashedPassword = await hashPassword(password);


        const {userId} = req.params;
        const user = await User.findByIdAndUpdate(userId, {
            name,
            email,
            password : hashedPassword,
            role,
            address
        },

        {
            new: true,
        }
        );
        console.log(user);
        return res.json(user);

    }
    catch(err){
        console.log(err);
        return res.status(401).json(err);
    }
}


//===================Delete=========================

export const deleteUser = async (req, res) => {
    try{

        //

        const user = await User.findByIdAndDelete(req.params.userId);
        return res.json(user);

    }
    catch(err){
        console.log(err);
        return res.status(401).json(err);
    }
}

//==================================================================
//==========User Update and Delete
//==================================================================



//----========Login====----------


export const login = async(req, res) => {
    // console.log(req.body);

    try{


        // 1. destruct password, name, email from req.body

        const {email,password} = req.body;


        if(!email){
            return res.json({error : "Email is required"});
        }

        

        // 2. all fields requires password

        if(!password || password.length < 6){
            return res.json({error : "password should be of length atleast 6"});
        }


        // 3. check if email is taken or naot
        const user = await User.findOne({email});
        if(!user){
            return res.json({error: 'User not found!!'});
        }


        // 4. login user

        const match = await comparePassword(password, user.password);

        if(!match) {
            return res.json({error: 'Wrong Password!!'});
        }

        // 6. jwt token implementation 

        const token = jwt.sign(
            {_id : user._id},                      //data
             process.env.JWT_SECRET,     //
            {expiresIn : '9d',
        });


        // 7. send response

        res.json({
            user : {
                name : user.name,
                email : user.email,
                role: user.role,
                address: user.address,
            }, token,
        });

        console.log(res);

        // const user = await new User(req.body).save();
        // user.save();
        // res.json(user);

    }
    catch(err){
        console.log("error =>" , err);
    }
}


//update 

export const updateProfile = async(req, res) =>{
    try{
        //
        // console.log(req.body);
        // res.json("abc")
        const {name, password, address} = req.body;

        if(!name){
            return res.json({error : "Name is required"});
        }

        

        // 2. all fields requires password

        // if(!password || password.length < 6){
        //     return res.json({error : "password should be of length atleast 6"});
        // }

        const user = await User.findById(req.user._id);
        const hashed = password ? await hashPassword(password) : undefined;

        const updated = await User.findByIdAndUpdate(req.user._id,{
            name : name || user.name,
            password : hashed || user.password,
            address : address || user.address,
        }, {new : true});

        updated.password = undefined;
        return res.json(updated);

    }
    catch(err){
        console.log(err);
    }
}


//------------getOrders------------------

export const getOrders = async(req, res)=>{

    try{
        const orders = await Order.find({buyer:req.user._id}).populate('products').populate('buyer','name').sort({createdAt:-1});
        // const orders = await Order.find({buyer:req.user._id}).populate('products', '-photo').populate('buyer','name').sort({createdAt:-1});
        console.log("userId=>",req.user_id)
        console.log("userId=>",orders)
        return res.json(orders);
    }
    catch(err){
        console.log(err);
    }
}

// get all orders

export const getAllOrders = async(req, res)=>{

    try{
        const orders = await Order.find({}).populate('products').populate('buyer','name').sort({createdAt:-1});
        
        return res.json(orders);
    }
    catch(err){
        console.log(err);
    }
}

export const updateStatus = async(req, res)=>{

    try{
        const {orderId} = req.params;
        const {status} = req.body;
        const updatedData = await Order.findByIdAndUpdate(orderId, {status}, {new: true}).populate('buyer', 'email name');
        //const updatedData = await Order.updateOne('products').populate('buyer','name').sort({createdAt:-1});

        // console.log("email", updatedData.buyer.email)
        // console.log("name", updatedData.buyer.name)

        // const emailData = {
        //     from: process.env.EMAIL_FROM,
        //     to: updatedData.buyer.email,
        //     subject: "Order Status",
        //     html: `
        //             Hi ${updatedData.buyer.name} <br>, Your order status is : ${updatedData.status}.
        //             Please visit <a href="${process.env.CLIENT_URL}/dashboard/user/orders"> Your Dashboard </a> for more details
                    
        //             `
        // };

        // const template = {
        //     from_name: "from nsma e jjdjjdjjdj",
        //     to_name: "hhshhhhshshhshhs name",
        //     message: "Rajjjjj"
        // }

        
        //     emailjs.send(process.env.SERVICE_ID,process.env.TEMPLATE_ID,template,process.env.PUBLIC_KEY)
        //     .then(function(response){
        //         console.log("success")
        //     },
        //     function(error){
        //         console.log("error : ", error)
        //     })

        // const tranEmailApi = new Sib.TransactionalEmailsApi()
        // const sender = {
        //     email: process.env.EMAIL_FROM,
        //     name: process.env.SENDER,
        // }
        // const receivers = [
        //     {
        //         email: updatedData.buyer.email,
        //     },
        // ]



        // tranEmailApi
        // .sendTransacEmail({
        //     sender,
        //     to: receivers,
        //     subject: 'Order Status',
        //     textContent: `
        //     This email is from Bookrr to confirm your order status.
        //     `,
        //     htmlContent: `
        //     <h1 style={{fontSize:"30px", color:"blue"}}>Bookrr</h1>
        //     <p> Hi ${updatedData.buyer.name}, <br>Your order status is : ${updatedData.status}.</p>
        //     <p>Visit <a href="${process.env.CLIENT_URL}/dashboard/user/orders">Your Dashboard</a> for more info.</p>
        //             `
        // })
        // .then(console.log)
        // .catch(console.log)
        
        return res.json(updatedData);
    }
    catch(err){
        console.log(err);
    }
}


export const getOrderById = async(req, res)=>{

    try{
        const order = await Order.find(req.params._id).populate('-photo')
        console.log("id =>",req.params._id)
        
        return res.json(order);
    }
    catch(err){
        console.log(err);
    }

}

// export const photo = async (req, res) => {
//     try {
//       const product = await Product.findById(req.params.productId).select(
//         "photo"
//       );
//       if (product.photo.data) {
//         res.set("Content-Type", product.photo.contentType);
//         return res.send(product.photo.data);
//       }
//     } catch (err) {
//       console.log(err);
//       return res.status(401).json(err);
//     }
// };



//------------------secret controller------------

export const secret = async(req, res) =>{
    res.json({
        currentuser : req.user,
    })
}

//----------------admin test conroller-------------

// export const admin = async(req, res) =>{
//     res.json({
//         currentuser : req.user,
//     })
// }


//-----------------category create-------------



//-------------------========== test for /detail route =========-----------------------

export const detail = async(req, res) =>{
    res.json({
        user: 'ransherraj',
        password: '12345',
    })
}

export const test = async(req, res) =>{
    res.json({
        data: 'data',
        id : '1',
    })
}