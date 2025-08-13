export class Apireponse {
    public statusCode:number
    public data:any
    public message:string
    public success:boolean

    constructor(statusCode:number, data:any, message="success", success:boolean){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = success
    }
}