"use client"

import axios from "axios"

export default function Page() {

  const onClickLoginHandler = async () => {
    const user = {
      email: "amankrsingh121212@gmail.com",
      password: "Amankrsingh",


    }

    const hitSignUp = await axios.get('http://localhost:8000/api/v1/user/userDetails',{
        withCredentials:true
    });
    console.log(hitSignUp)

  }


  return (
    <div>
      <div onClick={() => onClickLoginHandler()}>Click to login</div>
    </div>
  );
}
