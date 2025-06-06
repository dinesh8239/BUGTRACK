import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js'
import validateSchemaUpdate from '../utils/validation.js'

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        // console.log('Access Token Secret:', process.env.ACCESS_TOKEN_SECRET);
        // console.log('Refresh Token Secret:', process.env.REFRESH_TOKEN_SECRET);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token: " + error.message);
    }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: Refresh token is missing.");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token: User not found.");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token: Token expired or used.");
        }

        const options = {
            httpOnly: true,
            server: true
        };

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully."));
    } catch (error) {
        throw new ApiError(401, error?.message || "Something went wrong while refreshing access token.");
    }
});



export const registerUser = asyncHandler(async (req, res) => {
    try {
        validateSchemaUpdate(req)
        const { userName, email, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {

            throw new ApiError(400, 'User already exists with this email')
        }

        const user = new User({
            userName,
            email,
            password,
            role

        });
        await user.save();
        return res.status(201).json(
            new ApiResponse(201,
                'User created successfully',
                user
            )
        )
    } catch (err) {
        throw new ApiError(500, err?.message || "smoething went wrong while creating User")
    }
});

export const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(400, 'Invalid credentials')
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new ApiError(400, 'Invalid credentials')
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        const loggedInUser = await User.findById(user._id)
            .select("-password -refreshToken")
            .lean()

        const options = {
            httpOnly: true,
            server: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
            )
    } catch (err) {
        throw new ApiError(500, err?.message || "something went wrong while logging in user")
    }
});
