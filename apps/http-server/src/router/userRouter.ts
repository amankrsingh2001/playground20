import { Router } from "express";
import { loginUser, registerUser, sendOtp } from "../controller/userController";




const userRouter = Router()

userRouter.post('/signup', registerUser)
userRouter.post('/signin', loginUser)
userRouter.post('/verify', sendOtp)
export {userRouter}