const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth')
const User = require('../models/user.model')
const getError = require("../utils/dbErrorHandler");
const nodemailer = require("nodemailer");
const CryptoJS  = require('crypto-js');
// import generateToken from '../utils/generateJWT.js'

const sendResetPasswordMail = async(name,email,token) => {
    try {
        
        const transporter = nodemailer.createTransport({
            host : 'smtp.gmail.com',
            port : 587,
            secure : false,
            requireTLS : true,
            auth:{
                user : process.env.EMAIL,
                pass : process.env.PASSWORD
            }
        })

        const mailOptions = {
            from : process.env.EMAIL,
            to: email,
            subject : "Reset Password",
            html : '<p> Hello' + name + 'Please copy the link <a href="http://127.0.0.1:3000/api/forget-password?token='+token+'"> & reset the password! </a>'
        }

        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error)
            }else{
                console.log("Mail has been sent!",info.response)
            }
        })

    } catch (error) {
        res.status(400).send({success:false,message:error.message});
    }
}

module.exports = {

    loginUser : async(req,res) => {
        try {
            const user_data = await User.findByCredentials(req.body.email,req.body.password);
            const token = await user_data.generateAuthToken()
            return res.status(200).json({
                error : false,
                user: user_data,
                token : token,                
            })
        } catch (error) {
            let errMsg = getError(error)
            return res.status(400).json({
                error: true,
                message:  errMsg.length > 0 ? errMsg : "Something went wrong"
            })
        }
    },

    logoutUser : async(req,res)=>{
        try {
            req.user.tokens = req.user.tokens.filter((token) => {
                return token.token !== req.token
            })
            await req.user.save()
            return res.status(200).json({
                error : false,
                message: "User loggedout successfully"
            })
        } catch (e) {
            let errMsg = getError(error)
            return res.status(400).json({
                error: true,
                message:  errMsg.length > 0 ? errMsg : "Something went wrong"
            })
        }
    },

    registerUser : async (req ,res) => {
        try {            
            const {name,email,password} = req.body;
            const user_data = User({                    
                name : name,
                email : email,
                password : password,
            })
            
            const userExists = await User.findOne({email});

            if(userExists){
                res.status(400)
                throw new Error("User alredy Exists")
            }

            await user_data.save();
            const token = await user_data.generateAuthToken()
            return res.status(200).json({
                error : false,
                message : "User Created Successfully",     
                token: token               
            });

        } catch (error) {
            console.log(error )
            let errMsg = getError(error)
            return res.status(400).json({
                error: true,
                message:  errMsg.length > 0 ? errMsg : "Could not create User."
            })

        }
    },

    forgotpassword : async (req ,res) => {
        try {
            const user_email = req.body.email;
            const user_data = await User.findOne({email:user_email});                       

            if(!user_data){
                return res.status(200).json({
                    error : false,
                    message : "Email does not exist"                    
                });
            }

            const generateToken = CryptoJS.lib.WordArray.random(32);
            sendResetPasswordMail(process.env.EMAIL,process.env.PASSWORD,generateToken)
                        
            return res.status(200).json({
                error: false,
                message:  "Email has been sent!"
            })
            
        } catch (error) {
            let errMsg = getError(error)
            return res.status(400).json({
                error: true,
                message:  errMsg.length > 0 ? errMsg : "Could not execute this method"
            })

        }
    }

}
