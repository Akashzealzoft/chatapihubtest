import { User } from "../models/auth/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';

export const verifyJwt = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findByPk(decodedToken?._id, {
    attributes: {
      exclude: ['password', 'refreshToken', 'emailVerificationToken', 'emailVerificationExpiry'],
    },
        });
        if (!user) {
            throw new ApiError(401,"Invalid access Token")
        }
         req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token");
    }
})

export const verifyPermission = (roles = []) =>
    asyncHandler(async (req, res, next) => {
        if (!req.user?._id) {
            throw new ApiError(401,"Unauthorized")
        }
        if (roles.includes(req.user?.role)) {
            next()
        } else {
            throw new ApiError(403,"You are not allowed to perform this action")
        }
    })