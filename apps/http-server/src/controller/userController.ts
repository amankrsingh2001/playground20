import {Request, Response} from "express";
import { formatZodErrors, loginValidation, signUpValidation } from '@repo/zod';
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import {prismaClient} from "@repo/db"
import bcrypt from "bcrypt"
import { Apireponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken"


export const registerUser = asyncHandler(async(req:Request, res:Response)=>{
    const userData = req.body;
    const {success, error} = signUpValidation.safeParse(userData)

    if(!success && error){
        const formatedErrors = formatZodErrors(error)
        console.log(formatedErrors)
      throw new ApiError(400, "validation failed", formatedErrors);
    }
    // Find if user is existing
    const user = await prismaClient.user.findFirst({
        where:{
            email:userData.email
        }
    })

    // Throw error if user already exist
    if(user && user.id){
        throw new ApiError(409,"Email Already registered")
    }

    // hash password if we are creating new account
    const salRound = 10;
    const hashPassword = await bcrypt.hash(userData.password, salRound) 


    // Create new user
    const newUser = await prismaClient.user.create({
        data:{
            email:userData.email,
            password:hashPassword,
            fullName:userData.fullName,
            profileImage:userData.profileImage || `https://api.dicebear.com/5.x/initials/svg?seed=${userData.fullName} `
        }
    })

    // Check if user is created or not 
    if(!newUser || !newUser.id){
        throw new ApiError(500,"Failed to create Account")
    }

    // Send success if user is created

    return res.status(201).json(
       new Apireponse(200, {}, "Account created Successfully", true)
    )

})

export const loginUser = asyncHandler(async(req:Request, res:Response)=>{
    const data = req.body;

    const payloadParser = loginValidation.safeParse(data)

      if(!payloadParser.success && payloadParser.error){
        const formatedErrors = formatZodErrors(payloadParser.error)
        console.log(formatedErrors)
        throw new ApiError(400, "validation failed", formatedErrors);
    }

    const {email, password} = payloadParser.data
    

    const exitingUser = await prismaClient.user.findFirst({
        where:{
            email:email
        }
    })

    if(!exitingUser || !exitingUser.id){
        throw new ApiError(404, "User not found", {message:"Please register first"})
    }

    // compare password using bcrypt

    const comparePassword = bcrypt.compare(password, exitingUser.password)
    if(!comparePassword){
        throw new ApiError(401, "Invalid credentials",{message:"Credentials isn't valid"})
    }

    // JWT token for authentication
    const token = jwt.sign({ id:exitingUser.id }, process.env.JWT_SECRET as string, {
        expiresIn:"12h"
    })

    // sanitizing sensitive fileds
    delete (exitingUser as any).password


   return res.status(201).cookie("playground_auth_token", token).json(
       new Apireponse(200, exitingUser , "Account created Successfully", true)
    )


})

export const sendOtp = asyncHandler(async(req:Request, res:Response)=>{
    
})