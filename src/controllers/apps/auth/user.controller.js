import crypto from "crypto";
import jwt from 'jsonwebtoken';
import { Sequelize } from "sequelize";
import { UserLoginType,UserRolesEnum } from "../../../constants.js";
import { User } from "../../../models/auth/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findByPk(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
        
    user.refreshToken = refreshToken;
        await user.save({ validate: false });
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating code")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;

    const existedUser = await User.findOne({
    where: {
      [Sequelize.or]: [{ username }, { email }],
    },
    });
    
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
        role: role || UserRolesEnum.USER,
    })

    await user.save({ validate: false });
     const createdUser = await User.findByPk(userId, {
    attributes: {
      exclude: ['password', 'refreshToken', 'emailVerificationToken', 'emailVerificationExpiry'],
    },
     });
    
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while register the user")
    }

     return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "Users registered successfully and verification email has been sent on your email."
      )
    );
})  


const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
    
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

   const user = await User.findOne({
    where: Sequelize.or(
      { username: username },
      { email: email }
    ),
   });
    
    if (!user) {
        throw new ApiError(404,"User does not Exist")
    }

    // Compare the incoming password with hashed password
    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
    );
    
    // get the user document ignoring the password and refreshToken field
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    
    const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    };
    
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
        )
    )
      
})

export {
    loginUser,
    registerUser
}