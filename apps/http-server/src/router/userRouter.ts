import { Router } from "express";
import { loginUser, registerUser } from "../controller/userController";




const userRouter = Router()

userRouter.post('/signup', registerUser)
userRouter.post('/signin', loginUser)
export {userRouter}