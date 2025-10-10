
import { Input } from "@repo/ui/input";
import { CardDemo } from "../CardDemo";
import { Label } from "@repo/ui/label";
import { Button } from '@repo/ui/button';
import { useForm } from "react-hook-form";


interface SignupProps{
    setIsLogin: (value: boolean) => void;
    isLogin:boolean
}
interface IFormInput {
    email:string,
    password:string,
    fullName: string,
    username:string

}

export default function Signup({setIsLogin, isLogin}: SignupProps) {
    
 const { register, handleSubmit } = useForm<IFormInput>()

    const onSubmit = (data: IFormInput) => {
        
    }
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-[90%] max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col justify-center items-center transition-all duration-300 hover:shadow-blue-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Account</h1>
        <p className="text-gray-500 mb-6 text-center text-sm">
          Join us today! It only takes a few minutes.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-gray-700 font-semibold">
              Email Address
            </Label>
            <Input
                {...register("email", { required: true })}
              id="email"
              type="email"
              placeholder="your@email.com"
              className="border-gray-300 focus:border-blue-400 py-2 px-2 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-gray-700 font-semibold">
              Password
            </Label>
            <Input
            {...register("password", {required:true})}
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-gray-300 focus:border-blue-400 py-2 px-2  focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-gray-700 font-semibold">
              Full Name
            </Label>
            <Input
            {...register("fullName", {required:true})}
              id="name"
              type="text"
              placeholder="John Doe"
              className="border-gray-300 focus:border-blue-400 py-2 px-2 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
           {/* User Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-gray-700 font-semibold">
              UserName
            </Label>
            <Input
            {...register("username", {required:true})}
              id="username"
              type="text"
              placeholder="John Doe"
              className="border-gray-300 focus:border-blue-400 py-2 px-2 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
          >
            Sign Up
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <Button
            onClick={()=>setIsLogin(!isLogin)}
            className="text-blue-500 font-semibold hover:underline"
          >
            Log in
          </Button>
        </p>
      </div>
    </div>
  );
}