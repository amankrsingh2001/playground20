import {Request, Response} from "express";
import { signUpValidation } from '@repo/zod';






export const signUp = async (req:Request, res:Response) =>{
    try {
        const userData = req.body
        const payloadParser = signUpValidation.safeParse(userData)
        if(!payloadParser.success){
            
        }

    } catch (error) {
        console.log(error)
    }
}