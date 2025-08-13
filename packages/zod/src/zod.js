"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatZodErrors = exports.loginValidation = exports.signUpValidation = void 0;
const zod_1 = require("zod");
exports.signUpValidation = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8, { message: "Password length cannot be less than 8" }).max(20, { message: "Password length cannot be more than 20" }),
    fullName: zod_1.z.string(),
    profileImage: zod_1.z.string().optional()
});
exports.loginValidation = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
const formatZodErrors = (error) => {
    const formattedErrors = {};
    error.issues.forEach(issue => {
        const field = issue.path[0]; // top-level only
        if (typeof field === "string" && !formattedErrors[field]) {
            formattedErrors[field] = issue.message;
        }
    });
    return formattedErrors;
};
exports.formatZodErrors = formatZodErrors;
