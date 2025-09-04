import { Router } from "express";
import { userRouter } from "./userRouter";


const mainRouter:Router = Router()

mainRouter.use('/user', userRouter)

export {mainRouter}