"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import ThemeChanger from "../compnents/Theme";
import Signup from "../compnents/Auth/Signup";
import { useState } from "react";
import Login from "../compnents/Auth/Login";

export default function Auth(login: boolean) {

  const [isLogin, setIsLogin] = useState<boolean>(false);

  return (
    <div className="w-screen h-screen flex">
        <div className="w-[45%]  bg-black text-amber-600">
            new content
        </div>

        <div className="w-[55%]  flex justify-center items-center">
            <div className="w-full h-full flex flex-col justify-center items-center">
                {isLogin ? <Login setIsLogin={setIsLogin} isLogin={isLogin}/> : <Signup setIsLogin={setIsLogin} isLogin={isLogin}/>}
                 
            </div>
        </div>
    </div>  
  );
}
