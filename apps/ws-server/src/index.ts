import { WebSocket, WebSocketServer } from "ws";
import { redisClient } from "@repo/redis";

const wss = new WebSocketServer({port:8080})

export async function checkRedis(){
    await redisClient.set("foo", "bar");
}   


wss.on('connection', function connection(ws, request){
    ws.on('message',(message)=>{
        const parsedMessage = JSON.parse(message.toString())
        console.log(parsedMessage)
        ws.send(JSON.stringify(parsedMessage))
    })
})