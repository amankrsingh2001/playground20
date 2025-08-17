import { Request, Response } from "express";
import {
  formatZodErrors,
  loginValidation,
  signUpValidation,
  mailDataValidation,
} from "@repo/zod";
import { asyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import { prismaClient } from "@repo/db";
import bcrypt from "bcrypt";
import { Apireponse } from "../utils/ApiResponse";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/mailSender";
import otpGenerator from "otp-generator";

import { UUID } from "uuidjs";
import { redisClient } from '@repo/redis';

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userData = req.body;
    const { success, error } = signUpValidation.safeParse(userData);

    if (!success && error) {
      const formatedErrors = formatZodErrors(error);
      console.log(formatedErrors);
      throw new ApiError(400, "validation failed", formatedErrors);
    }
    // Find if user is existing
    const user = await prismaClient.user.findFirst({
      where: {
        email: userData.email,
      },
    });

    // Throw error if user already exist
    if (user && user.id) {
      throw new ApiError(409, "Email Already registered");
    }

    // hash password if we are creating new account
    const salRound = 10;
    const hashPassword = await bcrypt.hash(userData.password, salRound);

    // Create new user
    const newUser = await prismaClient.user.create({
      data: {
        email: userData.email,
        password: hashPassword,
        fullName: userData.fullName,
        profileImage:
          userData.profileImage ||
          `https://api.dicebear.com/5.x/initials/svg?seed=${userData.fullName} `,
      },
    });

    // Check if user is created or not
    if (!newUser || !newUser.id) {
      throw new ApiError(500, "Failed to create Account");
    }

    // Send success if user is created

    return res
      .status(201)
      .json(new Apireponse(200, {}, "Account created Successfully", true));
  }
);

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;

  // Validating incoming data
  const payloadParser = loginValidation.safeParse(data);

  // If the incoming data isn't valid sending the error
  if (!payloadParser.success && payloadParser.error) {
    const formatedErrors = formatZodErrors(payloadParser.error);
    console.log(formatedErrors);
    throw new ApiError(400, "validation failed", formatedErrors);
  }

  // Fetching the user from the db
  const getFirstUser = await prismaClient.user.findFirst({
    where: {
      email: payloadParser.data.email,
    },
  });

  if (!getFirstUser?.email || !getFirstUser?.password) {
    throw new ApiError(400, "Password not found", {
      reason:
        "This account does not have a password set (possible social login)",
    });
  }
  const validatePassword = bcrypt.compare(
    getFirstUser?.password,
    payloadParser.data.password
  );

  // Throw error if password isn't valid
  if(!validatePassword){
    throw new ApiError(401,"Credentails ins't valid")
  }

  // creating the JWT token
  const sessionToken = jwt.sign({id:getFirstUser.id}, process.env.JWT_SECRET as string,{
    expiresIn:"24h"
  })

    // creating randomAuthToken 
    const uuid = UUID.generate();
    const accessToken = uuid.split('-').join('')

    // Save all the data in the redis DB for faster access
    const {password, ...userWihoutPassword} = getFirstUser
    const redisDataObj = {
        sessionToken,
        user:userWihoutPassword
    }
    await redisClient.set(`user:${accessToken}`,JSON.stringify(redisDataObj), "EX", 7 * 24 * 60 * 60)

    res.status(200).cookie('accessToken', accessToken).json(new Apireponse(200, userWihoutPassword.id, "Login Successfully", true));
});


export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const payloadParser = mailDataValidation.safeParse(data);

  // Checking validation for the mail Sending data

  if (!payloadParser.success && payloadParser.error) {
    const formatedErrors = formatZodErrors(payloadParser.error);
    console.log(formatedErrors);
    throw new ApiError(400, "validation failed", formatedErrors);
  }

  // Creating the six digit otp for sending it to the user

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  // trying to send the mail for 3 consecutive times
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const result = await sendMail(
      payloadParser.data.email,
      "Playground Email",
      otp
    );

    if (result.success) {
      return res
        .status(201)
        .json(new Apireponse(200, otp, "Otp sent successfully", true));
    }

    // optional: wait before retrying (exponential backoff)
    if (attempt < MAX_RETRIES) {
      const delay = attempt * 1000; // 1s, then 2s, then 3s
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new ApiError(500, "Failed to send OTP after multiple attempts");
});


