import { z } from 'zod';
import { ZodError } from "zod";
export declare const signUpValidation: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
    profileImage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    fullName: string;
    profileImage?: string | undefined;
}, {
    email: string;
    password: string;
    fullName: string;
    profileImage?: string | undefined;
}>;
export declare const loginValidation: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const formatZodErrors: (error: ZodError) => Record<string, string>;
//# sourceMappingURL=zod.d.ts.map