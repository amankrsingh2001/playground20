import { Router } from "express";
import { getUserDetails, loginUser, registerUser, sendOtp } from "../controller/userController";




const userRouter = Router()

userRouter.post('/signup', registerUser)
userRouter.post('/signin', loginUser)
userRouter.post('/verify', sendOtp)
userRouter.get("/userDetails", getUserDetails);

export {userRouter}