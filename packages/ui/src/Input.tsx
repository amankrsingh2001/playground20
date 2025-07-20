import { cn } from "../src/utils/ui";
import { InputProps } from '@repo/interface';


export default function Input({className}:{className?:InputProps}){
    return <div className={cn(`bg-orange-500`, className)}>
        <input/>
        </div>
}