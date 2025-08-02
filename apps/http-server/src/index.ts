import express from "express"
import cookieParser from "cookie-parser"
import { mainRouter } from "./router/mainRouter"
const app = express()


app.use(express.json())
app.use(cookieParser())


app.use('/api/v1', mainRouter)

app.listen(8000,()=>{
    console.log('Working')
})
