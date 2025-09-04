import { Router } from "express";
import { AuthController} from "../controller/userController";




const userRouter:Router = Router()

userRouter.post('/signup', AuthController.register)
userRouter.post('/signin', AuthController.login)
userRouter.post('/verify', AuthController.sendOtp)
userRouter.get("/userDetails", AuthController.getCurrentUser);

export {userRouter}