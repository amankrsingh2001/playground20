import {z} from 'zod'

export const signUpValidation = z.object({
    email:z.string().email(),
    password:z.string().min(8,{message:"Password length cannot be less than 8"}).max(20,{message:"Password length cannot be more than 20"}),
    fullName:z.string(),
    profileImage:z.string().optional()
})

