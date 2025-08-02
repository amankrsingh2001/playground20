import express from "express"
import { prismaClient } from "@repo/db"

const app = express()

app.post('/',async(req, res)=>{
    
    try {
        const user = await prismaClient.user.create({
            data:{
                fullName:"Aman",
                password:"Aman",
                email:"Aman12@gmail.com",
                profileImage:"string"
            }
        })
        res.send("Ho gya")
        return;
    } catch (error) {
        console.log(error)
    }
})

app.listen(8000,()=>{
    console.log('Working')
})
