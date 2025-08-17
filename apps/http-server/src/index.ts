import express from "express"
import cookieParser from "cookie-parser"
import { mainRouter } from "./router/mainRouter"
import { errorHandler } from "./middleware/errorHandler"
import checkAuth from "./middleware/auth";
const app = express();


app.use(express.json())
app.use(cookieParser())

app.use(checkAuth);


app.use('/api/v1', mainRouter)


app.use(errorHandler)

app.listen(8000,()=>{
    console.log('Working')
})
