import { cn } from "../src/utils/ui";


export default function Input(className:string){
    return <div className={cn(`bg-orange-500`, className)}>
        <input/>
        </div>
}