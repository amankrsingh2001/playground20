
import { ApiError } from "./ApiError"
import nodemailer from "nodemailer"



export const sendMail = async(email:string, title:string, body:string)=>{
    try {   
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        })
            let info = await transporter.sendMail({
            from:'Playground- by Aman Singh',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        })
        return {success:true,data:info}
    } catch (error) {
        return {success:false,data:error}
    }
}

