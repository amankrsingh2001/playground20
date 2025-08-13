import {z} from 'zod'
import { ZodError } from "zod";

export const signUpValidation = z.object({
    email:z.string().email(),
    password:z.string().min(8,{message:"Password length cannot be less than 8"}).max(20,{message:"Password length cannot be more than 20"}),
    fullName:z.string(),
    profileImage:z.string().optional()
})


export const loginValidation = z.object({
    email:z.string().email(),
    password:z.string()
})

export const formatZodErrors = (error: ZodError) => {
  const formattedErrors: Record<string, string> = {};

  error.issues.forEach(issue => {
    const field = issue.path[0]; // top-level only
    if (typeof field === "string" && !formattedErrors[field]) {
      formattedErrors[field] = issue.message;
    }
  });

  return formattedErrors;
};
