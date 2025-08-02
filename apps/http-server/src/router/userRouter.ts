import { Router } from "express";
import { signUp } from "../controller/userController";


const userRouter = Router()

userRouter.post('/signup', signUp)

export {userRouter}