// controllers/AuthController.ts

import { Request, Response } from "express";
import {
  formatZodErrors,
  loginValidation,
  signUpValidation,
  mailDataValidation,
} from "@repo/zod";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import { prismaClient, User } from "@repo/db";
import bcrypt from "bcrypt";
import { Apireponse } from "../utils/ApiResponse";
import { sendMail } from "../utils/mailSender";
import otpGenerator from "otp-generator";
import { session, redis } from "@repo/redis";
import { v4 as uuidv4 } from "uuid";
import { UserInfo } from "@repo/types";


// Request body interfaces
interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
  profileImage?: string;
  username: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface MailBody {
  email: string;
}

interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  profileImage?: string;
  accessToken: string;
}

interface ResetPasswordBody {
  email: string;
  otp: string;
  newPassword: string;
}

export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const userData = req.body;

    // Validate input
    const { success, error } = signUpValidation.safeParse(userData);
    if (!success) {
      const formattedErrors = formatZodErrors(error!);
      throw new ApiError(400, "Validation failed", formattedErrors);
    }

    // Check if user already exists
    const existingUser = await prismaClient.user.findFirst({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ApiError(409, "Email already registered");
    }

    // Check if username already exists
    const existingUsername = await prismaClient.user.findUnique({
      where: { username: userData.username }
    });

    if (existingUsername) {
      throw new ApiError(409, "username already taken");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const user = await prismaClient.user.create({
      data: {
        id: uuidv4(),
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        username: userData.username,
        profileImage:
          userData.profileImage ||
          `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(
            userData.fullName
          )}`,
      },
    });

    if (!user.id) {
      throw new ApiError(500, "Failed to create account");
    }

    return res
      .status(201)
      .json(new Apireponse(201, {}, "Account created successfully", true));
  });

  /**
   * Login user and create Redis session
   */
  static login = asyncHandler(async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;
    const context = req.context || {};

    // Validate input
    const result = loginValidation.safeParse({ email, password });
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      throw new ApiError(400, "Validation failed", errors);
    }

    // Find user
    const user = await prismaClient.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // ❌ Bug fix: bcrypt.compare(password, hash), not (hash, password)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Prepare session metadata
    const metaData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      deviceId: context.deviceId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };

    // Create Redis session token
    const accessToken = await session.create(user.id, metaData);

    // Set secure cookie
    res.cookie("session-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    const userResponse: UserResponse = {
      id: user.id,
      accessToken,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage || undefined,
    };

    return res
      .status(200)
      .json(new Apireponse(200, userResponse, "Login successful", true));
  });

  /**
   * Send OTP to email
   */
  static sendOtp = asyncHandler(async (req: Request<{}, {}, MailBody>, res: Response) => {
    const { email } = req.body;

    const result = mailDataValidation.safeParse({ email });
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      throw new ApiError(400, "Validation failed", errors);
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const mailResult = await sendMail(email, "Playground OTP", otp);
      if (mailResult.success) {
        // In real app: store OTP in Redis with expiry
        return res
          .status(200)
          .json(new Apireponse(200, { otpSent: true }, "OTP sent successfully", true));
      }

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    throw new ApiError(500, "Failed to send OTP after multiple attempts");
  });

  /**
   * Get current logged-in user
   */
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = req.auth as UserInfo;
    console.log("🚀 ~ AuthController ~ user:", user)
    if (!user) {
      throw new ApiError(401, "Not authenticated");
    }

    // Optional: fetch fresh user data from DB
    // const dbUser = await prismaClient.user.findUnique({
    //   where: { id: user.id },
    //   select: {
    //     id: true,
    //     fullName: true,
    //     email: true,
    //     profileImage: true,
    //   },
    // });

    // if (!dbUser) {
    //   throw new ApiError(404, "User not found");
    // }

    return res
      .status(200)
      .json(new Apireponse(200, {}, "User details retrieved", true));
  });


  /**
 * Logout user by destroying Redis session
 */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies["session-token"] || req.headers.authorization?.split(" ")[1];

    if (token) {
      try {
        await session.destroy(token); // Destroy Redis session
      } catch (err) {
        // Ignore if session doesn't exist
      }
    }

    res.clearCookie("session-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res
      .status(200)
      .json(new Apireponse(200, {}, "Logged out successfully", true));
  });

  static forgotPassword = asyncHandler(async (req: Request<{}, {}, MailBody>, res: Response) => {
    const { email } = req.body;

    const result = mailDataValidation.safeParse({ email });
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      throw new ApiError(400, "Validation failed", errors);
    }

    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return res
        .status(200)
        .json(new Apireponse(200, {}, "If email exists, reset link was sent", true));
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await redis.set(`reset_otp:${email}`, otp, 600); // 10 min expiry

    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const mailResult = await sendMail(
        email,
        "Password Reset",
        `Your password reset OTP is: ${otp}`
      );
      if (mailResult.success) {
        break;
      }
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    return res
      .status(200)
      .json(new Apireponse(200, {}, "Password reset OTP sent", true));
  });
}