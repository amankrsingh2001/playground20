import { Label } from "@radix-ui/react-label";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

interface LoginProps{
    setIsLogin: (value: boolean) => void;
    isLogin:boolean
}

export default function Login({setIsLogin,isLogin }: LoginProps) {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-[90%] max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col justify-center items-center transition-all duration-300 hover:shadow-blue-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-6 text-center text-sm">
          Login to continue your journey.
        </p>

        <form className="w-full flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-gray-700 font-semibold">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="border-gray-300 focus:border-blue-400 py-2 px-1 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-gray-700 font-semibold">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-gray-300 focus:border-blue-400 py-2 px-1 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-sm text-blue-500 hover:underline font-medium"
            >
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg"
          >
            Log In
          </Button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Don’t have an account?{" "}
          <Button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 font-semibold hover:underline"
          >
            Sign up
          </Button>
        </p>
      </div>
    </div>
  );
}
